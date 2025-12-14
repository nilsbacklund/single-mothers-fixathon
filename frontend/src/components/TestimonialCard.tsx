import { cn } from "@/lib/utils";

interface TestimonialCardProps {
  quote: string;
  name: string;
  context?: string;
  className?: string;
  variant?: "default" | "compact" | "hero";
}

const TestimonialCard = ({
  quote,
  name,
  context,
  className,
  variant = "default",
}: TestimonialCardProps) => {
  if (variant === "hero") {
    return (
      <div className={cn("flex flex-col items-center text-center", className)}>
        {/* Photo placeholder - Single mum with two kids */}
        <div className="mb-6 h-20 w-20 overflow-hidden rounded-full border-2 border-primary/20 bg-muted md:h-24 md:w-24">
          <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground/60 p-2 text-center leading-tight">
            Single mum with two kids
          </div>
        </div>
        <blockquote className="mb-4 max-w-sm text-muted-foreground leading-relaxed">
          "{quote}"
        </blockquote>
        <div className="text-sm text-muted-foreground/70">
          <span className="font-medium">{name}</span>
          {context && <span> · {context}</span>}
        </div>
      </div>
    );
  }

  if (variant === "compact") {
    return (
      <div className={cn("text-center", className)}>
        <blockquote className="mb-4 text-muted-foreground italic leading-relaxed">
          "{quote}"
        </blockquote>
        <div className="text-sm text-muted-foreground/80">
          <span className="font-medium">{name}</span>
          {context && <span> · {context}</span>}
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-card p-6 transition-soft",
        className
      )}
    >
      <div className="flex gap-4">
        {/* Photo placeholder - natural, candid style */}
        <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-full border-2 border-primary/20 bg-muted">
          <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
            Photo
          </div>
        </div>
        <div className="flex-1">
          <blockquote className="mb-3 text-foreground">
            "{quote}"
          </blockquote>
          <div className="text-sm">
            <span className="font-medium text-foreground">{name}</span>
            {context && (
              <span className="text-muted-foreground"> · {context}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestimonialCard;
