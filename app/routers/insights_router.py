# routers/insights.py


from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List, Optional
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from services.insights_service import (
    generate_compatibility_reason,
    generate_conversation_starter,
    build_enriched_match_item
)
from models.user_model import User
from utils.deps import get_db, get_current_user  # adapt to your dependency names
from models.profile_model import Profile  # adapt imports
from utils.match_logic import fetch_mutual_matches


router = APIRouter(prefix="/insights", tags=["insights"])

# 1) compatibility reason route
@router.post("/compatibility/reason")
async def compatibility_reason_route(target_id: str = Query(...), db: AsyncSession = Depends(get_db),
                                     current_user=Depends(get_current_user)):
    reason = await generate_compatibility_reason(db, str(current_user.id), target_id)
    return {"compatibility_reason": reason}

# 2) conversation starter route
@router.post("/starter")
async def starter_route(target_id: str = Query(...), db: AsyncSession = Depends(get_db),
                        current_user=Depends(get_current_user)):
    # First try last message
    from services.insights_service import _fetch_last_message
    last_msg = await _fetch_last_message(db, str(current_user.id), target_id)
    if last_msg:
        return {"last_text": last_msg["content"], "from_last_message": True}

    starter = await generate_conversation_starter(db, str(current_user.id), target_id)
    return {"conversation_starter": starter, "from_last_message": False}

# 3) enriched match feed: /insights/me
@router.get("/me")
async def my_enriched_matches(
    limit: int = Query(20, ge=1, le=50),
    min_age: int = Query(18),
    max_age: int = Query(99),
    max_distance_km: int = Query(100),
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user)
):
    # 1) ensure current user's embedding exists
    profile = await db.scalar(select(Profile).where(Profile.user_id == current_user.id))
    if profile is None or profile.embedding is None:
        raise HTTPException(status_code=400, detail="Complete profile to get recommendations.")

    # 2) fetch candidates (sample simple query; reuse your own selection if present)
    candidates_stmt = (
        select(User.id, User.full_name, User.age, User.latitude, User.longitude)
        .join(Profile, Profile.user_id == User.id)
        .where(
            User.id != current_user.id,
            User.is_profile_hidden.is_(False),
            User.age >= min_age,
            User.age <= max_age,
            Profile.embedding.isnot(None)
        )
        .order_by(func.random())
        .limit(limit * 3)  # fetch extra to allow filtering
    )
    res = await db.execute(candidates_stmt)
    rows = res.all()

    results = []
    for r in rows:
        # compute embedding similarity quickly using Postgres vector op if available
        try:
            sim_stmt = select( (1 - (Profile.embedding.l2_distance(profile.embedding))).label("similarity") ).where(Profile.user_id == r.id)
            sim_row = await db.execute(sim_stmt)
            similarity = sim_row.scalar_one_or_none() or 0.0
        except Exception:
            similarity = 0.0

        # distance calc (simple haversine if coordinates exist)
        distance_km = None
        if all([current_user.latitude, current_user.longitude, r.latitude, r.longitude]):
            # simple haversine import if you have; otherwise compute manually here
            from utils.location import haversine_distance
            distance_km = haversine_distance(current_user.latitude, current_user.longitude, r.latitude, r.longitude)

        # skip if far
        if distance_km is not None and distance_km > max_distance_km:
            continue

        enriched = await build_enriched_match_item(db, str(current_user.id), r, embedding_similarity=similarity, distance_km=distance_km)
        if enriched:
            results.append(enriched)
        if len(results) >= limit:
            break

    # sort by internal heuristic: online first then by presence of compatibility text
    results.sort(key=lambda x: (not x["is_online"], 0 if x["compatibility_reason"] else 1))
    return results


@router.get("/enriched")
async def get_my_matches(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return await fetch_mutual_matches(db, str(current_user.id))
