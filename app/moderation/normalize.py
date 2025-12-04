# app/moderation/normalize.py

import re
import unicodedata

# Basic leetspeak replacement (expand later if needed)
LEET_MAP = {
    "4": "a",
    "@": "a",
    "3": "e",
    "1": "l",
    "!": "i",
    "0": "o",
    "$": "s",
    "7": "t",
}


def normalize_text(text: str) -> str:
    """
    Normalize text to make profanity detection harder to evade:
    - lowercase
    - strip accents
    - replace simple leetspeak
    - collapse non-alphanumerics into spaces
    - collapse multiple spaces
    """
    if not text:
        return ""

    t = text.lower()

    # Normalize unicode → separate accents, etc.
    t = unicodedata.normalize("NFKD", t)
    t = "".join(ch for ch in t if not unicodedata.combining(ch))

    # Basic leetspeak replacements
    for k, v in LEET_MAP.items():
        t = t.replace(k, v)

    # Replace any non-alphanumeric sequences with a space
    t = re.sub(r"[^a-z0-9]+", " ", t)

    # Collapse spaces
    t = re.sub(r"\s+", " ", t).strip()

    return t