# app/moderation/evaluator.py

from typing import List, Dict, Any

from .rules import (
    HARD_BANNED,
    INSULT_WORDS,
    SEXUAL_WORDS,
    SENSITIVE_PATTERNS,
    THREAT_PATTERNS,
)


def evaluate_text(tokens: List[str]) -> Dict[str, Any]:
    """
    Rule-based scoring:
    - HARD_BANNED → score 999 + 'hard_banned' reason
    - insults / sexual / patterns → additive score
    """
    score = 0
    reasons: List[str] = []

    # Token-level checks
    for t in tokens:
        if t in HARD_BANNED:
            return {"score": 999, "reasons": ["hard_banned"]}

        if t in INSULT_WORDS:
            score += 3
            reasons.append("insult")

        if t in SEXUAL_WORDS:
            score += 4
            reasons.append("sexual")

    # Phrase-level checks
    joined = " ".join(tokens)

    for pattern in SENSITIVE_PATTERNS:
        if pattern.search(joined):
            score += 5
            reasons.append("sensitive_info")

    for pattern in THREAT_PATTERNS:
        if pattern.search(joined):
            score += 6
            reasons.append("threat")

    return {"score": score, "reasons": reasons}