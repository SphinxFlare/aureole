# app/moderation/filter.py

from dataclasses import dataclass
from typing import List

from .normalize import normalize_text
from .evaluator import evaluate_text


@dataclass
class ModerationResult:
    allowed: bool  # always True in post-delivery mode
    delete: bool   # whether the message content should be removed
    flag: bool     # whether to mark is_flagged=True
    reasons: List[str]


def moderate_message(text: str) -> ModerationResult:
    """
    Purely rule-based moderation.
    - Never blocks delivery (allowed=True).
    - Decides deletion/flagging based on score.
    """
    normalized = normalize_text(text)
    tokens = normalized.split()

    if not tokens:
        return ModerationResult(True, False, False, [])

    eval_result = evaluate_text(tokens)
    score = eval_result["score"]
    reasons = eval_result["reasons"]

    # Hard banned: auto-delete + flag
    if score >= 999 or "hard_banned" in reasons:
        return ModerationResult(
            allowed=True,
            delete=True,
            flag=True,
            reasons=list(set(reasons + ["hard_banned"])),
        )

    # Aggressive threshold → delete
    if score >= 7:
        return ModerationResult(
            allowed=True,
            delete=True,
            flag=True,
            reasons=list(set(reasons)),
        )

    # Medium toxicity → keep but flag
    if 3 <= score < 7:
        return ModerationResult(
            allowed=True,
            delete=False,
            flag=True,
            reasons=list(set(reasons)),
        )

    # Low/no toxicity → do nothing
    return ModerationResult(
        allowed=True,
        delete=False,
        flag=False,
        reasons=list(set(reasons)),
    )