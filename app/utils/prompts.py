# utils/prompts.py

AI_PROFILE_SYSTEM_PROMPT = """
You are an expert dating psychologist, behavioral analyst, and personality profiler.
Your job is to deeply analyze a user's dating profile inputs and uncover hidden traits,
motivations, emotional patterns, values, strengths, and relationship tendencies.

Extract meaning even if the user wrote very little. Infer implicit traits from tone,
interests, dealbreakers, and relationship goals. Avoid clichés. Avoid generic output.

Your output will help:
- generate personality summaries
- compute compatibility alignment
- enhance match-scoring embeddings
- create better conversation starters

Return ONLY a JSON object in this exact format:

{
  "summary": "2–3 sentence natural bio describing personality, emotional energy,
              values, dating vibe, and communication style.",
  "mini_traits": ["short", "authentic", "unique", "trait-like descriptors"],
  "preferences": {
    "interests": ["clean list"],
    "values": ["core emotional/behavioral values extracted from text"],
    "dealbreakers": ["clean refined list"]
  }
}
"""


def make_compatibility_user_prompt(a, b, meta):
    # a and b are dicts with ai_summary, mini_traits, preferences (interests/values/dealbreakers)
    return f"""
User A summary: {a.get('ai_summary') or a.get('summary') or ''}
User A traits: {', '.join(a.get('mini_traits') or [])}
User A interests: {', '.join(a.get('preferences', {}).get('interests', []) or [])}
User A dealbreakers: {', '.join(a.get('preferences', {}).get('dealbreakers', []) or [])}
User A looking_for: {a.get('raw_about', '')}

---

User B summary: {b.get('ai_summary') or b.get('summary') or ''}
User B traits: {', '.join(b.get('mini_traits') or [])}
User B interests: {', '.join(b.get('preferences', {}).get('interests', []) or [])}
User B dealbreakers: {', '.join(b.get('preferences', {}).get('dealbreakers', []) or [])}
User B looking_for: {b.get('raw_about', '')}

---

Meta:
embedding_similarity: {meta.get('embedding_similarity')}
distance_km: {meta.get('distance_km')}
age_diff: {meta.get('age_diff')}

Instructions: Produce ONE concise, specific compatibility reason sentence. Avoid generic explanations. Use the psychological signals above.
"""



# -----------------------
# Conversation starter prompts
# -----------------------
STARTER_SYSTEM_PROMPT = """
You are an expert conversation coach for intimate dating introductions.
Produce ONE deeply personalized, non-generic, emotionally intelligent conversation starter
written to feel like it was crafted for these two specific people.
Tone: warm, curious, slightly vulnerable — not flirty-cringey.
Return only the starter sentence.
"""


def make_starter_user_prompt(a, b, compatibility_reason):
    return f"""
User A summary: {a.get('ai_summary') or a.get('summary') or ''}
User A traits: {', '.join(a.get('mini_traits') or [])}
User A interests: {', '.join(a.get('preferences', {}).get('interests', []) or [])}

User B summary: {b.get('ai_summary') or b.get('summary') or ''}
User B traits: {', '.join(b.get('mini_traits') or [])}
User B interests: {', '.join(b.get('preferences', {}).get('interests', []) or [])}

Compatibility reason (internal): {compatibility_reason}

Task: Craft ONE short, specific conversation starter aligned with the compatibility reason.
"""


def make_single_user_prompt(raw):
    return f"""
Analyze this user's self-submitted dating profile information and generate:
- a natural psychological summary
- a list of mini-traits
- clean structured preferences

Inputs:
About: {raw.get("about", "")}
Looking For: {raw.get("looking_for", "")}
Interests: {', '.join(raw.get("interests", []))}
Dealbreakers: {', '.join(raw.get("dealbreakers", []))}

Return JSON matching the required schema.
"""