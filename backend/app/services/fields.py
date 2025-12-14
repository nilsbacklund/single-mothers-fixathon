import json
from pathlib import Path

FIELDS = json.loads(
    Path("app/data/fields.json").read_text(encoding="utf-8")
)
