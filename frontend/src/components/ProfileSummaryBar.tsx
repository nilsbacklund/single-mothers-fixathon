import { Link } from "react-router-dom";
import { User, Users, Briefcase, Edit2 } from "lucide-react";

interface ProfileData {
  status?: string;
  children?: string;
  employment?: string;
}

interface ProfileSummaryBarProps {
  data?: ProfileData;
}

const defaultData: ProfileData = {
  status: "Single parent",
  children: "2 children",
  employment: "Part-time",
};

const ProfileSummaryBar = ({ data = defaultData }: ProfileSummaryBarProps) => {
  return (
    <div className="w-full border-b border-border bg-warm">
      <div className="container flex flex-wrap items-center justify-between gap-3 py-3">
        <div className="flex flex-wrap items-center gap-4 text-sm">
          <span className="font-medium text-foreground">Your profile:</span>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <User className="h-3.5 w-3.5" />
            <span>{data.status}</span>
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Users className="h-3.5 w-3.5" />
            <span>{data.children}</span>
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Briefcase className="h-3.5 w-3.5" />
            <span>{data.employment}</span>
          </div>
        </div>
        <Link
          to="/intake"
          className="flex items-center gap-1.5 text-sm font-medium text-primary transition-soft hover:text-primary/80"
        >
          <Edit2 className="h-3.5 w-3.5" />
          <span>Edit info</span>
        </Link>
      </div>
    </div>
  );
};

export default ProfileSummaryBar;
