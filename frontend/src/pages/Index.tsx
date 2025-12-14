import { useRef } from "react";
import AppShell from "@/components/layout/AppShell";
import RotatingTestimonials from "@/components/RotatingTestimonials";
import TrustSection from "@/components/TrustSection";
import EligibilityChat, { EligibilityChatRef } from "@/components/EligibilityChat";
import { useEligibility } from "@/contexts/EligibilityContext";
import { useTranslation } from "@/hooks/useTranslation";
import ProgramList from "@/components/ProgramList";
import { mapSchemesToPrograms } from "@/lib/mapSchemestoProgram";
import { Button } from "@/components/ui/button";

const Index = () => {
  const { mode, schemes } = useEligibility();
  const programs = mapSchemesToPrograms(schemes);

  const { t } = useTranslation();
  const chatSectionRef = useRef<HTMLDivElement>(null);
  const chatInputRef = useRef<EligibilityChatRef>(null);

  const handleScrollToChat = () => {
    chatSectionRef.current?.scrollIntoView({ behavior: "smooth" });
    setTimeout(() => {
      chatInputRef.current?.focus();
    }, 500);
  };

  return (
    <AppShell showTrustStrip={false}>
      {/* Hero Section */}
      <section className="flex min-h-[85vh] items-center pt-6 md:pt-0">
        <div className="container mx-auto px-6">
          <div className="grid items-center gap-10 md:grid-cols-[1fr_auto] md:gap-16 lg:gap-24">
            <div className="max-w-xl">
              <p className="mb-4 text-sm font-medium tracking-wide text-muted-foreground/60">
                {t("hero.label")}
              </p>
              <h1 className="mb-4 text-3xl font-semibold tracking-tight text-foreground md:text-4xl lg:text-5xl whitespace-nowrap">
                {t("hero.headline")}
              </h1>
              <p className="mb-6 text-lg leading-relaxed text-muted-foreground/80">
                {t("hero.description")}
              </p>
              <Button
                variant="outline"
                onClick={handleScrollToChat}
                className="border-primary/30 text-primary hover:bg-primary/5"
              >
                {t("hero.cta")}
              </Button>
            </div>

            <div className="hidden md:flex md:justify-start">
              <RotatingTestimonials />
            </div>
          </div>
        </div>
      </section>

      <TrustSection />

      {/* Conversation Section */}
      <section ref={chatSectionRef} className="pb-32">
        <div className="container mx-auto px-6">
          <div className="mx-auto max-w-xl text-center mb-12">
            <p className="text-xl text-muted-foreground/70 md:text-2xl">
              {t("conversation.transition")}
            </p>
          </div>

          <div
            className={
              mode === "results"
                ? "grid gap-8 lg:grid-cols-[1fr_360px] items-start"
                : "flex justify-center"
            }
          >
            {/* Chat */}
            <div className={mode === "results" ? "max-w-none" : "w-full max-w-xl"}>
              <EligibilityChat ref={chatInputRef} />
            </div>

            {/* Results */}
            {mode === "results" && (
              <aside className="lg:sticky lg:top-24">
                <ProgramList
                state={programs.length ? "ready" : "empty"}
                programs={programs} />
              </aside>
            )}
          </div>
        </div>
      </section>
    </AppShell>
  );
};

export default Index;
