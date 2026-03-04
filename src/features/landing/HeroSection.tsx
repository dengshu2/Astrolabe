import { useState, type FormEvent } from "react";
import { Search, ArrowRight } from "lucide-react";
import { useLanguage } from "@/i18n";

interface Props {
    onSubmit: (username: string) => void;
}

export function HeroSection({ onSubmit }: Props) {
    const [input, setInput] = useState("");
    const { t } = useLanguage();

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        const trimmed = input.trim();
        if (trimmed) onSubmit(trimmed);
    };

    return (
        <div className="relative flex-1 flex flex-col justify-center pb-16 md:pb-24 overflow-hidden">
            {/* Background Gradients */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none z-0">
                <div className="absolute top-[-20%] left-[10%] w-[500px] h-[500px] rounded-full bg-blue-400/20 blur-[100px] animate-float" />
                <div className="absolute top-[10%] right-[10%] w-[400px] h-[400px] rounded-full bg-purple-400/20 blur-[100px] animate-float-delayed" />
            </div>

            <div className="max-w-4xl mx-auto text-center px-4 relative z-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-sm font-medium mb-8 animate-fade-in-up">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                    </span>
                    {t.landing.heroBadge}
                </div>

                <h1 className="font-bold tracking-tight mb-6 leading-tight">
                    {t.landing.heroTitle}{" "}
                    <span className="text-transparent bg-clip-text bg-linear-to-r from-(--color-brand) to-(--color-accent)">
                        {t.landing.heroTitleHighlight}
                    </span>{" "}
                    {t.landing.heroTitleEnd}
                </h1>

                <p className="text-xl text-(--color-text-secondary) mb-10 max-w-2xl mx-auto leading-relaxed">
                    {t.landing.heroDescription}
                </p>

                {/* Search Input */}
                <div className="max-w-lg mx-auto bg-white p-2 rounded-2xl shadow-xl shadow-blue-900/5 ring-1 ring-gray-200/50">
                    <form onSubmit={handleSubmit} className="relative flex items-center">
                        <Search className="absolute left-4 w-5 h-5 text-gray-400" />

                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder={t.landing.inputPlaceholder}
                            autoFocus
                            className="w-full pl-12 pr-4 py-3.5 bg-transparent border-none text-gray-900 placeholder:text-gray-400 focus:outline-none text-base"
                        />

                        <button
                            type="submit"
                            disabled={!input.trim()}
                            className="shrink-0 whitespace-nowrap px-6 py-2.5 rounded-xl bg-(--color-brand) text-white font-semibold hover:bg-(--color-brand-dark) disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-500/20 flex items-center gap-2"
                        >
                            {t?.landing?.exploreButton || "Explore"}
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    </form>
                </div>

                <p className="mt-4 text-sm text-(--color-text-muted)">
                    {t.landing.hint}
                </p>
            </div>
        </div>
    );
}
