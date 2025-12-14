from typing import Optional
from fastapi import APIRouter, Body
from pydantic import BaseModel

from app.services.chatbot import chatbot_step
from app.services.session import load_session

router = APIRouter()

class ChatBody(BaseModel):
    session_id: str
    message: str

@router.post("/chat")
def chat(
    session_id: Optional[str] = None,
    message: Optional[str] = None,
    body: Optional[ChatBody] = Body(default=None),
):
    # Accept either:
    # 1) /chat?session_id=...&message=...   (your current frontend)
    # 2) JSON body {session_id, message}
    if body is not None:
        session_id = body.session_id
        message = body.message

    if not session_id or not message:
        return {"error": "Missing session_id or message"}

    return chatbot_step(session_id, message)

@router.get("/session/{session_id}")
def get_session(session_id: str):
    return load_session(session_id)
