import { useState, useRef, forwardRef, useImperativeHandle } from "react";
import { ArrowRight } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { sendChat } from "@/lib/api";
import { useEligibility } from "@/contexts/EligibilityContext";

export interface EligibilityChatRef {
  focus: () => void;
}

const EligibilityChat = forwardRef<EligibilityChatRef>((_, ref) => {
  const { t } = useTranslation();
  const { sessionId, pushMessage, setFromBackend, messages, mode } = useEligibility();

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useImperativeHandle(ref, () => ({
    focus: () => inputRef.current?.focus(),
  }));

  const suggestedTopics = [
    t("conversation.topics.childcare"),
    t("conversation.topics.housing"),
    t("conversation.topics.healthcare"),
  ];

  const scrollDown = () => {
    setTimeout(() => {
      containerRef.current?.scrollTo({
        top: containerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }, 50);
  };

  const handleSend = async (content: string) => {
    const text = content.trim();
    if (!text || loading) return;

    pushMessage({ id: `user-${Date.now()}`, role: "user", content: text });
    setInput("");
    setLoading(true);
    scrollDown();

    try {
      const payload = await sendChat(sessionId, text);
      setFromBackend(payload);

      pushMessage({
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: payload?.reply ?? "I couldn't generate a reply.",
      });
    } catch (e) {
      pushMessage({
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: "Something went wrong while contacting the server. Please try again.",
      });
    } finally {
      setLoading(false);
      scrollDown();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend(input);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4">
      {messages.length > 0 && (
        <div ref={containerRef} className="mb-12 max-h-[50vh] space-y-8 overflow-y-auto">
          {messages.map((m) => (
            <div key={m.id} className="space-y-1">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground/50">
                {m.role === "user" ? t("conversation.you") : t("conversation.guide")}
              </p>
              <p className="font-sans text-base leading-relaxed text-foreground/85 whitespace-pre-wrap">
                {m.content}
              </p>
            </div>
          ))}
          {loading && (
            <div className="space-y-1">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground/50">
                {t("conversation.guide")}
              </p>
              <p className="font-sans text-base leading-relaxed text-foreground/60">
                Typing…
              </p>
            </div>
          )}
        </div>
      )}

      <div className="mb-8">
        <div className="flex items-center gap-4 rounded-3xl border-2 border-primary/30 bg-background px-8 py-6 shadow-lg shadow-primary/5 transition-all duration-300 focus-within:border-primary/50 focus-within:shadow-xl focus-within:shadow-primary/10">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t("conversation.placeholder")}
            className="flex-1 bg-transparent font-sans text-lg text-foreground placeholder:text-muted-foreground/60 focus:outline-none"
          />
          <button
            onClick={() => handleSend(input)}
            disabled={!input.trim() || loading}
            className="rounded-full bg-primary p-4 text-primary-foreground transition-all hover:bg-primary/90 hover:scale-105 disabled:opacity-30 disabled:hover:scale-100 disabled:hover:bg-primary"
            aria-label={t("conversation.send")}
          >
            <ArrowRight className="h-6 w-6" />
          </button>
        </div>
      </div>

      {messages.length === 0 && (
        <div className="text-center">
          <p className="mb-5 text-sm text-muted-foreground/60">
            {t("conversation.topicsIntro")}
          </p>
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-3">
            {suggestedTopics.map((topic, i) => (
              <button
                key={i}
                onClick={() => handleSend(topic)}
                className="font-sans text-sm text-muted-foreground/70 underline decoration-border/50 underline-offset-4 transition-colors hover:text-foreground hover:decoration-primary/40"
              >
                {topic}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
});

EligibilityChat.displayName = "EligibilityChat";
export default EligibilityChat;
