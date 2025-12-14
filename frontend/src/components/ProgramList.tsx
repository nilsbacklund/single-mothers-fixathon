import { Loader2, FileQuestion, AlertCircle } from "lucide-react";
import ProgramCard from "./ProgramCard";
import { cn } from "@/lib/utils";

type ListState = "empty" | "loading" | "error" | "ready";

export interface Program {
  id: string;
  title: string;
  description: string;
  category: string;
  confidence: "high" | "medium" | "low";
  applicationTime?: number; // in minutes
  processingTime?: number; // in weeks
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
      We couldn’t find any programs matching your situation.
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
  programs = [],
  className,
  onRetry,
}: ProgramListProps) => {
  return (
    <div className={cn("", className)}>
      {state === "empty" && <EmptyState />}
      {state === "loading" && <LoadingState />}
      {state === "error" && <ErrorState onRetry={onRetry} />}
      {state === "ready" && (
        <div className="grid gap-3">
          {programs.map((program) => (
            <ProgramCard
              key={program.id}
              title={program.title}
              description={program.description}
              category={program.category}
              confidence={program.confidence}
              applicationTime={program.applicationTime}
              processingTime={program.processingTime}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ProgramList;
