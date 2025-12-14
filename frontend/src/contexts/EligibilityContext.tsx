import { createContext, useContext, useState, useEffect, ReactNode } from "react";

const REQUIRED_FIELDS = [
  "isSingleParent",
  "numberOfChildren",
  "netIncome",
  "savingsAssets",
  "municipality",
] as const;

type RequiredField = (typeof REQUIRED_FIELDS)[number];

interface EligibilityData {
  [key: string]: string | number | boolean | undefined;
}

export type Role = "user" | "assistant";

export interface ChatMessage {
  id: string;
  role: Role;
  content: string;
}

export interface Scheme {
  [key: string]: unknown;
}


interface EligibilityContextType {
  data: EligibilityData;
  updateField: (field: string, value: string | number | boolean) => void;
  completedFields: string[];
  missingFields: string[];
  isComplete: boolean;
  progress: { completed: number; total: number };
  clearData: () => void;

  sessionId?: string;
  schemes?: Scheme[];
  messages?: ChatMessage[];
  mode?: "intake" | "results";

  setFromBackend?: (payload: any) => void;
  pushMessage?: (m: ChatMessage) => void;
  resetSession?: () => void;
}

const EligibilityContext =
  createContext<EligibilityContextType | undefined>(undefined);

const STORAGE_KEY = "hulpwijzer_eligibility_data";

export const EligibilityProvider = ({ children }: { children: ReactNode }) => {
  const demoData: EligibilityData = {
    isSingleParent: true,
    numberOfChildren: 2,
    netIncome: 2500,
    savingsAssets: 5000,
    municipality: "Amsterdam",
  };


  const [data, setData] = useState<EligibilityData>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);

        if (
          parsed.parentalStatus !== undefined ||
          parsed.employmentStatus !== undefined
        ) {
          localStorage.removeItem(STORAGE_KEY);
          return demoData;
        }

        const hasNewFields = REQUIRED_FIELDS.some(
          (field) => parsed[field] !== undefined
        );

        return hasNewFields ? parsed : demoData;
      }
      return demoData;
    } catch {
      return demoData;
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  const updateField = (
    field: string,
    value: string | number | boolean
  ) => {
    setData((prev) => ({ ...prev, [field]: value }));
  };

  const clearData = () => {
    setData({});
    localStorage.removeItem(STORAGE_KEY);
  };

  const completedFields = REQUIRED_FIELDS.filter(
    (field) => data[field] !== undefined && data[field] !== ""
  );

  const missingFields = REQUIRED_FIELDS.filter(
    (field) => data[field] === undefined || data[field] === ""
  );

  const isComplete = missingFields.length === 0;

  const progress = {
    completed: completedFields.length,
    total: REQUIRED_FIELDS.length,
  };

  const [sessionId, setSessionId] = useState<string | undefined>(undefined);
  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [mode, setMode] = useState<"intake" | "results">("intake");

  const setFromBackend = (payload: any) => {
    if (!payload) return;

    if (payload.profile) {
      setData(payload.profile);
    }

    setSchemes(payload.schemes ?? []);
    setSessionId(payload.session_id);
    setMode(payload.mode === "results" ? "results" : "intake");
  };

  const pushMessage = (m: ChatMessage) => {
    setMessages((prev) => [...prev, m]);
  };

  const resetSession = () => {
    clearData();
    setSchemes([]);
    setMessages([]);
    setSessionId(undefined);
    setMode("intake");
  };

  return (
    <EligibilityContext.Provider
      value={{
        data,
        updateField,
        completedFields,
        missingFields,
        isComplete,
        progress,
        clearData,

        sessionId,
        schemes,
        messages,
        mode,
        setFromBackend,
        pushMessage,
        resetSession,
      }}
    >
      {children}
    </EligibilityContext.Provider>
  );
};

export const useEligibility = () => {
  const context = useContext(EligibilityContext);
  if (!context) {
    throw new Error(
      "useEligibility must be used within an EligibilityProvider"
    );
  }
  return context;
};
