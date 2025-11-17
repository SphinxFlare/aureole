# services/insights_service.py



from typing import Optional, Dict, Any
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from utils.prompts import (
    AI_PROFILE_SYSTEM_PROMPT, make_compatibility_user_prompt,
    STARTER_SYSTEM_PROMPT, make_starter_user_prompt
)
from models.profile_model import Profile
from models.message_model import Message
from models.user_model import User, UserMedia # adjust imports to your project layout
from db.session import client  # your OpenAI client wrapper used earlier
from utils.socket_manager import manager  # if you expose online status; adjust import


# ---- helper queries ----
async def _fetch_profile(db: AsyncSession, user_id: str) -> Optional[Profile]:
    res = await db.execute(select(Profile).where(Profile.user_id == user_id))
    return res.scalar_one_or_none()

async def _fetch_user(db: AsyncSession, user_id: str) -> Optional[User]:
    res = await db.execute(select(User).where(User.id == user_id))
    return res.scalar_one_or_none()

async def _fetch_avatar(db: AsyncSession, user_id: str) -> Optional[str]:
    res = await db.execute(
        select(UserMedia.file_path)
        .where(UserMedia.user_id == user_id)
        .order_by(UserMedia.created_at)
        .limit(1)
    )
    row = res.first()
    return row[0] if row else None

async def _fetch_last_message(db: AsyncSession, user_a: str, user_b: str) -> Optional[Dict[str, Any]]:
    res = await db.execute(
        select(Message)
        .where(
            ((Message.sender_id == user_a) & (Message.receiver_id == user_b)) |
            ((Message.sender_id == user_b) & (Message.receiver_id == user_a))
        )
        .order_by(Message.created_at.desc())
        .limit(1)
    )
    msg = res.scalar_one_or_none()
    if not msg:
        return None
    return {
        "content": msg.content,
        "created_at": msg.created_at,
        "sender_id": str(msg.sender_id)
    }

# ---- internal helpers ----
def _compute_overlap_and_conflict(a_p: Dict, b_p: Dict):
    """Compute interests overlap and dealbreaker conflicts internally. Returns (overlap, conflicts)."""
    a_interests = set([i.lower() for i in (a_p.get('preferences', {}).get('interests') or [])])
    b_interests = set([i.lower() for i in (b_p.get('preferences', {}).get('interests') or [])])
    overlap = list(a_interests & b_interests)

    a_deal = set([d.lower() for d in (a_p.get('preferences', {}).get('dealbreakers') or [])])
    b_deal = set([d.lower() for d in (b_p.get('preferences', {}).get('dealbreakers') or [])])

    conflicts = []
    # conflict if A's dealbreaker present in B's interests or vice-versa (simple heuristic)
    if a_deal & b_interests:
        conflicts += [f"A_deal_vs_B_interest:{x}" for x in (a_deal & b_interests)]
    if b_deal & a_interests:
        conflicts += [f"B_deal_vs_A_interest:{x}" for x in (b_deal & a_interests)]
    # also if both have opposing dealbreakers (both list each other's core dealbreakers)
    if a_deal & b_deal:
        conflicts += [f"mutual_deal:{x}" for x in (a_deal & b_deal)]

    return overlap, conflicts

# ---- AI wrappers ----
async def _call_ai_single_sentence(system_prompt: str, user_prompt: str, timeout: int = 15) -> str:
    """Call chat completions and return plain text. Safe, with fallback."""
    try:
        resp = await client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            max_tokens=60,
            timeout=timeout
        )
        text = resp.choices[0].message.content.strip()
        # sanitize single line
        return " ".join(text.splitlines()).strip()
    except Exception as e:
        # log & fallback
        print(f"[AI ERROR] {_call_ai_single_sentence.__name__}: {e}")
        return None

# ---- Public services ----
async def generate_compatibility_reason(db: AsyncSession, current_user_id: str, target_user_id: str,
                                        embedding_similarity: Optional[float] = None,
                                        distance_km: Optional[float] = None) -> str:
    """
    Returns a single-sentence compatibility reason. Uses internal overlap/conflict to improve prompt.
    Input selection limited to AI-driven profile fields (per 'A' option).
    """
    # fetch profiles
    a_profile = await _fetch_profile(db, current_user_id)
    b_profile = await _fetch_profile(db, target_user_id)
    if not a_profile or not b_profile:
        return "Not enough profile data to generate a compatibility reason."

    # prepare minimal objects
    a = {
        "ai_summary": a_profile.ai_summary,
        "mini_traits": a_profile.mini_traits or [],
        "preferences": a_profile.preferences or {},
        "raw_about": (a_profile.raw_prompts or {}).get("about", "")
    }
    b = {
        "ai_summary": b_profile.ai_summary,
        "mini_traits": b_profile.mini_traits or [],
        "preferences": b_profile.preferences or {},
        "raw_about": (b_profile.raw_prompts or {}).get("about", "")
    }

    overlap, conflicts = _compute_overlap_and_conflict(a, b)
    meta = {
        "embedding_similarity": float(embedding_similarity) if embedding_similarity is not None else None,
        "distance_km": distance_km,
        "age_diff": None  # optional: populate if you pull ages
    }

    user_prompt = make_compatibility_user_prompt(a, b, meta)
    # Add overlap/conflicts to prompt as internal-only hints (not returned)
    if overlap:
        user_prompt += f"\n\nInternal Overlap: {', '.join(overlap)}"
    if conflicts:
        user_prompt += f"\n\nInternal Conflicts: {', '.join(conflicts)}"

    reason = await _call_ai_single_sentence(AI_PROFILE_SYSTEM_PROMPT, user_prompt)
    if not reason:
        # fallback deterministic summary
        if overlap:
            reason = f"You share {len(overlap)} interest(s) — this suggests shared activities and easy conversation."
        else:
            reason = "Profiles show complementary traits that could lead to interesting conversations."

    return reason

async def generate_conversation_starter(db: AsyncSession, current_user_id: str, target_user_id: str,
                                        compatibility_reason: Optional[str] = None) -> str:
    """
    Generate ONE deep, personalized conversation starter for current_user -> target_user.
    Uses compatibility_reason as context if provided.
    """
    a_profile = await _fetch_profile(db, current_user_id)
    b_profile = await _fetch_profile(db, target_user_id)
    if not a_profile or not b_profile:
        return "Let's start a conversation — ask about their favourite recent moment."

    a = {
        "ai_summary": a_profile.ai_summary,
        "mini_traits": a_profile.mini_traits or [],
        "preferences": a_profile.preferences or {},
    }
    b = {
        "ai_summary": b_profile.ai_summary,
        "mini_traits": b_profile.mini_traits or [],
        "preferences": b_profile.preferences or {},
    }

    user_prompt = make_starter_user_prompt(a, b, compatibility_reason or "")
    # attach internal overlap/conflict as hint (not returned)
    overlap, conflicts = _compute_overlap_and_conflict(a, b)
    if overlap:
        user_prompt += f"\n\nInternal Overlap: {', '.join(overlap)}"
    if conflicts:
        user_prompt += f"\n\nInternal Conflicts: {', '.join(conflicts)}"

    starter = await _call_ai_single_sentence(STARTER_SYSTEM_PROMPT, user_prompt, timeout=20)
    if not starter:
        # fallback starter based on overlap or general deep-open
        if overlap:
            starter = f"What's a small memory from the last trip you took that still makes you smile?"
        else:
            starter = "Tell me about the last moment that surprised you — I love hearing small stories."

    return starter

# ---- Final enriched feed (used by /insights/me) ----
async def build_enriched_match_item(db: AsyncSession, current_user_id: str, candidate_row: Any,
                                    embedding_similarity: float, distance_km: Optional[float]) -> Dict:
    """
    Given a SQLAlchemy row (user fields) and embedding similarity, return the enriched match dict.
    candidate_row expected to contain at least user id, name, age, bio fields (adapt to your select).
    """
    target_id = str(candidate_row.id)
    # fetch user/profile/media
    profile = await _fetch_profile(db, target_id)
    user = await _fetch_user(db, target_id)
    avatar = await _fetch_avatar(db, target_id)

    # required minimal sanity checks
    if not profile or not user:
        return None

    # compute compatibility reason (AI call) - internal overlap/conflict used
    try:
        compatibility_reason = await generate_compatibility_reason(
            db, current_user_id, target_id, embedding_similarity=embedding_similarity, distance_km=distance_km
        )
    except Exception as e:
        print(f"[compatibility error] {e}")
        compatibility_reason = "A promising connection based on personality and interests."

    # conversation starter or last message override
    last_msg = await _fetch_last_message(db, current_user_id, target_id)
    if last_msg:
        conversation_text = last_msg["content"]
    else:
        try:
            conversation_text = await generate_conversation_starter(db, current_user_id, target_id, compatibility_reason)
        except Exception as e:
            print(f"[starter error] {e}")
            conversation_text = "Say hi — ask about what made their week interesting."

    # online status (if you have manager)
    try:
        is_online = bool(manager.active_connections.get(target_id))
    except Exception:
        is_online = False

    item = {
        "user_id": target_id,
        "full_name": user.full_name or "",
        "age": user.age,
        "avatar": avatar or "/images/default-avatar.png",
        "mini_traits": profile.mini_traits or [],
        "ai_summary": profile.ai_summary or "",
        "compatibility_reason": compatibility_reason,
        "conversation_starter": conversation_text,
        "last_active": getattr(user, "last_active", None),
        "is_online": is_online
    }
    return item
