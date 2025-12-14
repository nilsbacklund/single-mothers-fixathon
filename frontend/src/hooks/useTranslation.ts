import { useLanguage } from "@/contexts/LanguageContext";
import { translations } from "@/i18n/translations";

type NestedKeyOf<T> = T extends object
  ? { [K in keyof T]: K extends string ? (T[K] extends object ? `${K}.${NestedKeyOf<T[K]>}` : K) : never }[keyof T]
  : never;

type TranslationKeys = NestedKeyOf<typeof translations.en>;

const getNestedValue = (obj: Record<string, unknown>, path: string): string => {
  const keys = path.split(".");
  let result: unknown = obj;
  
  for (const key of keys) {
    if (result && typeof result === "object" && key in result) {
      result = (result as Record<string, unknown>)[key];
    } else {
      return path; // Return the key if translation not found
    }
  }
  
  return typeof result === "string" ? result : path;
};

export const useTranslation = () => {
  const { language } = useLanguage();
  
  const t = (key: TranslationKeys | string): string => {
    return getNestedValue(translations[language] as Record<string, unknown>, key);
  };
  
  return { t, language };
};
