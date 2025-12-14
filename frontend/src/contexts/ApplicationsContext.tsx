import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface UserApplication {
  programId: string;
  titleKey: string;
  startedAt: string;
  currentStep: number;
  totalSteps: number;
  progress: number;
}

interface ApplicationsContextType {
  applications: UserApplication[];
  addApplication: (app: Omit<UserApplication, "startedAt" | "currentStep" | "progress">) => void;
  updateProgress: (programId: string, currentStep: number) => void;
  getApplication: (programId: string) => UserApplication | undefined;
  hasApplication: (programId: string) => boolean;
}

const ApplicationsContext = createContext<ApplicationsContextType | undefined>(undefined);

const STORAGE_KEY = "hulpwijzer_applications";

export const ApplicationsProvider = ({ children }: { children: ReactNode }) => {
  const [applications, setApplications] = useState<UserApplication[]>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(applications));
  }, [applications]);

  const addApplication = (app: Omit<UserApplication, "startedAt" | "currentStep" | "progress">) => {
    // Don't add if already exists
    if (applications.some((a) => a.programId === app.programId)) {
      return;
    }

    const newApp: UserApplication = {
      ...app,
      startedAt: new Date().toISOString(),
      currentStep: 0,
      progress: 0,
    };

    setApplications((prev) => [...prev, newApp]);
  };

  const updateProgress = (programId: string, currentStep: number) => {
    setApplications((prev) =>
      prev.map((app) => {
        if (app.programId === programId) {
          const progress = Math.round((currentStep / app.totalSteps) * 100);
          return { ...app, currentStep, progress };
        }
        return app;
      })
    );
  };

  const getApplication = (programId: string) => {
    return applications.find((app) => app.programId === programId);
  };

  const hasApplication = (programId: string) => {
    return applications.some((app) => app.programId === programId);
  };

  return (
    <ApplicationsContext.Provider
      value={{ applications, addApplication, updateProgress, getApplication, hasApplication }}
    >
      {children}
    </ApplicationsContext.Provider>
  );
};

export const useApplications = () => {
  const context = useContext(ApplicationsContext);
  if (!context) {
    throw new Error("useApplications must be used within an ApplicationsProvider");
  }
  return context;
};
