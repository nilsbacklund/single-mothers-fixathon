import json
import re
from dataclasses import dataclass, asdict
from pathlib import Path
from typing import List, Dict, Any, Tuple

import numpy as np
import faiss
from sentence_transformers import SentenceTransformer


# ----------------------------
# Config
# ----------------------------
BASE_DIR = Path(__file__).resolve().parents[2]
DATA_DIR = BASE_DIR / "app" / "data" / "rag_data"
OUT_DIR = BASE_DIR / "app" / "data" / "rag_index"
OUT_DIR.mkdir(parents=True, exist_ok=True)

EMBED_MODEL_NAME = "sentence-transformers/all-MiniLM-L6-v2"
CHUNK_CHARS = 1800
CHUNK_OVERLAP = 250


# ----------------------------
# Data structure
# ----------------------------
@dataclass
class Chunk:
    id: str
    text: str
    source: str
    start_char: int
    end_char: int


# ----------------------------
# Helpers
# ----------------------------
def clean_text(s: str) -> str:
    s = s.replace("\r\n", "\n").replace("\r", "\n")
    s = re.sub(r"[ \t]+", " ", s)
    s = re.sub(r"\n{3,}", "\n\n", s)
    return s.strip()

def read_text_file(path: Path) -> str:
    return path.read_text(encoding="utf-8", errors="ignore")

def load_documents(data_dir: Path) -> List[Tuple[str, str]]:
    docs: List[Tuple[str, str]] = []
    for p in sorted(data_dir.rglob("*")):
        if p.is_dir():
            continue
        ext = p.suffix.lower()
        rel = str(p.relative_to(data_dir))
        if ext in [".txt", ".md"]:
            docs.append((rel, read_text_file(p)))
        else:
            raise ValueError(f"Unsupported file type: {ext} ({rel})")
    return docs

def chunk_text(text: str, source: str, chunk_chars: int, overlap: int) -> List[Chunk]:
    text = clean_text(text)
    chunks: List[Chunk] = []
    start = 0
    idx = 0
    n = len(text)

    while start < n:
        end = min(n, start + chunk_chars)
        chunk_str = text[start:end].strip()
        if chunk_str:
            cid = f"{source}::chunk_{idx}"
            chunks.append(Chunk(
                id=cid,
                text=chunk_str,
                source=source,
                start_char=start,
                end_char=end
            ))
            idx += 1

        if end >= n:
            break
        start = max(0, end - overlap)

    return chunks

def l2_normalize(x: np.ndarray) -> np.ndarray:
    norm = np.linalg.norm(x, axis=1, keepdims=True) + 1e-12
    return x / norm


# ----------------------------
# Build
# ----------------------------
def main():
    print(f"Loading documents from: {DATA_DIR.resolve()}")
    docs = load_documents(DATA_DIR)
    if not docs:
        raise SystemExit(f"No documents found. Put .txt/.md/.pdf in path: {DATA_DIR.resolve()}")

    all_chunks: List[Chunk] = []
    for source, text in docs:
        all_chunks.extend(chunk_text(text, source, CHUNK_CHARS, CHUNK_OVERLAP))

    print(f"Total chunks: {len(all_chunks)}")
    texts = [c.text for c in all_chunks]

    print(f"Loading embedding model: {EMBED_MODEL_NAME}")
    model = SentenceTransformer(EMBED_MODEL_NAME)

    print("Embedding...")
    emb = model.encode(texts, convert_to_numpy=True, show_progress_bar=True)
    emb = emb.astype("float32")
    emb = l2_normalize(emb)

    dim = emb.shape[1]
    index = faiss.IndexFlatIP(dim)  # cosine via normalized inner product
    index.add(emb)

    meta: List[Dict[str, Any]] = [asdict(c) for c in all_chunks]

    index_path = OUT_DIR / "faiss.index"
    meta_path = OUT_DIR / "metadata.json"

    faiss.write_index(index, str(index_path))
    meta_path.write_text(json.dumps(meta, ensure_ascii=False, indent=2), encoding="utf-8")

    print(f"Saved index: {index_path.resolve()}")
    print(f"Saved metadata: {meta_path.resolve()}")


if __name__ == "__main__":
    main()
