from fastapi import APIRouter
from app.services.session import load_session
from app.services.eligibility import check_eligibility, SCHEMES
from app.services.ranking import rank_schemes
from app.services.chatbot import _required_fields_from_schemes

router = APIRouter()

@router.get("/state")
def get_state(session_id: str):
    profile = load_session(session_id)

    required_fields = _required_fields_from_schemes(SCHEMES)
    missing = [f for f in required_fields if profile.get(f) is None]

    if missing:
        return {
            "profile": profile,
            "schemes": [],
            "complete": False,
            "missing_fields": missing,
        }

    eligible = rank_schemes(check_eligibility(profile))
    return {
        "profile": profile,
        "schemes": eligible,
        "complete": True,
        "missing_fields": [],
    }
