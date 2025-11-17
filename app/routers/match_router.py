from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import List
from services.recommend_service import (
    get_proximity_first, get_compatibility_first_recommendations,
    get_fresh_faces_recommendations, get_boosted_tier_recommendations,
    get_age_filtered_recommendations
    )
from fastapi import Query
from utils.deps import get_db, get_current_user
from utils.match_logic import compute_compatibility_score
from schemas.match_schema import MatchFilters, MatchResponse
from models.profile_model import Profile
from models.user_model import User, UserMedia

router = APIRouter(prefix="/matches", tags=["Matches"])




@router.get("/recommendations", response_model=List[MatchResponse])
async def recommend_matches(
    filters: MatchFilters = Depends(),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # 1️⃣ Ensure current user has embedding
    user_profile = await db.scalar(
        select(Profile).where(Profile.user_id == current_user.id)
    )
    if not user_profile or user_profile.embedding is None:
        raise HTTPException(
            status_code=400,
            detail="User profile not ready. Please complete profile creation first."
        )

    # 2️⃣ Fetch candidate users (exclude self, hidden)
    candidates_stmt = (
        select(
            User.id,
            User.full_name,
            User.age,
            User.bio,
            User.latitude,
            User.longitude,
            (1 - (Profile.embedding.l2_distance(user_profile.embedding))).label("similarity")
        )
        .join(Profile, Profile.user_id == User.id)
        .where(
            User.id != current_user.id,
            User.is_profile_hidden.is_(False),
            User.age >= filters.min_age,
            User.age <= filters.max_age,
            Profile.embedding.isnot(None)
        )
        .order_by(func.random())
    )

    result = await db.execute(candidates_stmt)
    candidates = result.all()

    if not candidates:
        return []

    # 🔥 Bulk media lookup
    candidate_ids = [str(r.id) for r in candidates]

    media_stmt = (
        select(UserMedia.user_id, UserMedia.file_path)
        .where(
            UserMedia.user_id.in_(candidate_ids),
            UserMedia.media_type == "image"
        )
        .order_by(UserMedia.created_at)
    )

    media_res = await db.execute(media_stmt)
    media_rows = media_res.all()

    media_map = {}
    for uid, file_url in media_rows:
        uid = str(uid)
        media_map.setdefault(uid, []).append(file_url)

    matches = []

    # 3️⃣ Build match response
    for r in candidates:
        class TempUser:
            def __init__(self, lat, lon):
                self.latitude = lat
                self.longitude = lon

        candidate_obj = TempUser(r.latitude, r.longitude)
        current_user_obj = TempUser(current_user.latitude, current_user.longitude)

        score_data = compute_compatibility_score(
            current_user_obj,
            candidate_obj,
            embedding_similarity=r.similarity,
            max_distance_km=filters.max_distance_km
        )

        uid = str(r.id)

        # 🔥 FIX: Normalize all photo URLs
        normalized_photos = [
            (
                url
                if url.startswith("http")
                else f"http://127.0.0.1:8000/{url.lstrip('/')}"
            )
            for url in media_map.get(uid, [])
        ]

        matches.append(
            MatchResponse(
                user_id=uid,
                full_name=r.full_name or "",
                age=r.age or 0,
                bio=r.bio or "",
                match_score=score_data["match_score"],
                distance_km=score_data["distance_km"],
                photos=normalized_photos
            )
        )

        if len(matches) >= filters.limit:
            break

    matches.sort(key=lambda x: x.match_score, reverse=True)
    return matches




# routes/match_routes.py (add inside your existing router)

@router.get("/recommendations/proximity", response_model=List[MatchResponse])
async def proximity_first_route(
    radius_km: float = 5.0,
    limit: int = 20,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Proximity-first mode:
    Shows nearby users with AI similarity + recency + optional premium boost.
    """
    return await get_proximity_first(
        db=db,
        current_user=current_user,
        radius_km=radius_km,
        limit=limit
    )



@router.get("/recommendations/compatibility", response_model=List[MatchResponse])
async def compatibility_first_route(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    limit: int = 20
):
    """
    Mode 1: Compatibility-first
    Returns AI-personality matches ignoring location.
    """
    matches = await get_compatibility_first_recommendations(
        db=db,
        current_user=current_user,
        limit=limit
    )
    return matches


@router.get("/recommendations/fresh", response_model=List[MatchResponse])
async def fresh_faces_route(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    limit: int = 20
):
    """
    Mode 3: Fresh Faces
    Returns random recently active users (last 24 hours).
    """
    return await get_fresh_faces_recommendations(
        db=db,
        current_user=current_user,
        limit=limit
    )


@router.get("/recommendations/boosted", response_model=List[MatchResponse])
async def boosted_tier_route(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    limit: int = 20
):
    """
    Mode 4: Boosted Tier
    Premium users appear slightly higher in compatibility lists.
    """
    return await get_boosted_tier_recommendations(db, current_user, limit)



@router.get("/recommendations/filtered", response_model=List[MatchResponse])
async def age_filtered_route(
    limit: int = 20,
    min_age: int = 18,
    max_age: int = 100,
    gender: List[str] = Query(None),   # 👈 NEW
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return await get_age_filtered_recommendations(
        db=db,
        current_user=current_user,
        limit=limit,
        min_age=min_age,
        max_age=max_age,
        gender=gender,
    )
