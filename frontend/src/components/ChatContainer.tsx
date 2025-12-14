import { ReactNode } from "react";
import { MessageCircle, HelpCircle, FileText, AlertCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import PromptChips from "./PromptChips";

type ChatMode = "explore" | "intake" | "results";
type ChatState = "empty" | "loading" | "error" | "ready";

interface ChatContainerProps {
  mode: ChatMode;
  state?: ChatState;
  className?: string;
  children?: ReactNode;
}

const modeConfig = {
  explore: {
    title: "Explore Mode",
    description: "Ask general questions about benefits and support options",
    icon: HelpCircle,
    bgClass: "bg-chat-explore",
    borderClass: "border-chat-explore-border",
    prompts: [
      "What benefits exist for childcare?",
      "How does this work?",
      "What support is available for housing?",
      "Can I get help with healthcare costs?",
    ],
  },
  intake: {
    title: "Tell us about your situation",
    description: "Answer a few questions to find options that may apply to you",
    icon: FileText,
    bgClass: "bg-chat-intake",
    borderClass: "border-chat-intake-border",
    prompts: [
      "I'm ready to start",
      "What information do you need?",
      "How long will this take?",
    ],
  },
  results: {
    title: "Questions about your options",
    description: "Ask about any of the programs shown, or request more details",
    icon: MessageCircle,
    bgClass: "bg-chat-results",
    borderClass: "border-chat-results-border",
    prompts: [
      "Tell me more about this option",
      "Am I likely to qualify?",
      "What documents would I need?",
    ],
  },
};

const EmptyState = ({ mode }: { mode: ChatMode }) => {
  const config = modeConfig[mode];
  const Icon = config.icon;

  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
        <Icon className="h-6 w-6 text-muted-foreground" />
      </div>
      <p className="mb-6 max-w-xs text-sm text-muted-foreground">
        {config.description}
      </p>
      <PromptChips prompts={config.prompts} />
    </div>
  );
};

const LoadingState = () => (
  <div className="flex flex-col items-center justify-center py-12">
    <Loader2 className="mb-4 h-8 w-8 animate-spin text-primary" />
    <p className="text-sm text-muted-foreground">Loading...</p>
  </div>
);

const ErrorState = ({ onRetry }: { onRetry?: () => void }) => (
  <div className="flex flex-col items-center justify-center py-12 text-center">
    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
      <AlertCircle className="h-6 w-6 text-destructive" />
    </div>
    <p className="mb-2 text-sm font-medium text-foreground">Something went wrong</p>
    <p className="mb-4 text-sm text-muted-foreground">Please try again</p>
    {onRetry && (
      <button
        onClick={onRetry}
        className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-soft hover:bg-primary/90"
      >
        Try again
      </button>
    )}
  </div>
);

const ChatContainer = ({ mode, state = "empty", className, children }: ChatContainerProps) => {
  const config = modeConfig[mode];

  return (
    <div
      className={cn(
        "flex flex-col rounded-xl border-2 transition-soft",
        config.bgClass,
        config.borderClass,
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-border/50 px-4 py-3">
        <config.icon className="h-4 w-4 text-primary" />
        <span className="text-sm font-medium text-foreground">{config.title}</span>
      </div>

      {/* Content */}
      <div className="flex-1 p-4">
        {state === "empty" && <EmptyState mode={mode} />}
        {state === "loading" && <LoadingState />}
        {state === "error" && <ErrorState />}
        {state === "ready" && children}
      </div>

      {/* Input placeholder */}
      <div className="border-t border-border/50 p-4">
        <div className="flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-2.5">
          <input
            type="text"
            placeholder="Type your question..."
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
            disabled
          />
          <button
            disabled
            className="rounded-md bg-primary px-3 py-1 text-sm font-medium text-primary-foreground opacity-50"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatContainer;
