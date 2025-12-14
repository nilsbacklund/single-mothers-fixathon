import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { EligibilityProvider } from "@/contexts/EligibilityContext";
import { ApplicationsProvider } from "@/contexts/ApplicationsContext";
import Index from "./pages/Index";
import Results from "./pages/Results";
import Applications from "./pages/Applications";
import Application from "./pages/Application";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <EligibilityProvider>
        <ApplicationsProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/results" element={<Results />} />
                <Route path="/applications" element={<Applications />} />
                <Route path="/application/:programId" element={<Application />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </ApplicationsProvider>
      </EligibilityProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
