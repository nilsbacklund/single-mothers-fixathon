import { useNavigate } from "react-router-dom";
import { FileText, ArrowRight } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { useApplications } from "@/contexts/ApplicationsContext";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import AppShell from "@/components/layout/AppShell";
import EmailBanner from "@/components/EmailBanner";

const Applications = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { applications } = useApplications();

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return t("applications.today");
    if (diffDays === 1) return t("applications.yesterday");
    return t("applications.daysAgo").replace("{count}", String(diffDays));
  };

  return (
    <AppShell showTrustStrip={false}>
      <div className="container max-w-4xl py-8 md:py-12">
        <EmailBanner className="mb-6" />

        {applications.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-border/50 bg-muted/30 py-16 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-muted">
              <FileText className="h-7 w-7 text-muted-foreground" />
            </div>
            <h3 className="mb-2 font-sans font-medium text-foreground">
              {t("applications.empty.title")}
            </h3>
            <p className="mb-6 max-w-xs font-sans text-sm text-muted-foreground">
              {t("applications.empty.description")}
            </p>
            <Button onClick={() => navigate("/results")} variant="outline" className="gap-2 border-primary/30 text-primary hover:bg-primary/5 hover:text-primary">
              {t("applications.empty.cta")}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="grid gap-4">
            {applications.map((app) => (
              <div
                key={app.programId}
                className="group rounded-2xl border border-border/50 bg-card p-5 transition-soft hover:border-border hover:shadow-sm"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="font-sans font-medium text-foreground">
                      {t(app.titleKey as Parameters<typeof t>[0])}
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {t("applications.startedOn")} {formatTimeAgo(app.startedAt)}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/application/${app.programId}`)}
                    className="gap-2 border-primary/30 text-primary hover:bg-primary/5 hover:text-primary opacity-80 transition-opacity group-hover:opacity-100"
                  >
                    {t("applications.continue")}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
                <div className="mt-4">
                  <div className="mb-1.5 flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{t("application.progress")}</span>
                    <span className="font-medium text-foreground">{app.progress}%</span>
                  </div>
                  <Progress value={app.progress} className="h-2" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
};

export default Applications;
