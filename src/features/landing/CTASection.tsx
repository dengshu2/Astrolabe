import { ArrowRight } from "lucide-react";
import { useLanguage } from "@/i18n";

export function CTASection() {
    const { t } = useLanguage();

    return (
        <div className="py-24 bg-(--color-background-alt) border-t border-gray-100">
            <div className="max-w-4xl mx-auto px-4 text-center">
                <h2 className="text-3xl md:text-4xl font-bold mb-6">
                    {t.landing.ctaHeading}
                </h2>
                <p className="text-lg text-(--color-text-secondary) mb-8 max-w-2xl mx-auto">
                    {t.landing.ctaDescription}
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <button
                        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                        className="px-8 py-3.5 rounded-full bg-(--color-brand) text-white font-semibold hover:bg-(--color-brand-dark) transition-all shadow-lg shadow-blue-500/25 flex items-center gap-2"
                    >
                        {t.landing.ctaButton}
                        <ArrowRight className="w-4 h-4" />
                    </button>

                    <a
                        href="https://github.com/dengshu2/Astrolabe"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-8 py-3.5 rounded-full bg-white text-gray-700 border border-gray-200 font-medium hover:border-gray-300 hover:bg-gray-50 transition-all"
                    >
                        {t.landing.ctaGithub}
                    </a>
                </div>
            </div>
        </div>
    );
}
