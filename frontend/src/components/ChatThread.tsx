import { cn } from "@/lib/utils";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface ChatThreadProps {
  messages: Message[];
  className?: string;
}

const ChatThread = ({ messages, className }: ChatThreadProps) => {
  return (
    <div className={cn("flex flex-col gap-5", className)}>
      {messages.map((message) => (
        <div
          key={message.id}
          className={cn(
            "max-w-[80%] rounded-3xl px-5 py-4 text-sm leading-relaxed",
            message.role === "user"
              ? "ml-auto bg-primary/8 text-foreground"
              : "mr-auto bg-muted/50 text-foreground"
          )}
        >
          {message.content}
        </div>
      ))}
    </div>
  );
};

export default ChatThread;
