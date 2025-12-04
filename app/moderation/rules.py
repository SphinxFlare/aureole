# app/moderation/rules.py

import re

# Strong profanity: auto-delete
HARD_BANNED = {
    "fuck", "fucking", "motherfucker",
    "bitch", "slut", "whore", "cunt",
    "nigger", "nigga",
    "retard", "retarded",
}

# General insults: add score, but not auto-delete alone
INSULT_WORDS = {
    "ugly", "stupid", "idiot",
    "dumb", "loser", "worthless",
    "moron", "trash",
}

# Sexual content
SEXUAL_WORDS = {
    "sex", "sexy", "horny",
    "nude", "naked",
    "boobs", "tits",
    "cock", "dick",
    "pussy",
}

# Asking for sensitive info (OTP, bank, password, etc.)
SENSITIVE_PATTERNS = [
    re.compile(r"\b(send|give|share)\s+(me\s+)?(otp|password|bank|account|cvv)\b"),
    re.compile(r"\bwhat\s+is\s+your\s+address\b"),
    re.compile(r"\bshare\s+(your\s+)?(photo|pic|nude)\b"),
]

# Threats / self-harm / violence
THREAT_PATTERNS = [
    re.compile(r"\b(kill|hurt|murder)\s+you\b"),
    re.compile(r"\bgo\s+die\b"),
    re.compile(r"\bcommit\s+suicide\b"),
]