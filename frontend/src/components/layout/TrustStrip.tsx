import { Shield, Lock, Heart } from "lucide-react";

const TrustStrip = () => {
  return (
    <div className="w-full border-b border-border bg-accent/50">
      <div className="container flex flex-wrap items-center justify-center gap-4 py-2 text-xs text-muted-foreground sm:gap-6 md:gap-8">
        <div className="flex items-center gap-1.5">
          <Shield className="h-3.5 w-3.5 text-primary" />
          <span>Independent guidance</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Lock className="h-3.5 w-3.5 text-primary" />
          <span>Not connected to government systems</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Heart className="h-3.5 w-3.5 text-primary" />
          <span>Your data stays with you</span>
        </div>
      </div>
    </div>
  );
};

export default TrustStrip;
