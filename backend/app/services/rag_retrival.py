import json
from pathlib import Path
from typing import List, Dict, Any, Optional

import numpy as np
import faiss
from sentence_transformers import SentenceTransformer

from openai import OpenAI
from dotenv import load_dotenv
import os


INDEX_DIR = Path("backend/app/data/rag_index")
EMBED_MODEL_NAME = "sentence-transformers/all-MiniLM-L6-v2"
TOP_K_DEFAULT = 5

def l2_normalize(x: np.ndarray) -> np.ndarray:
    norm = np.linalg.norm(x, axis=1, keepdims=True) + 1e-12
    return x / norm


class RAGRetriever:
    def __init__(self, index_dir: Path, embed_model_name: str):
        print(f"Loading RAG index from: {index_dir.resolve()}")
        index_path = index_dir / "faiss.index"
        meta_path = index_dir / "metadata.json"
        if not index_path.exists() or not meta_path.exists():
            raise FileNotFoundError(
                "Index not found. Run build_index.py first to create rag_index/faiss.index and metadata.json"
            )

        self.index = faiss.read_index(str(index_path))
        self.meta: List[Dict[str, Any]] = json.loads(meta_path.read_text(encoding="utf-8"))

        self.model = SentenceTransformer(embed_model_name)

    def rag_search(self, data: dict) -> List[Dict[str, Any]]:
        query = data.get("query", "")
        top_k = data.get("top_k", TOP_K_DEFAULT)
        q = self.model.encode([query], convert_to_numpy=True).astype("float32")
        q = l2_normalize(q)

        scores, ids = self.index.search(q, top_k)
        out: List[Dict[str, Any]] = []

        for score, idx in zip(scores[0].tolist(), ids[0].tolist()):
            if idx < 0:
                continue
            m = self.meta[idx]
            out.append({
                "score": float(score),
                "source": m["source"],
                "chunk_id": m["id"],
                "text": m["text"],
            })
        return out

RAG_SEARCH_TOOL = {
    "type": "function",
    "function": {
        "name": "rag_search",
        "description": "Search the knowledge of substeties for single mothers and fathers in a RAG system. Make sure to provide a clear query.",
        "parameters": {
            "type": "object",
            "properties": {
                "query": {"type": "string", "description": "The search query string for the rag search."},
                "top_k": {"type": "integer", "default": 5},
            },
            "required": ["query"],
        },
    },
}


# ----------------------------
# Provider hook (YOU implement)
# ----------------------------
def call_chat_model(messages, tools=None, tool_choice="auto"):
    resp = client.chat.completions.create(
        model="green-l",
        messages=messages,
        tools=tools,
        tool_choice=tool_choice,  # "auto" is important
    )
    return resp.choices[0].message


def run_chat():
    retriever = RAGRetriever(INDEX_DIR, EMBED_MODEL_NAME)
    messages: List[Dict[str, Any]] = [
    ]

    while True:
        user = input("\nYou: ").strip()
        if user.lower() in {"exit", "quit"}:
            break

        messages.append({"role": "user", "content": user})

        # Loop until the model returns a normal assistant message (no tool calls)
        for step in range(10):
            # If you want to force retrieval on the first step only:
            tool_choice = "required" if step == 0 else "auto"

            msg = call_chat_model(messages, tools=[RAG_SEARCH_TOOL], tool_choice=tool_choice)
            # Convert to plain dict so messages stays consistent
            messages.append(msg.model_dump(exclude_none=True))

            if getattr(msg, "tool_calls", None):
                for tc in msg.tool_calls:
                    if tc.function.name != "rag_search":
                        continue

                    args = json.loads(tc.function.arguments or "{}")
                    query = args.get("query", user)
                    top_k = int(args.get("top_k", TOP_K_DEFAULT))

                    results = retriever.rag_search(query=query, top_k=top_k)

                    # IMPORTANT: one tool message per tool_call_id
                    messages.append({
                        "role": "tool",
                        "tool_call_id": tc.id,
                        "content": json.dumps({"results": results}, ensure_ascii=False),
                    })

                # continue loop: model will now see tool output and (hopefully) answer
                continue

            # No tool calls -> final answer
            answer = msg.content or ""
            print("\nAssistant:", answer)
            break
        else:
            print("\nAssistant: (stopped after too many tool iterations)")


if __name__ == "__main__":
    load_dotenv()
    GREENPT_API_KEY = os.getenv("GREENPT_API_KEY")

    client = OpenAI(
        api_key=GREENPT_API_KEY,
        base_url="https://api.greenpt.ai/v1/",
    )

    run_chat()
