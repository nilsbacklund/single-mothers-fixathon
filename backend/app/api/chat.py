from fastapi import APIRouter
from app.services.chatbot import chatbot_step

router = APIRouter()

@router.post("/chat")
def chat(session_id: str, message: str):
    return chatbot_step(session_id, message)
