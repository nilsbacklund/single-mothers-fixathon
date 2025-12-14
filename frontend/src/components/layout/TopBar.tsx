import { Link, useLocation } from "react-router-dom";
import { Globe, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslation } from "@/hooks/useTranslation";
import hulpwijzerLogo from "@/assets/hulpwijzer-logo.svg";

const languages = [
  { code: "en" as const, label: "English" },
  { code: "nl" as const, label: "Nederlands" },
  { code: "ar" as const, label: "العربية" },
  { code: "tr" as const, label: "Türkçe" },
];

const TopBar = () => {
  const location = useLocation();
  const { language, setLanguage } = useLanguage();
  const { t } = useTranslation();
  
  const isActive = (path: string) => location.pathname === path;
  const currentLang = languages.find(l => l.code === language);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="container flex h-14 items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <img src={hulpwijzerLogo} alt="Hulpwijzer" className="h-10 w-10" />
          <span className="text-lg font-semibold text-foreground">Hulpwijzer</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          <Link to="/">
            <Button 
              variant={isActive("/") ? "secondary" : "ghost"} 
              size="sm"
              className="text-sm"
            >
              {t("nav.home")}
            </Button>
          </Link>
          <Link to="/results">
            <Button 
              variant={isActive("/results") ? "secondary" : "ghost"} 
              size="sm"
              className="text-sm"
            >
              {t("nav.yourOptions")}
            </Button>
          </Link>
          <Link to="/applications">
            <Button 
              variant={isActive("/applications") ? "secondary" : "ghost"} 
              size="sm"
              className="text-sm"
            >
              {t("nav.yourApplications")}
            </Button>
          </Link>
        </nav>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground">
              <Globe className="h-4 w-4" />
              <span className="hidden sm:inline uppercase">{currentLang?.code}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 bg-background">
            {languages.map((lang) => (
              <DropdownMenuItem
                key={lang.code}
                onClick={() => setLanguage(lang.code)}
                className="flex items-center justify-between"
              >
                {lang.label}
                {language === lang.code && <Check className="h-4 w-4 text-primary" />}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
              {t("language.moreComing")}
            </DropdownMenuLabel>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default TopBar;
