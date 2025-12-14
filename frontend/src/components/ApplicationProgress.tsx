import { CheckCircle2, Circle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ApplicationProgressProps {
  programTitle: string;
  progress: number;
  requirements: { label: string; completed: boolean }[];
  className?: string;
}

const ApplicationProgress = ({
  programTitle,
  progress,
  requirements,
  className,
}: ApplicationProgressProps) => {
  return (
    <div className={cn("space-y-6", className)}>
      {/* Progress bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Progress</span>
          <span className="font-medium text-foreground">{progress}%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Program card */}
      <div className="rounded-xl border border-border bg-card p-5">
        <h3 className="mb-4 font-semibold text-foreground">{programTitle}</h3>
        
        <p className="mb-4 text-sm text-muted-foreground">
          What you'll need:
        </p>
        
        <ul className="space-y-3">
          {requirements.map((req, index) => (
            <li key={index} className="flex items-center gap-3 text-sm">
              {req.completed ? (
                <CheckCircle2 className="h-4 w-4 text-primary" />
              ) : (
                <Circle className="h-4 w-4 text-muted-foreground/40" />
              )}
              <span
                className={cn(
                  req.completed ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {req.label}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* CTA */}
      <button
        disabled
        className="w-full rounded-full bg-primary/20 py-3 text-sm font-medium text-primary/50"
      >
        Continue to apply →
      </button>

      <p className="text-center text-xs text-muted-foreground/50">
        This is a preview. Application support coming soon.
      </p>
    </div>
  );
};

export default ApplicationProgress;
