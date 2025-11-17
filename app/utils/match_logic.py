# utils/match_logic.py


import math
import uuid
import random
from typing import List
from models.message_model import Message
from datetime import datetime, timezone
from sqlalchemy import select, func, or_
from utils.location import haversine_distance
from models.message_model import Message
from models.match_model import Match
from models.profile_model import Profile
from models.user_model import Notification, UserMedia, User
from sqlalchemy.ext.asyncio import AsyncSession

def compute_compatibility_score(user_a, user_b, embedding_similarity: float, max_distance_km: float = 50):
    """Global logic for computing compatibility between two users."""
    
    # --- Handle missing location gracefully ---
    if all([user_a.latitude, user_a.longitude, user_b.latitude, user_b.longitude]):
        distance_km = haversine_distance(
            user_a.latitude, user_a.longitude,
            user_b.latitude, user_b.longitude
        )
        if distance_km > max_distance_km:
            proximity_score = 0
        else:
            proximity_score = max(0, 1 - (distance_km / max_distance_km))
    else:
        distance_km = None
        proximity_score = 0.5  # neutral fallback

    # --- Core AI similarity ---
    personality_score = max(0, min(1, embedding_similarity or 0))

    # --- Weighted final compatibility ---
    final_score = (personality_score * 0.7) + (proximity_score * 0.3)
    match_score = math.floor(final_score * 100)

    return {
        "match_score": match_score,   # final compatibility %
        "distance_km": round(distance_km, 2) if distance_km else None
    }

# -----------------------------
# Helper: Create Notification
# -----------------------------
async def create_notification(db: AsyncSession, user_id: str, type: str, payload: dict | None = None):
    """
    Create a notification row and commit.
    Returns the Notification instance.
    """
    notif = Notification(
        id=uuid.uuid4(),
        user_id=user_id,
        type=type,
        payload=payload or {},
        is_read=False
    )
    db.add(notif)
    await db.commit()
    # refresh optional if you need DB-generated fields
    await db.refresh(notif)
    return notif


def generate_conversation_starters(mutual_interests: List[str], common_values: List[str], profile_summary: str = "") -> List[str]:
    """Generate dynamic conversation starters for a match."""
    starters = []

    if mutual_interests:
        starters.append(f"Have you tried {random.choice(mutual_interests)} recently?")
    if common_values:
        starters.append(f"What does {random.choice(common_values)} mean to you?")
    
    # AI/profile-based fallback if no interests/values
    if not starters and profile_summary:
        starters.append(f"I read in your bio: '{profile_summary}'. Can you tell me more about that?")
    
    # Generic fallback pool
    generic_pool = [
        "What's your favorite way to spend a weekend?",
        "Do you have a dream travel destination?",
        "What's your favorite book or movie?",
        "What's a hobby you wish you had more time for?",
        "What's your go-to comfort food?"
    ]
    # Add random generic questions until we have 3 starters
    while len(starters) < 3:
        starters.append(random.choice(generic_pool))
    
    return starters[:3]


async def get_last_message(db: AsyncSession, user_id: str, target_id: str):
    q = await db.execute(
        select(Message)
        .where(
            or_(
                (Message.sender_id == user_id) & (Message.receiver_id == target_id),
                (Message.sender_id == target_id) & (Message.receiver_id == user_id),
            )
        )
        .order_by(Message.created_at.desc())
        .limit(1)
    )
    return q.scalar_one_or_none()


async def fetch_mutual_matches(db: AsyncSession, current_user_id: str):
    result = await db.execute(
        select(Match)
        .where(
            Match.is_mutual.is_(True),
            Match.is_active.is_(True),
            Match.user_id == current_user_id,
        )
        .order_by(Match.matched_at.desc())
    )
    matches = result.scalars().all()
    if not matches:
        return []

    enriched = []
    now = datetime.now(timezone.utc)

    for m in matches:
        target_user = await db.scalar(select(User).where(User.id == m.target_id))
        if not target_user:
            continue

        is_online = False
        if target_user.last_active:
            diff = now - target_user.last_active
            is_online = diff.total_seconds() < 300

        profile = await db.scalar(select(Profile).where(Profile.user_id == m.target_id))

        # ⭐ CORRECT NEW AVATAR LOGIC ⭐
        avatar = None

        # priority 1: user chosen avatar
        if target_user.profile_photo:
            avatar = target_user.profile_photo

        else:
            # priority 2: last uploaded media
            media = await db.scalar(
                select(UserMedia)
                .where(UserMedia.user_id == m.target_id)
                .order_by(UserMedia.created_at.desc())
                .limit(1)
            )
            if media:
                avatar = media.file_path

        # priority 3: fallback default
        if not avatar:
            avatar = "/images/default-avatar.png"

        last_msg = await get_last_message(db, current_user_id, m.target_id)
        starter = last_msg.content if last_msg else (m.conversation_starter or "")

        enriched.append({
            "user_id": str(m.target_id),
            "full_name": target_user.full_name,
            "age": target_user.age,
            "avatar": avatar,
            "mini_traits": profile.preferences.get("values", []) if profile and profile.preferences else [],
            "ai_summary": profile.ai_summary if profile else "",
            "compatibility_reason": m.compatibility_reason or "",
            "conversation_starter": starter,
            "last_active": target_user.last_active.isoformat() if target_user.last_active else None,
            "is_online": is_online,
        })

    return enriched
