import { useState, useEffect } from "react";
import { Mail } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import EmailCaptureDialog from "./EmailCaptureDialog";

interface EmailBannerProps {
  className?: string;
}

const EmailBanner = ({ className }: EmailBannerProps) => {
  const { t } = useTranslation();
  const [name, setName] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [showDialog, setShowDialog] = useState(false);

  useEffect(() => {
    setName(localStorage.getItem("hulpwijzer_user_name"));
    setEmail(localStorage.getItem("hulpwijzer_user_email"));
  }, []);

  // Don't render if no email
  if (!email) return null;

  const bannerText = name
    ? t("emailCapture.banner").replace("{name}", name).replace("{email}", email)
    : t("emailCapture.bannerNoName").replace("{email}", email);

  const handleSuccess = () => {
    setName(localStorage.getItem("hulpwijzer_user_name"));
    setEmail(localStorage.getItem("hulpwijzer_user_email"));
  };

  return (
    <>
      <div
        className={`flex items-center justify-between gap-4 rounded-xl border border-border/50 bg-muted/30 px-4 py-3 ${className || ""}`}
      >
        <div className="flex items-center gap-3">
          <Mail className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            {bannerText}
          </span>
        </div>
        <button
          onClick={() => setShowDialog(true)}
          className="text-sm text-primary hover:underline"
        >
          {t("emailCapture.change")}
        </button>
      </div>

      <EmailCaptureDialog
        open={showDialog}
        onOpenChange={setShowDialog}
        programId=""
        programTitleKey=""
        onSuccess={handleSuccess}
      />
    </>
  );
};

export default EmailBanner;
