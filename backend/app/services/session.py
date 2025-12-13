import json
from pathlib import Path

SESSIONS_DIR = Path("app/storage/sessions")
SESSIONS_DIR.mkdir(parents=True, exist_ok=True)

def load_session(session_id: str) -> dict:
    path = SESSIONS_DIR / f"{session_id}.json"
    if not path.exists():
        return {}
    return json.loads(path.read_text())

def save_session(session_id: str, data: dict):
    path = SESSIONS_DIR / f"{session_id}.json"
    path.write_text(json.dumps(data, indent=2))
