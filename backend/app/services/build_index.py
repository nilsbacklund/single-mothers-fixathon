import json
from pathlib import Path

PAGES_DIR = Path("app/data/pages")
OUT = Path("app/data/knowledge_index.json")

def build_index():
    index = []

    for f in PAGES_DIR.glob("*.txt"):
        text = f.read_text(encoding="utf-8").lower()
        index.append({
            "source": f.name,
            "path": str(f),
            "length": len(text),
            "preview": text[:500]  # for debugging
        })

    OUT.write_text(json.dumps(index, indent=2), encoding="utf-8")

if __name__ == "__main__":
    build_index()
