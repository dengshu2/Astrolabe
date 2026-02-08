import { useLanguage, type Language } from "@/i18n";
import { Globe } from "lucide-react";
import { cn } from "@/lib/utils";

const languages: { code: Language; label: string }[] = [
    { code: "en", label: "EN" },
    { code: "zh", label: "中" },
];

export function LanguageSwitch() {
    const { language, setLanguage } = useLanguage();

    return (
        <div className="flex items-center gap-1 bg-[var(--color-surface-raised)] rounded-lg border border-[var(--color-border)] p-0.5">
            <Globe className="w-4 h-4 text-[var(--color-text-muted)] ml-1.5" />
            {languages.map(({ code, label }) => (
                <button
                    key={code}
                    onClick={() => setLanguage(code)}
                    className={cn(
                        "px-2 py-1 text-xs rounded-md transition-colors",
                        language === code
                            ? "bg-[var(--color-surface-overlay)] text-[var(--color-text-primary)] font-medium"
                            : "text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]"
                    )}
                >
                    {label}
                </button>
            ))}
        </div>
    );
}
