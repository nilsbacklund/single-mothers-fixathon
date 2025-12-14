import { CheckCircle2, Circle, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/hooks/useTranslation";
import { Progress } from "@/components/ui/progress";

interface ApplicationStep {
  id: string;
  label: string;
  completed: boolean;
  current: boolean;
}

interface ApplicationProgressProps {
  programTitle: string;
  programDescription?: string;
  progress: number;
  steps: ApplicationStep[];
  className?: string;
}

const ApplicationProgress = ({
  programTitle,
  programDescription,
  progress,
  steps,
  className,
}: ApplicationProgressProps) => {
  const { t } = useTranslation();

  return (
    <div className={cn("space-y-6", className)}>
      {/* Program info card */}
      <div className="rounded-xl border border-border bg-card p-5">
        <h3 className="mb-2 font-semibold text-foreground">{programTitle}</h3>
        {programDescription && (
          <p className="text-sm text-muted-foreground">{programDescription}</p>
        )}
      </div>

      {/* Progress bar */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">{t("application.progress")}</span>
          <span className="font-medium text-foreground">{progress}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Steps / Table of contents */}
      <div className="rounded-xl border border-border bg-card p-5">
        <p className="mb-4 text-sm font-medium text-foreground">
          {t("application.whatYouNeed")}
        </p>
        
        <ul className="space-y-3">
          {steps.map((step, index) => (
            <li 
              key={step.id} 
              className={cn(
                "flex items-center gap-3 text-sm transition-colors",
                step.current && "font-medium"
              )}
            >
              {step.completed ? (
                <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />
              ) : step.current ? (
                <ArrowRight className="h-4 w-4 shrink-0 text-primary" />
              ) : (
                <Circle className="h-4 w-4 shrink-0 text-muted-foreground/40" />
              )}
              <span
                className={cn(
                  step.completed 
                    ? "text-foreground" 
                    : step.current 
                      ? "text-primary" 
                      : "text-muted-foreground"
                )}
              >
                {step.label}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ApplicationProgress;
