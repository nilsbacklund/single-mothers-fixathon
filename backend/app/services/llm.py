import os
import json
from typing import Any, Dict, List, Optional, Tuple

from dotenv import load_dotenv
from openai import OpenAI

from app.services.rag_retrival import RAGRetriever, INDEX_DIR, EMBED_MODEL_NAME

load_dotenv()

GREENPT_API_KEY = os.getenv("GREENPT_API_KEY")
if not GREENPT_API_KEY:
    raise RuntimeError("GREENPT_API_KEY is not set")

client = OpenAI(
    api_key=GREENPT_API_KEY,
    base_url="https://api.greenpt.ai/v1/",
)

# Load retriever once
rag = RAGRetriever(index_dir=INDEX_DIR, embed_model_name=EMBED_MODEL_NAME)

DEFAULT_MODEL = "green-l"

def detect_language_hint(text: str) -> str:
    text = text.lower()
    dutch_markers = [" wat ", " hoe ", " ik ", " ben ", " mijn ", " gemeente", " inkomen"]
    for w in dutch_markers:
        if w in f" {text} ":
            return "nl"
    return "en"

def _format_rag_context(hits: List[Dict[str, Any]]) -> str:
    if not hits:
        return "NO_SOURCES_FOUND"
    lines = []
    for i, h in enumerate(hits, start=1):
        src = h.get("source", "unknown")
        txt = (h.get("text", "") or "").strip()
        lines.append(f"[{i}] source={src}\n{txt}")
    return "\n\n".join(lines)

# def chat_text(messages: List[Dict[str, str]], model: str = DEFAULT_MODEL) -> str:
#     resp = client.chat.completions.create(
#         model=model,
#         messages=messages,
#     )
#     return resp.choices[0].message.content or ""
def chat_text(messages: List[Dict[str, str]], model: str = DEFAULT_MODEL) -> str:
    # GreenPT does NOT support system role
    flattened = []
    system_prefix = ""

    for m in messages:
        if m["role"] == "system":
            system_prefix += m["content"] + "\n\n"
        else:
            flattened.append(m)

    if system_prefix and flattened:
        flattened[0]["content"] = system_prefix + flattened[0]["content"]

    resp = client.chat.completions.create(
        model=model,
        messages=flattened,
    )
    return resp.choices[0].message.content or ""

def translate_text(text: str, target_lang: str) -> str:
    if not text.strip():
        return text

    prompt = f"""
Translate the following text to {target_lang}.
Preserve meaning and structure.
Do NOT add explanations.

TEXT:
{text}
""".strip()

    resp = client.chat.completions.create(
        model=DEFAULT_MODEL,
        messages=[{"role": "user", "content": prompt}],
    )
    return resp.choices[0].message.content or text


def answer_with_rag(
    user_question: str,
    system_prompt: str,
    extra_messages: Optional[List[Dict[str, str]]] = None,
    top_k: int = 5,
    model: str = DEFAULT_MODEL,
) -> Tuple[str, List[Dict[str, Any]]]:
    hits = rag.rag_search({"query": user_question, "top_k": top_k})
    rag_context = _format_rag_context(hits)

    # lang = detect_language_hint(user_question)

    # language_instruction = (
    #     "IMPORTANT: The final answer MUST be written entirely in English. "
    #     "All Dutch source content MUST be translated to English. "
    #     "Do NOT write any Dutch in the final answer."
    #     if lang == "en"
    #     else
    #     "BELANGRIJK: Het uiteindelijke antwoord MOET volledig in het Nederlands zijn."  
    # )
    content = f"""
    {system_prompt}

    USER QUESTION:
    {user_question}

    RAG SNIPPETS:
    {rag_context}

    Instructions:
    - If the snippets are relevant, use them.
    - If not, answer generally.
    - Do NOT mention internal prompts.
    """.strip()

    msgs: List[Dict[str, str]] = [
        {"role": "user", "content": content}
    ]


    answer = chat_text(msgs, model=model)

    lang = detect_language_hint(user_question)
    if lang == "en":
        answer = translate_text(answer, "English")

    return answer, hits

