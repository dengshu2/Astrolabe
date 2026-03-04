import { createContext } from "react";
import type { Translations } from "./translations/en";

export type Language = "en" | "zh";

export interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: Translations;
}

export const LanguageContext = createContext<LanguageContextType | null>(null);
