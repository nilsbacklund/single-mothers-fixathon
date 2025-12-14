import { useState } from "react";
import { Link } from "react-router-dom";
import { Filter, ArrowUpDown, ArrowLeft } from "lucide-react";
import AppShell from "@/components/layout/AppShell";
import ProfileSummaryBar from "@/components/ProfileSummaryBar";
import SimpleChatInput from "@/components/SimpleChatInput";
import ChatThread from "@/components/ChatThread";
import ProgramList from "@/components/ProgramList";
import { Button } from "@/components/ui/button";
import { useEligibility } from "@/contexts/EligibilityContext";
import { useTranslation } from "@/hooks/useTranslation";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const Results = () => {
  const { isComplete } = useEligibility();
  const { t } = useTranslation();
  
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: t("results.welcome"),
    },
  ]);

  const handleSend = (content: string) => {
    setMessages((prev) => [
      ...prev,
      { id: String(Date.now()), role: "user", content },
    ]);
  };

  // Show empty state if eligibility check not complete
  if (!isComplete) {
    return (
      <AppShell showTrustStrip={false}>
        <div className="container flex min-h-[60vh] flex-col items-center justify-center py-16 text-center">
          <div className="mx-auto max-w-md">
            <h1 className="mb-4 text-2xl font-semibold text-foreground">
              {t("results.noData.title")}
            </h1>
            <p className="mb-8 font-sans text-muted-foreground">
              {t("results.noData.description")}
            </p>
            <Button asChild variant="outline" size="lg" className="gap-2 border-primary/30 text-primary hover:bg-primary/5 hover:text-primary">
              <Link to="/">
                <ArrowLeft className="h-4 w-4" />
                {t("results.noData.cta")}
              </Link>
            </Button>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell showTrustStrip={false}>
      <ProfileSummaryBar />
      
      <div className="container py-8">
        <div className="mb-6">
          <h1 className="mb-2 text-2xl font-semibold text-foreground">
            {t("results.title")}
          </h1>
          <p className="font-sans text-muted-foreground">
            {t("results.subtitle")}
          </p>
        </div>

        {/* Split layout: Chat LEFT, Programs RIGHT */}
        <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
          {/* Chat - Left side */}
          <div className="order-2 lg:order-1">
            <div className="flex flex-col rounded-xl border border-border bg-card min-h-[400px] lg:min-h-[500px] lg:sticky lg:top-24">
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6">
                <ChatThread messages={messages} />
              </div>

              {/* Input */}
              <div className="border-t border-border/50 p-4">
                <SimpleChatInput
                  placeholder={t("results.askPlaceholder")}
                  onSend={handleSend}
                />
              </div>
            </div>
          </div>

          {/* Programs - Right side */}
          <div className="order-1 lg:order-2">
            {/* Filter/Sort Controls */}
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <Button variant="outline" size="sm" className="gap-2 font-sans">
                <Filter className="h-3.5 w-3.5" />
                {t("results.filters.category")}
              </Button>
              <Button variant="outline" size="sm" className="gap-2 font-sans">
                <ArrowUpDown className="h-3.5 w-3.5" />
                {t("results.filters.confidence")}
              </Button>
              <span className="ml-auto font-sans text-sm text-muted-foreground">
                {t("results.optionsFound").replace("{count}", "5")}
              </span>
            </div>

            <ProgramList state="ready" />
          </div>
        </div>
      </div>
    </AppShell>
  );
};

export default Results;
