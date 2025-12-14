import { useState, useEffect } from "react";
import { useEligibility } from "@/contexts/EligibilityContext";
import { useTranslation } from "@/hooks/useTranslation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface ProfileEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ProfileEditDialog = ({ open, onOpenChange }: ProfileEditDialogProps) => {
  const { data, updateField } = useEligibility();
  const { t } = useTranslation();

  // Local form state
  const [isSingleParent, setIsSingleParent] = useState<string>("");
  const [numberOfChildren, setNumberOfChildren] = useState<string>("");
  const [netIncome, setNetIncome] = useState<string>("");
  const [savingsAssets, setSavingsAssets] = useState<string>("");
  const [municipality, setMunicipality] = useState<string>("");

  // Sync local state with context when dialog opens
  useEffect(() => {
    if (open) {
      setIsSingleParent(
        data.isSingleParent === true ? "yes" : data.isSingleParent === false ? "no" : ""
      );
      setNumberOfChildren(data.numberOfChildren?.toString() || "");
      setNetIncome(data.netIncome?.toString() || "");
      setSavingsAssets(data.savingsAssets?.toString() || "");
      setMunicipality((data.municipality as string) || "");
    }
  }, [open, data]);

  const handleSave = () => {
    // Update context with form values
    if (isSingleParent) {
      updateField("isSingleParent", isSingleParent === "yes");
    }
    if (numberOfChildren) {
      updateField("numberOfChildren", parseInt(numberOfChildren, 10));
    }
    if (netIncome) {
      updateField("netIncome", parseInt(netIncome, 10));
    }
    if (savingsAssets) {
      updateField("savingsAssets", parseInt(savingsAssets, 10));
    }
    if (municipality) {
      updateField("municipality", municipality);
    }

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("profile.editTitle")}</DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-4">
          {/* Single Parent */}
          <div className="space-y-2">
            <Label>{t("profile.fields.isSingleParent")}</Label>
            <RadioGroup
              value={isSingleParent}
              onValueChange={setIsSingleParent}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id="single-yes" />
                <Label htmlFor="single-yes" className="font-normal cursor-pointer">
                  {t("profile.values.yes")}
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="single-no" />
                <Label htmlFor="single-no" className="font-normal cursor-pointer">
                  {t("profile.values.no")}
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Number of Children */}
          <div className="space-y-2">
            <Label htmlFor="children">{t("profile.fields.numberOfChildren")}</Label>
            <Input
              id="children"
              type="number"
              min="0"
              max="20"
              value={numberOfChildren}
              onChange={(e) => setNumberOfChildren(e.target.value)}
              placeholder="0"
            />
          </div>

          {/* Net Income */}
          <div className="space-y-2">
            <Label htmlFor="income">{t("profile.fields.netIncome")}</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                €
              </span>
              <Input
                id="income"
                type="number"
                min="0"
                value={netIncome}
                onChange={(e) => setNetIncome(e.target.value)}
                className="pl-7"
                placeholder="0"
              />
            </div>
          </div>

          {/* Savings/Assets */}
          <div className="space-y-2">
            <Label htmlFor="savings">{t("profile.fields.savingsAssets")}</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                €
              </span>
              <Input
                id="savings"
                type="number"
                min="0"
                value={savingsAssets}
                onChange={(e) => setSavingsAssets(e.target.value)}
                className="pl-7"
                placeholder="0"
              />
            </div>
          </div>

          {/* Municipality */}
          <div className="space-y-2">
            <Label htmlFor="municipality">{t("profile.fields.municipality")}</Label>
            <Input
              id="municipality"
              type="text"
              value={municipality}
              onChange={(e) => setMunicipality(e.target.value)}
              placeholder={t("profile.municipalityPlaceholder")}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("profile.cancel")}
          </Button>
          <Button onClick={handleSave}>{t("profile.save")}</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProfileEditDialog;
