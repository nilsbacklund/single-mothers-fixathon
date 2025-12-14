import re
from typing import Dict, Any
import json
from app.services.llm import chat_text

SYSTEM_PROMPT = """
You are a strict data extraction tool.

TASK:
Extract eligibility-related information from the USER MESSAGE.

OUTPUT RULES:
- Output MUST be valid JSON
- Output MUST contain ONLY these keys:
  age, municipality, monthly_income, children
- Use null if a value is not mentioned or is unclear
- Do NOT include explanations
- Do NOT include markdown
- Do NOT include extra text

EXAMPLE OUTPUT:
{"age": "25","municipality": "Delft", "monthly_income": 1800, "children": 1}
"""

def extract_user_info(text: str) -> Dict[str, Any]:
    text = text.strip()

    # ---------- HARD RULES ----------

    # Age
    if re.fullmatch(r"\d{1,3}", text):
        return {
            "age": int(text),
            "municipality": None,
            "children": None,
            "monthly_income": None,
        }

    # Municipality (single word or short phrase, capitalized)
    if re.fullmatch(r"[A-Za-z\- ]{2,}", text) and text[0].isupper():
        return {
            "age": None,
            "municipality": text,
            "children": None,
            "monthly_income": None,
        }

    # Children
    m = re.search(r"(\d+)\s*(child|children)", text.lower())
    if m:
        return {
            "age": None,
            "municipality": None,
            "children": int(m.group(1)),
            "monthly_income": None,
        }

    # Income
    m = re.search(r"(\d{3,5})", text.replace(",", ""))
    if m:
        return {
            "age": None,
            "municipality": None,
            "children": None,
            "monthly_income": int(m.group(1)),
        }

    # Otherwise fall back to LLM extraction
    raw = chat_text([{
        "role": "user",
        "content": f"""
    {SYSTEM_PROMPT}

    USER MESSAGE:
    {text}
    """.strip()
        }
    ])
    # best-effort parse
    try:
        return json.loads(raw)
    except Exception:
        # fallback: return empty extraction if model returns junk
        return {"age": None, "municipality": None, "monthly_income": None, "children": None}
