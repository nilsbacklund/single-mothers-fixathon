import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useEligibility } from "@/contexts/EligibilityContext";
import { useTranslation } from "@/hooks/useTranslation";
import { cn } from "@/lib/utils";

interface ProgressButtonProps {
  className?: string;
}

const ProgressButton = ({ className }: ProgressButtonProps) => {
  const { isComplete, progress } = useEligibility();
  const { t } = useTranslation();
  const remaining = progress.total - progress.completed;

  if (isComplete) {
    return (
      <Link
        to="/results"
        className={cn(
          "inline-flex items-center gap-2 rounded-full border border-primary/30 bg-transparent px-6 py-3 text-sm font-medium text-primary transition-soft hover:bg-primary/5",
          className
        )}
      >
        {t("chat.progressButton.complete")}
        <ArrowRight className="h-4 w-4" />
      </Link>
    );
  }

  const incompleteText = t("chat.progressButton.incomplete").replace("{count}", String(remaining));

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 rounded-full border border-border/50 bg-muted/30 px-6 py-3 text-sm text-muted-foreground",
        className
      )}
    >
      <span>{incompleteText}</span>
    </div>
  );
};

export default ProgressButton;
