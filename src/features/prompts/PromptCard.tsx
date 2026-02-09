import { useState, type ReactNode } from "react";
import { Copy, Check, ChevronDown, ChevronUp } from "lucide-react";
import { useLanguage } from "@/i18n";

interface Props {
    title: string;
    description: string;
    icon: ReactNode;
    prompt: string;
    defaultExpanded?: boolean;
}

export function PromptCard({
    title,
    description,
    icon,
    prompt,
    defaultExpanded = false,
}: Props) {
    const [expanded, setExpanded] = useState(defaultExpanded);
    const [copied, setCopied] = useState(false);
    const { t } = useLanguage();

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(prompt);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error("Failed to copy:", err);
        }
    };

    return (
        <div className="bg-[var(--color-surface-raised)] rounded-xl border border-[var(--color-border)] overflow-hidden">
            {/* Header */}
            <div
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-[var(--color-surface-hover)] transition-colors"
                onClick={() => setExpanded(!expanded)}
            >
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[var(--color-brand)]/10 flex items-center justify-center text-[var(--color-brand)]">
                        {icon}
                    </div>
                    <div>
                        <h3 className="font-medium text-[var(--color-text-primary)]">
                            {title}
                        </h3>
                        <p className="text-xs text-[var(--color-text-muted)]">
                            {description}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            handleCopy();
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-[var(--color-brand)] text-white hover:opacity-90 transition-opacity"
                    >
                        {copied ? (
                            <>
                                <Check className="w-3.5 h-3.5" />
                                {t.prompts.copied}
                            </>
                        ) : (
                            <>
                                <Copy className="w-3.5 h-3.5" />
                                {t.prompts.copy}
                            </>
                        )}
                    </button>
                    {expanded ? (
                        <ChevronUp className="w-5 h-5 text-[var(--color-text-muted)]" />
                    ) : (
                        <ChevronDown className="w-5 h-5 text-[var(--color-text-muted)]" />
                    )}
                </div>
            </div>

            {/* Content */}
            {expanded && (
                <div className="border-t border-[var(--color-border)] p-4">
                    <pre className="text-xs text-[var(--color-text-secondary)] whitespace-pre-wrap font-mono bg-[var(--color-surface)] rounded-lg p-4 max-h-96 overflow-y-auto">
                        {prompt}
                    </pre>
                </div>
            )}
        </div>
    );
}
