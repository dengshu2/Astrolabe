import { useState, useEffect, type FormEvent } from "react";
import { Settings, X, Key, Check, AlertCircle, ExternalLink } from "lucide-react";
import { getStoredToken, saveToken, removeToken } from "@/lib/token";
import { useLanguage } from "@/i18n";

interface Props {
    onTokenChange?: () => void;
}

export function TokenSettings({ onTokenChange }: Props) {
    const [isOpen, setIsOpen] = useState(false);
    const [token, setToken] = useState("");
    const [hasToken, setHasToken] = useState(false);
    const [showToken, setShowToken] = useState(false);
    const { t } = useLanguage();

    useEffect(() => {
        const stored = getStoredToken();
        setHasToken(!!stored);
        if (stored) {
            setToken(stored);
        }
    }, []);

    const handleSave = (e: FormEvent) => {
        e.preventDefault();
        const trimmed = token.trim();
        if (trimmed) {
            saveToken(trimmed);
            setHasToken(true);
            setIsOpen(false);
            onTokenChange?.();
        }
    };

    const handleRemove = () => {
        removeToken();
        setToken("");
        setHasToken(false);
        onTokenChange?.();
    };

    return (
        <>
            {/* Settings button */}
            <button
                onClick={() => setIsOpen(true)}
                className="p-2 rounded-lg hover:bg-[var(--color-surface-raised)] transition-colors"
                title={t.header.apiSettings}
            >
                <Settings className="w-5 h-5 text-[var(--color-text-muted)]" />
                {hasToken && (
                    <span className="absolute top-0 right-0 w-2 h-2 bg-green-500 rounded-full" />
                )}
            </button>

            {/* Modal overlay */}
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={() => setIsOpen(false)}
                    />

                    {/* Modal */}
                    <div className="relative bg-[var(--color-surface-raised)] rounded-xl border border-[var(--color-border)] shadow-2xl w-full max-w-md p-6 animate-in fade-in zoom-in duration-200">
                        {/* Close button */}
                        <button
                            onClick={() => setIsOpen(false)}
                            className="absolute top-4 right-4 p-1 rounded hover:bg-[var(--color-surface-overlay)] transition-colors"
                        >
                            <X className="w-5 h-5 text-[var(--color-text-muted)]" />
                        </button>

                        {/* Header */}
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 rounded-lg bg-[var(--color-brand)]/10">
                                <Key className="w-5 h-5 text-[var(--color-brand)]" />
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
                                    {t.token.title}
                                </h2>
                                <p className="text-xs text-[var(--color-text-muted)]">
                                    {t.token.subtitle}
                                </p>
                            </div>
                        </div>

                        {/* Status */}
                        <div
                            className={`flex items-center gap-2 p-3 rounded-lg mb-4 ${hasToken
                                ? "bg-green-500/10 text-green-400"
                                : "bg-yellow-500/10 text-yellow-400"
                                }`}
                        >
                            {hasToken ? (
                                <>
                                    <Check className="w-4 h-4" />
                                    <span className="text-sm">{t.token.configured}</span>
                                </>
                            ) : (
                                <>
                                    <AlertCircle className="w-4 h-4" />
                                    <span className="text-sm">{t.token.notConfigured}</span>
                                </>
                            )}
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSave} className="space-y-4">
                            <div>
                                <label className="block text-sm text-[var(--color-text-secondary)] mb-2">
                                    {t.token.label}
                                </label>
                                <div className="relative">
                                    <input
                                        type={showToken ? "text" : "password"}
                                        value={token}
                                        onChange={(e) => setToken(e.target.value)}
                                        placeholder={t.token.placeholder}
                                        className="w-full px-4 py-2.5 pr-20 rounded-lg bg-[var(--color-surface-overlay)] border border-[var(--color-border)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-brand)] focus:ring-1 focus:ring-[var(--color-brand)] text-sm font-mono transition-colors"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowToken(!showToken)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]"
                                    >
                                        {showToken ? t.common.hide : t.common.show}
                                    </button>
                                </div>
                            </div>

                            <div className="text-xs text-[var(--color-text-muted)] space-y-1">
                                <p>{t.token.securityNote}</p>
                                <a
                                    href="https://github.com/settings/tokens/new?description=Astrolabe&scopes="
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 text-[var(--color-brand)] hover:underline"
                                >
                                    {t.token.createToken}
                                    <ExternalLink className="w-3 h-3" />
                                </a>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setIsOpen(false)}
                                    className="flex-1 px-4 py-2.5 rounded-lg border border-[var(--color-border)] text-[var(--color-text-secondary)] text-sm font-medium hover:bg-[var(--color-surface-overlay)] transition-colors"
                                >
                                    {t.token.close}
                                </button>
                                {hasToken && (
                                    <button
                                        type="button"
                                        onClick={handleRemove}
                                        className="px-4 py-2.5 rounded-lg border border-red-500/30 text-red-400 text-sm font-medium hover:bg-red-500/10 transition-colors"
                                    >
                                        {t.token.removeToken}
                                    </button>
                                )}
                                <button
                                    type="submit"
                                    disabled={!token.trim()}
                                    className="flex-1 px-4 py-2.5 rounded-lg bg-[var(--color-brand)] text-white text-sm font-medium hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
                                >
                                    {t.common.save}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
