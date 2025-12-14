import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AppShell from "@/components/layout/AppShell";
import SimpleChatInput from "@/components/SimpleChatInput";
import ChatThread from "@/components/ChatThread";
import ApplicationProgress from "@/components/ApplicationProgress";
import { useTranslation } from "@/hooks/useTranslation";
import { applicationStepsData } from "@/data/applicationSteps";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const Application = () => {
  const { programId } = useParams<{ programId: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();

  // Get program data
  const programData = programId ? applicationStepsData[programId] : null;

  // Track current step (0-indexed)
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  // Initial messages based on program
  const initialMessages: Message[] = useMemo(() => {
    if (!programData) return [];
    
    const programTitle = t(programData.titleKey as Parameters<typeof t>[0]);
    return [
      {
        id: "1",
        role: "assistant" as const,
        content: t("application.welcomeMessage").replace("{program}", programTitle),
      },
      {
        id: "2",
        role: "assistant" as const,
        content: t("application.firstQuestion"),
      },
    ];
  }, [programData, t]);

  const [messages, setMessages] = useState<Message[]>(initialMessages);

  // Calculate progress and steps with status
  const { progress, stepsWithStatus } = useMemo(() => {
    if (!programData) return { progress: 0, stepsWithStatus: [] };

    const totalSteps = programData.steps.length;
    const completedSteps = currentStepIndex;
    const progressPercent = Math.round((completedSteps / totalSteps) * 100);

    const stepsWithStatus = programData.steps.map((step, index) => ({
      id: step.id,
      label: t(step.labelKey as Parameters<typeof t>[0]),
      completed: index < currentStepIndex,
      current: index === currentStepIndex,
    }));

    return { progress: progressPercent, stepsWithStatus };
  }, [programData, currentStepIndex, t]);

  const handleSend = (content: string) => {
    // Add user message
    setMessages((prev) => [
      ...prev,
      { id: String(Date.now()), role: "user", content },
    ]);

    // Simulate assistant response and potentially advance step
    setTimeout(() => {
      if (programData && currentStepIndex < programData.steps.length - 1) {
        setCurrentStepIndex((prev) => prev + 1);
        setMessages((prev) => [
          ...prev,
          {
            id: String(Date.now() + 1),
            role: "assistant",
            content: t("application.stepConfirmation"),
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: String(Date.now() + 1),
            role: "assistant",
            content: t("application.allStepsComplete"),
          },
        ]);
      }
    }, 500);
  };

  // Handle missing program
  if (!programData) {
    return (
      <AppShell showTrustStrip={false}>
        <div className="container py-16 text-center">
          <h1 className="mb-4 text-2xl font-bold text-foreground">
            {t("application.programNotFound")}
          </h1>
          <p className="mb-8 text-muted-foreground">
            {t("application.programNotFoundDescription")}
          </p>
          <Button onClick={() => navigate("/results")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t("application.backToResults")}
          </Button>
        </div>
      </AppShell>
    );
  }

  const programTitle = t(programData.titleKey as Parameters<typeof t>[0]);
  const programDescription = t(programData.descriptionKey as Parameters<typeof t>[0]);

  return (
    <AppShell showTrustStrip={false}>
      <div className="container py-8">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/results")}
            className="mb-4 -ml-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t("application.backToResults")}
          </Button>
          <p className="mb-1 text-sm text-muted-foreground">{t("application.applyFor")}</p>
          <h1 className="text-2xl font-bold text-foreground">{programTitle}</h1>
        </div>

        {/* Split layout */}
        <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
          {/* Chat - Left side */}
          <div className="flex flex-col rounded-2xl border border-border/30 bg-card/30">
            {/* Messages */}
            <div className="flex-1 p-6">
              <ChatThread messages={messages} />
            </div>

            {/* Input */}
            <div className="border-t border-border/30 p-4">
              <SimpleChatInput
                placeholder={t("application.inputPlaceholder")}
                onSend={handleSend}
              />
            </div>
          </div>

          {/* Progress - Right side */}
          <aside className="order-first lg:order-last">
            <div className="lg:sticky lg:top-24">
              <ApplicationProgress
                programTitle={programTitle}
                programDescription={programDescription}
                progress={progress}
                steps={stepsWithStatus}
              />
            </div>
          </aside>
        </div>
      </div>
    </AppShell>
  );
};

export default Application;
