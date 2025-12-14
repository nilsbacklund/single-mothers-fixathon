import { Loader2, FileQuestion, AlertCircle } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { useNavigate } from "react-router-dom";
import { useApplications } from "@/contexts/ApplicationsContext";
import { applicationStepsData } from "@/data/applicationSteps";
import ProgramCard from "./ProgramCard";
import { cn } from "@/lib/utils";

type ListState = "empty" | "loading" | "error" | "ready";

export interface Program {
  id: string;
  title: string;
  description: string;
  category: string;
  confidence: "high" | "medium" | "low";
  applicationTime?: number;
  processingTime?: number;
}

interface ProgramListProps {
  state?: ListState;
  programs?: Program[];
  className?: string;
  onRetry?: () => void;
}

const EmptyState = () => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-muted">
      <FileQuestion className="h-7 w-7 text-muted-foreground" />
    </div>
    <h3 className="mb-2 font-sans font-medium text-foreground">
      No options found
    </h3>
    <p className="max-w-xs font-sans text-sm text-muted-foreground">
      We couldn't find any programs matching your situation.
    </p>
  </div>
);

const LoadingState = () => (
  <div className="flex flex-col items-center justify-center py-16">
    <Loader2 className="mb-4 h-8 w-8 animate-spin text-primary" />
    <p className="font-sans text-sm text-muted-foreground">
      Finding options for you...
    </p>
  </div>
);

const ErrorState = ({ onRetry }: { onRetry?: () => void }) => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10">
      <AlertCircle className="h-7 w-7 text-destructive" />
    </div>
    <h3 className="mb-2 font-sans font-medium text-foreground">
      Unable to load options
    </h3>
    <p className="mb-4 max-w-xs font-sans text-sm text-muted-foreground">
      Something went wrong while finding your options.
    </p>
    {onRetry && (
      <button
        onClick={onRetry}
        className="rounded-lg bg-primary px-4 py-2 font-sans text-sm font-medium text-primary-foreground transition-soft hover:bg-primary/90"
      >
        Try again
      </button>
    )}
  </div>
);

const ProgramList = ({
  state = "ready",
  programs,
  className,
  onRetry,
}: ProgramListProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { addApplication } = useApplications();

  // ✅ DUMMY DATA (translated correctly)
  const resolvedPrograms: Program[] =
    programs ?? [
      {
        id: "1",
        title: t("programs.childcare.title"),
        description: t("programs.childcare.description"),
        category: t("programs.childcare.category"),
        confidence: "high",
        applicationTime: 15,
        processingTime: 4,
      },
      {
        id: "2",
        title: t("programs.childBudget.title"),
        description: t("programs.childBudget.description"),
        category: t("programs.childBudget.category"),
        confidence: "high",
        applicationTime: 10,
        processingTime: 6,
      },
      {
        id: "3",
        title: t("programs.healthcare.title"),
        description: t("programs.healthcare.description"),
        category: t("programs.healthcare.category"),
        confidence: "medium",
        applicationTime: 10,
        processingTime: 4,
      },
      {
        id: "4",
        title: t("programs.housing.title"),
        description: t("programs.housing.description"),
        category: t("programs.housing.category"),
        confidence: "medium",
        applicationTime: 20,
        processingTime: 8,
      },
      {
        id: "5",
        title: t("programs.municipal.title"),
        description: t("programs.municipal.description"),
        category: t("programs.municipal.category"),
        confidence: "low",
        applicationTime: 30,
        processingTime: 2,
      },
    ];

  const handleApply = (programId: string) => {
    const programData = applicationStepsData[programId];
    const totalSteps = programData?.steps.length || 0;

    addApplication({
      programId,
      titleKey: programId,
      totalSteps,
    });

    navigate("/applications");
  };

  return (
    <div className={cn("", className)}>
      {state === "empty" && <EmptyState />}
      {state === "loading" && <LoadingState />}
      {state === "error" && <ErrorState onRetry={onRetry} />}
      {state === "ready" && (
        <div className="grid gap-3">
          {resolvedPrograms.map((program) => (
            <ProgramCard
              key={program.id}
              title={program.title}
              description={program.description}
              category={program.category}
              confidence={program.confidence}
              applicationTime={program.applicationTime}
              processingTime={program.processingTime}
              onApply={() => handleApply(program.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ProgramList;
