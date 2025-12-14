import { useState } from "react";
import AppShell from "@/components/layout/AppShell";
import SimpleChatInput from "@/components/SimpleChatInput";
import ChatThread from "@/components/ChatThread";
import ApplicationProgress from "@/components/ApplicationProgress";

const mockMessages = [
  {
    id: "1",
    role: "assistant" as const,
    content: "Let's gather the documents you need for the Childcare Allowance application.",
  },
  {
    id: "2",
    role: "assistant" as const,
    content: "Do you have your income statement from the past year ready?",
  },
  {
    id: "3",
    role: "user" as const,
    content: "Yes, I have it.",
  },
  {
    id: "4",
    role: "assistant" as const,
    content: "Great! Now let's check your ID document. Do you have a valid passport or ID card?",
  },
];

const mockRequirements = [
  { label: "Income statement", completed: true },
  { label: "ID document", completed: false },
  { label: "Childcare contract", completed: false },
  { label: "DigiD login", completed: false },
];

const Application = () => {
  const [messages, setMessages] = useState(mockMessages);

  const handleSend = (content: string) => {
    setMessages((prev) => [
      ...prev,
      { id: String(Date.now()), role: "user", content },
    ]);
  };

  return (
    <AppShell showTrustStrip={false}>
      <div className="container py-8">
        {/* Header */}
        <div className="mb-6">
          <p className="mb-1 text-sm text-muted-foreground">Apply for</p>
          <h1 className="text-2xl font-bold text-foreground">
            Childcare Allowance
          </h1>
        </div>

        {/* Split layout */}
        <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
          {/* Chat - Left side */}
          <div className="flex flex-col">
            {/* Messages */}
            <div className="flex-1 py-4">
              <ChatThread messages={messages} />
            </div>

            {/* Input */}
            <div className="border-t border-border/30 pt-6">
              <SimpleChatInput
                placeholder="Type your answer..."
                onSend={handleSend}
              />
            </div>
          </div>

          {/* Progress - Right side */}
          <aside className="order-first lg:order-last">
            <div className="lg:sticky lg:top-24">
              <ApplicationProgress
                programTitle="Childcare Allowance (Kinderopvangtoeslag)"
                progress={25}
                requirements={mockRequirements}
              />
            </div>
          </aside>
        </div>
      </div>
    </AppShell>
  );
};

export default Application;
