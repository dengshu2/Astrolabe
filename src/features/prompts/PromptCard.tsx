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
        <div className="bg-white rounded-2xl border border-transparent shadow-sm overflow-hidden hover:shadow-md transition-shadow">
            {/* Header */}
            <div
                className="flex items-center justify-between p-5 cursor-pointer hover:bg-gray-50/50 transition-colors"
                onClick={() => setExpanded(!expanded)}
            >
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                        {icon}
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-900">
                            {title}
                        </h3>
                        <p className="text-sm text-gray-500 mt-0.5">
                            {description}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            handleCopy();
                        }}
                        className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 active:scale-95 transition-all shadow-sm shadow-blue-500/20"
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
                        <ChevronUp className="w-5 h-5 text-gray-400" />
                    ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                </div>
            </div>

            {/* Content */}
            {expanded && (
                <div className="border-t border-gray-100 p-0">
                    <pre className="text-xs text-gray-600 whitespace-pre-wrap font-mono bg-gray-50/50 p-6 max-h-96 overflow-y-auto leading-relaxed">
                        {prompt}
                    </pre>
                </div>
            )}
        </div>
    );
}
