import {
    useState,
    useCallback,
    type ReactNode,
} from "react";
import { en } from "./translations/en";
import { zh } from "./translations/zh";
import { LanguageContext, type Language } from "./languageTypes";

const translations: Record<Language, typeof en> = { en, zh };

const STORAGE_KEY = "astrolabe-language";

function getInitialLanguage(): Language {
    // Check localStorage first
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "en" || stored === "zh") {
        return stored;
    }
    // Fall back to browser language
    const browserLang = navigator.language.toLowerCase();
    if (browserLang.startsWith("zh")) {
        return "zh";
    }
    return "en";
}

export function LanguageProvider({ children }: { children: ReactNode }) {
    const [language, setLanguageState] = useState<Language>(getInitialLanguage);

    const setLanguage = useCallback((lang: Language) => {
        setLanguageState(lang);
        localStorage.setItem(STORAGE_KEY, lang);
    }, []);

    const value = {
        language,
        setLanguage,
        t: translations[language],
    };

    return (
        <LanguageContext.Provider value={value}>
            {children}
        </LanguageContext.Provider>
    );
}
