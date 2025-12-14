import { createContext, useContext, useMemo, useState } from "react";

export type Role = "user" | "assistant";
// export type ChatMode = "intake" | "results";
type Mode = "intake" | "results";

export interface ChatMessage {
  id: string;
  role: Role;
  content: string;
}

export interface Scheme {
  [key: string]: unknown;
}

interface EligibilityState {
  sessionId: string;
  profile: Record<string, unknown>;
  schemes: Scheme[];
  requiredFields: string[];
  missingFields: string[];
  sources: Array<Record<string, unknown>>;
  messages: ChatMessage[];
  mode: Mode;

  setSessionId: (id: string) => void;
  setFromBackend: (payload: any) => void;
  pushMessage: (m: ChatMessage) => void;
  reset: () => void;
}

const EligibilityContext = createContext<EligibilityState | null>(null);

function makeSessionId() {
  return `sess_${Math.random().toString(36).slice(2)}_${Date.now()}`;
}

export function EligibilityProvider({ children }: { children: React.ReactNode }) {
  const [sessionId, setSessionId] = useState(() => {
    const existing = localStorage.getItem("hulpwijzer_session_id");
    if (existing) return existing;
    const fresh = makeSessionId();
    localStorage.setItem("hulpwijzer_session_id", fresh);
    return fresh;
  });

  const [profile, setProfile] = useState<Record<string, unknown>>({});
  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [requiredFields, setRequiredFields] = useState<string[]>([]);
  const [missingFields, setMissingFields] = useState<string[]>([]);
  const [sources, setSources] = useState<Array<Record<string, unknown>>>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [mode, setMode] = useState<Mode>("intake");

  const value = useMemo<EligibilityState>(() => ({
    sessionId,
    profile,
    schemes,
    requiredFields,
    missingFields,
    sources,
    messages,
    mode,

    setSessionId: (id: string) => {
      setSessionId(id);
      localStorage.setItem("hulpwijzer_session_id", id);
    },

    setFromBackend: (payload: any) => {
      setProfile(payload?.profile ?? {});
      setSchemes(payload?.schemes ?? []);
      setRequiredFields(payload?.required_fields ?? []);
      setMissingFields(payload?.missing_fields ?? []);
      setSources(payload?.sources ?? []);

      if (payload?.mode === "results") {
        setMode("results");
      } else {
        setMode("intake");
      }
    },

    pushMessage: (m: ChatMessage) =>
      setMessages((prev) => [...prev, m]),

    reset: () => {
      const fresh = makeSessionId();
      setSessionId(fresh);
      localStorage.setItem("hulpwijzer_session_id", fresh);
      setProfile({});
      setSchemes([]);
      setRequiredFields([]);
      setMissingFields([]);
      setSources([]);
      setMessages([]);
      setMode("intake");
    },
  }), [
    sessionId,
    profile,
    schemes,
    requiredFields,
    missingFields,
    sources,
    messages,
    mode,
  ]);

  return (
    <EligibilityContext.Provider value={value}>
      {children}
    </EligibilityContext.Provider>
  );
}

export function useEligibility() {
  const ctx = useContext(EligibilityContext);
  if (!ctx) {
    throw new Error("useEligibility must be used within EligibilityProvider");
  }
  return ctx;
}
