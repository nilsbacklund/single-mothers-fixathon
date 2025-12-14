import { useState } from "react";
import { User, Users, Wallet, PiggyBank, MapPin, Edit2 } from "lucide-react";
import { useEligibility } from "@/contexts/EligibilityContext";
import { useTranslation } from "@/hooks/useTranslation";
import ProfileEditDialog from "./ProfileEditDialogue";

const ProfileSummaryBar = () => {
  const { data } = useEligibility();
  const { t } = useTranslation();
  const [editOpen, setEditOpen] = useState(false);

  const formatCurrency = (value: number | undefined) => {
    if (value === undefined) return "—";
    return `€${value.toLocaleString()}`;
  };

  return (
    <>
      <div className="w-full border-b border-border bg-warm">
        <div className="container flex flex-wrap items-center justify-between gap-3 py-3">
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <span className="font-medium text-foreground">{t("profile.title")}:</span>
            
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <User className="h-3.5 w-3.5" />
              <span>
                {data.isSingleParent 
                  ? t("profile.values.yes") 
                  : data.isSingleParent === false 
                    ? t("profile.values.no") 
                    : "—"}
              </span>
            </div>
            
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Users className="h-3.5 w-3.5" />
              <span>
                {data.numberOfChildren !== undefined 
                  ? `${data.numberOfChildren} ${t("profile.fields.numberOfChildren").toLowerCase()}`
                  : "—"}
              </span>
            </div>
            
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Wallet className="h-3.5 w-3.5" />
              <span>{formatCurrency(data.netIncome as number)}/mo</span>
            </div>
            
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <PiggyBank className="h-3.5 w-3.5" />
              <span>{formatCurrency(data.savingsAssets as number)}</span>
            </div>
            
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <MapPin className="h-3.5 w-3.5" />
              <span>{(data.municipality as string) || "—"}</span>
            </div>
          </div>
          
          <button
            onClick={() => setEditOpen(true)}
            className="flex items-center gap-1.5 text-sm font-medium text-primary transition-soft hover:text-primary/80"
          >
            <Edit2 className="h-3.5 w-3.5" />
            <span>{t("profile.edit")}</span>
          </button>
        </div>
      </div>
      
      <ProfileEditDialog open={editOpen} onOpenChange={setEditOpen} />
    </>
  );
};

export default ProfileSummaryBar;
