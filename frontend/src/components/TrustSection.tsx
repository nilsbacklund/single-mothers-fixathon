import { Shield, Lock, Heart } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

const TrustSection = () => {
  const { t } = useTranslation();

  const trustPillars = [
    {
      icon: Shield,
      title: t("trust.independent.title"),
      description: t("trust.independent.description"),
    },
    {
      icon: Lock,
      title: t("trust.private.title"),
      description: t("trust.private.description"),
    },
    {
      icon: Heart,
      title: t("trust.noJudgment.title"),
      description: t("trust.noJudgment.description"),
    },
  ];

  return (
    <section className="py-10 md:py-14">
      <div className="container mx-auto px-6">
        <div className="grid gap-10 md:grid-cols-3 md:gap-12">
          {trustPillars.map((pillar, index) => (
            <div key={index} className="text-center">
              <div className="mb-4 flex justify-center">
                <div className="rounded-full bg-primary/10 p-5">
                  <pillar.icon className="h-7 w-7 text-primary" />
                </div>
              </div>
              <h3 className="mb-2 text-lg font-semibold text-foreground">
                {pillar.title}
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground/80">
                {pillar.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustSection;
