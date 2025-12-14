import os
import re
from typing import Dict, Any

from app.services.extractor import extract_user_info
from app.services.session import load_session, save_session
from app.services.fields import FIELDS
from app.services.llm import answer_with_rag

# Subsidy ranking
from app.services.subsidy_ranker import UserProfile, filter_then_rank
from app.services.subsidy_loader import get_subsidy_df


# -------------------------
# Language detection
# -------------------------

def detect_language(text: str) -> str:
    if re.search(r"\b(the|what|why|how|can i|eligible)\b", text.lower()):
        return "en"
    return "nl"


# -------------------------
# Mapping ranked subsidies → frontend programs
# -------------------------

def ranked_to_programs(ranked):
    programs = []
    for r in ranked:
        programs.append({
            "id": r.get("cvdr_id") or r.get("title"),
            "title": r.get("title", ""),
            "description": r.get("benefit_summary", ""),
            "category": r.get("category", "Municipal support"),
            "confidence": r.get("confidence", "medium"),
            "applicationTime": None,
            "processingTime": None,
            "url": r.get("url"),
        })
    return programs


# -------------------------
# Configuration
# -------------------------

INTAKE_ORDER = [
    "age",
    "municipality",
    "children",
    "monthly_income",
]


# -------------------------
# Main entry point
# -------------------------

def chatbot_step(session_id: str, user_message: str) -> Dict[str, Any]:
    profile = load_session(session_id) or {}
    mode = profile.get("_mode", "intake")

    # Detect and persist language ONCE
    if "_lang" not in profile:
        profile["_lang"] = detect_language(user_message)

    # -------------------------
    # RESULTS MODE → follow-ups
    # -------------------------
    if mode == "results":
        return _answer_followup(profile, session_id, user_message)

    # -------------------------
    # INTAKE MODE
    # -------------------------
    extracted = extract_user_info(user_message)
    for k, v in extracted.items():
        if v is not None:
            profile[k] = v

    save_session(session_id, profile)

    # Ask next missing field
    for field in INTAKE_ORDER:
        if profile.get(field) is None:
            return {
                "reply": FIELDS[field]["question"],
                "profile": profile,
                "mode": "intake",
                "schemes": [],
                "missing_fields": [f for f in INTAKE_ORDER if profile.get(f) is None],
                "sources": [],
            }

    # -------------------------
    # INTAKE COMPLETE → RANK
    # -------------------------

    ranker_profile = UserProfile(
        is_single_parent=True,
        children_u18=profile.get("children"),
        net_income_monthly_eur=profile.get("monthly_income"),
        municipality=profile.get("municipality", ""),
    )

    df = get_subsidy_df()

    rank_result = filter_then_rank(
        df,
        ranker_profile,
        model="green-l",
        api_key=os.getenv("GREENPT_API_KEY"),
        base_url="https://api.greenpt.ai/v1/",
        top_k=10,
    )

    ranked = rank_result.get("ranked", [])
    programs = ranked_to_programs(ranked)

    # Language-aware system prompt
    language_instruction = (
        "Write the final answer entirely in English."
        if profile["_lang"] == "en"
        else "Schrijf het uiteindelijke antwoord volledig in het Nederlands."
    )

    system_prompt = f"""
You are Hulpwijzer, a helpful guide for Dutch support schemes.

Rules:
- Explain results clearly and practically.
- Do not claim legal certainty.
- Base explanations only on the ranked subsidies and RAG snippets.
- If something is unknown, say so.
- {language_instruction}
""".strip()

    explanation_prompt = f"""
User profile:
{profile}

Ranked subsidies:
{ranked}

Explain:
- which subsidies are most relevant
- why they apply
- what the user should do next
""".strip()

    explanation, hits = answer_with_rag(
        user_question=explanation_prompt,
        system_prompt=system_prompt,
        top_k=5,
    )

    # Persist results
    profile["_ranked_subsidies"] = programs
    profile["_explanation"] = explanation
    profile["_mode"] = "results"

    save_session(session_id, profile)

    return {
        "reply": explanation,
        "profile": profile,
        "mode": "results",
        "schemes": programs,
        "missing_fields": [],
        "sources": hits,
    }


# -------------------------
# FOLLOW-UP HANDLER
# -------------------------

def _answer_followup(profile: dict, session_id: str, user_message: str) -> Dict[str, Any]:
    language_instruction = (
        "Write the final answer entirely in English."
        if profile["_lang"] == "en"
        else "Schrijf het uiteindelijke antwoord volledig in het Nederlands."
    )

    system_prompt = f"""
You are Hulpwijzer.
You are answering follow-up questions about previously shown subsidies.

Rules:
- Be concise, practical, and grounded.
- Do not claim legal certainty.
- Base answers ONLY on the provided context.
- {language_instruction}
""".strip()

    context = f"""
User profile:
{profile}

Ranked subsidies:
{profile.get("_ranked_subsidies", [])}

Previous explanation:
{profile.get("_explanation", "")}

User follow-up question:
{user_message}
""".strip()

    answer, hits = answer_with_rag(
        user_question=context,
        system_prompt=system_prompt,
        top_k=5,
    )

    return {
        "reply": answer,
        "profile": profile,
        "mode": "results",
        "schemes": profile.get("_ranked_subsidies", []),
        "sources": hits,
    }
