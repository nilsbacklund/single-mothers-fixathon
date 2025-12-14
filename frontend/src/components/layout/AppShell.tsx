import { ReactNode } from "react";
import TopBar from "./TopBar";
import TrustStrip from "./TrustStrip";

interface AppShellProps {
  children: ReactNode;
  showTrustStrip?: boolean;
}

const AppShell = ({ children, showTrustStrip = true }: AppShellProps) => {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <TopBar />
      {showTrustStrip && <TrustStrip />}
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
};

export default AppShell;
