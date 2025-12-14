import { User, Users, Briefcase, MapPin } from "lucide-react";

interface ProfileData {
  status?: string;
  children?: string;
  employment?: string;
  location?: string;
}

interface ProfileSummaryProps {
  data?: ProfileData;
  className?: string;
}

const defaultData: ProfileData = {
  status: "Single parent",
  children: "2 children",
  employment: "Part-time employed",
  location: "Netherlands",
};

const ProfileSummary = ({ data = defaultData, className }: ProfileSummaryProps) => {
  return (
    <div className={className}>
      <h3 className="mb-4 text-sm font-medium text-foreground">Your info so far</h3>
      <div className="space-y-3">
        <div className="flex items-center gap-3 text-sm">
          <User className="h-4 w-4 text-primary" />
          <span className="text-muted-foreground">{data.status || "—"}</span>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <Users className="h-4 w-4 text-primary" />
          <span className="text-muted-foreground">{data.children || "—"}</span>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <Briefcase className="h-4 w-4 text-primary" />
          <span className="text-muted-foreground">{data.employment || "—"}</span>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <MapPin className="h-4 w-4 text-primary" />
          <span className="text-muted-foreground">{data.location || "—"}</span>
        </div>
      </div>
    </div>
  );
};

export default ProfileSummary;
