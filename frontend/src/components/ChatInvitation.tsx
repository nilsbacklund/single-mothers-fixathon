import { ChevronDown } from "lucide-react";

const ChatInvitation = () => {
  const handleScroll = () => {
    const chatSection = document.getElementById("explore-chat");
    if (chatSection) {
      chatSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <button
      onClick={handleScroll}
      className="group inline-flex flex-col items-center gap-2 text-muted-foreground/60 hover:text-muted-foreground transition-soft"
    >
      <span className="text-sm">Have a question? You can explore freely.</span>
      <ChevronDown className="h-4 w-4 animate-pulse-soft" />
    </button>
  );
};

export default ChatInvitation;
