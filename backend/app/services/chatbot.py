from app.services.extractor import extract_user_info
from app.services.session import load_session, save_session
from app.services.eligibility import check_eligibility, SCHEMES
from app.services.ranking import rank_schemes
from app.services.llm import chat

FIELD_QUESTIONS = {
    "municipality": (
        "Which municipality do you live in?"
    ),
    "monthly_income": (
        "A rough estimate is enough. About how much is your monthly net income?"
    ),
    "children": (
        "How many children under 18 live with you?"
    )
}


def chatbot_step(session_id: str, user_message: str):
    profile = load_session(session_id)

    extracted = extract_user_info(user_message)
    for k, v in extracted.items():
        if v is not None:
            profile[k] = v

    save_session(session_id, profile)

    # find missing fields dynamically
    required = set(f for s in SCHEMES for f in s["required_fields"])
    missing = [f for f in required if f not in profile]

    if missing:
        return {
            "reply": FIELD_QUESTIONS[missing[0]],
            "profile": profile,
            "schemes": []
        }

    schemes = rank_schemes(check_eligibility(profile))

    explanation = chat([
        {"role": "system", "content": "Explain kindly and clearly."},
        {"role": "user", "content": f"Profile: {profile}\nSchemes: {schemes}"}
    ])

    return {
        "reply": explanation,
        "profile": profile,
        "schemes": schemes
    }
