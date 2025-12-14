import { useState } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import { cn } from "@/lib/utils";

interface SimpleChatInputProps {
  placeholder?: string;
  exampleQuestions?: string[];
  onSend?: (message: string) => void;
  className?: string;
}

const SimpleChatInput = ({
  placeholder = "Type your message...",
  exampleQuestions,
  onSend,
  className,
}: SimpleChatInputProps) => {
  const [message, setMessage] = useState("");
  const { t } = useTranslation();

  const handleSend = () => {
    if (message.trim() && onSend) {
      onSend(message.trim());
      setMessage("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className={cn("space-y-5", className)}>
      {/* Input */}
      <div className="flex items-center gap-3 rounded-full border border-border/50 bg-background px-6 py-4 transition-soft focus-within:border-primary/30 focus-within:shadow-sm">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="flex-1 bg-transparent font-sans text-sm text-foreground placeholder:text-muted-foreground/70 focus:outline-none"
        />
        <button
          onClick={handleSend}
          className="rounded-full bg-primary/10 px-5 py-2 font-sans text-sm font-medium text-primary transition-soft hover:bg-primary/15"
        >
          {t("chat.send")}
        </button>
      </div>

      {/* Example questions */}
      {exampleQuestions && exampleQuestions.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {exampleQuestions.map((question, index) => (
            <button
              key={index}
              onClick={() => onSend?.(question)}
              className="rounded-full border border-border/40 bg-transparent px-4 py-2.5 font-sans text-xs text-muted-foreground transition-soft hover:border-primary/25 hover:text-foreground"
            >
              {question}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default SimpleChatInput;
