import { useState } from "react";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTranslation } from "@/hooks/useTranslation";
import { Loader2 } from "lucide-react";

const emailSchema = z.string().trim().email().max(255);
const nameSchema = z.string().trim().min(1).max(50);

interface EmailCaptureDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  programId: string;
  programTitleKey: string;
  onSuccess: () => void;
}

const EmailCaptureDialog = ({
  open,
  onOpenChange,
  programId,
  programTitleKey,
  onSuccess,
}: EmailCaptureDialogProps) => {
  const { t } = useTranslation();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [nameError, setNameError] = useState("");
  const [emailError, setEmailError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setNameError("");
    setEmailError("");

    // Validate name
    const nameResult = nameSchema.safeParse(name);
    if (!nameResult.success) {
      setNameError(t("emailCapture.invalidName"));
      return;
    }

    // Validate email
    const emailResult = emailSchema.safeParse(email);
    if (!emailResult.success) {
      setEmailError(t("emailCapture.invalidEmail"));
      return;
    }

    setIsLoading(true);

    try {
      // Store locally (session-level persistence)
      localStorage.setItem("hulpwijzer_user_email", emailResult.data);
      localStorage.setItem("hulpwijzer_user_name", nameResult.data);
      localStorage.setItem("hulpwijzer_program_id", programId);
      localStorage.setItem("hulpwijzer_program_title_key", programTitleKey);

      onSuccess();
      onOpenChange(false);
      setName("");
      setEmail("");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-sans text-xl">
            {t("emailCapture.title")}
          </DialogTitle>
          <DialogDescription className="font-sans text-muted-foreground">
            {t("emailCapture.description")}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="font-sans">
              {t("emailCapture.nameLabel")}
            </Label>
            <Input
              id="name"
              type="text"
              placeholder={t("emailCapture.namePlaceholder")}
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setNameError("");
              }}
              className="font-sans"
              autoFocus
            />
            {nameError && (
              <p className="text-sm text-destructive font-sans">{nameError}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="font-sans">
              {t("emailCapture.label")}
            </Label>
            <Input
              id="email"
              type="email"
              placeholder={t("emailCapture.placeholder")}
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setEmailError("");
              }}
              className="font-sans"
            />
            {emailError && (
              <p className="text-sm text-destructive font-sans">{emailError}</p>
            )}
          </div>

          <div className="flex gap-3 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="font-sans"
            >
              {t("emailCapture.cancel")}
            </Button>

            <Button
              type="submit"
              disabled={isLoading || !email.trim() || !name.trim()}
              className="font-sans"
            >
              {isLoading && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {t("emailCapture.continue")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EmailCaptureDialog;
