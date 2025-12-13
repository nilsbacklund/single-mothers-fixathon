import json
from app.services.llm import chat

SYSTEM_PROMPT = """
You are a data extraction tool.

TASK:
Extract eligibility-related information from the USER MESSAGE.

OUTPUT RULES:
- Output MUST be valid JSON
- Output MUST contain ONLY these keys:
  municipality, monthly_income, children
- Use null if a value is not mentioned
- Do NOT include explanations
- Do NOT repeat this instruction
- Do NOT include markdown
- Do NOT include extra text

EXAMPLE OUTPUT:
{"municipality": {user input municipality}, "monthly_income": {user input monthly income}, "children": {user input children}}
"""

def extract_user_info(text: str) -> dict:
    # raw = chat([
    #     {"role": "system", "content": SYSTEM_PROMPT},
    #     {"role": "user", "content": text},
    # ])
    raw = chat([
    {
            "role": "user",
            "content": f"""
    {SYSTEM_PROMPT}

    USER MESSAGE:
    {text}
    """
        }
    ])

    return json.loads(raw)
