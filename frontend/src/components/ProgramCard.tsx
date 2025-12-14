import { ChevronRight, Clock } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface ProgramCardProps {
  title: string;
  description: string;
  category: string;
  confidence?: "high" | "medium" | "low";
  applicationTime?: number; // in minutes
  processingTime?: number; // in weeks
  className?: string;
  onApply?: () => void;
}

const ProgramCard = ({
  title,
  description,
  category,
  confidence = "medium",
  applicationTime,
  processingTime,
  className,
  onApply,
}: ProgramCardProps) => {
  const { t } = useTranslation();

  const confidenceConfig = {
    high: {
      label: t("programs.confidence.high"),
      bgClass: "bg-primary/10",
      textClass: "text-primary",
    },
    medium: {
      label: t("programs.confidence.medium"),
      bgClass: "bg-yellow-500/10",
      textClass: "text-yellow-700",
    },
    low: {
      label: t("programs.confidence.low"),
      bgClass: "bg-muted",
      textClass: "text-muted-foreground",
    },
  };

  const conf = confidenceConfig[confidence];

  return (
    <div
      className={cn(
        "group rounded-xl border border-border bg-card p-4 transition-soft hover:border-primary/50 hover:shadow-md",
        className
      )}
    >
      <div className="mb-3 flex items-start justify-between gap-2">
        <div className="flex flex-wrap gap-2">
          <span className="rounded-full bg-secondary px-2.5 py-0.5 font-sans text-xs font-medium text-secondary-foreground">
            {category}
          </span>
          <span
            className={cn(
              "rounded-full px-2.5 py-0.5 font-sans text-xs font-medium",
              conf.bgClass,
              conf.textClass
            )}
          >
            {conf.label}</span>
        </div>
        <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
      </div>
      <h4 className="mb-1 font-sans font-medium text-foreground">{title}</h4>
      <p className="mb-3 font-sans text-sm text-muted-foreground line-clamp-2">{description}</p>
      
      {/* Timeline info */}
      {(applicationTime || processingTime) && (
        <div className="flex flex-wrap items-center gap-4 border-t border-border/50 pt-3 text-xs text-muted-foreground">
          {applicationTime && (
            <div className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              <span>{t("programs.timeline.applicationTime")}: ~{applicationTime} {t("programs.timeline.minutes")}</span>
            </div>
          )}
          {processingTime && (
            <div className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              <span>{t("programs.timeline.processingTime")}: {processingTime} {t("programs.timeline.weeks")}</span>
            </div>
          )}
        </div>
      )}
    {/* Apply CTA */}
      {onApply && (
        <div className="mt-4 border-t border-border/50 pt-4">
          <Button
            onClick={(e) => {
              e.stopPropagation();
              onApply();
            }}
            variant="outline"
            className="w-full border-primary/30 text-primary hover:bg-primary/5 hover:text-primary"
            size="sm"
          >
            {t("programs.applyHere")}
          </Button>
        </div>
      )}
    </div>
  );
};

export default ProgramCard;
