const API_URL = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000";

export async function sendChat(sessionId: string, message: string) {
  // Keep compatibility with your existing backend signature:
  const res = await fetch(
    `${API_URL}/chat?session_id=${encodeURIComponent(sessionId)}&message=${encodeURIComponent(message)}`,
    { method: "POST" }
  );

  if (!res.ok) throw new Error("Chat failed");
  return res.json();
}

export async function sendChatJson(sessionId: string, message: string) {
  const res = await fetch(`${API_URL}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ session_id: sessionId, message }),
  });

  if (!res.ok) throw new Error("Chat failed");
  return res.json();
}

export async function getSession(sessionId: string) {
  const res = await fetch(`${API_URL}/session/${encodeURIComponent(sessionId)}`);
  if (!res.ok) throw new Error("Failed to load session");
  return res.json();
}
