import { BarChart3, Zap, Download, Sparkles } from "lucide-react";
import { useLanguage } from "@/i18n";

export function FeatureSection() {
    const { t } = useLanguage();

    const features = [
        {
            icon: BarChart3,
            title: t.landing.features.visualInsights.title,
            description: t.landing.features.visualInsights.description,
            color: "text-blue-500",
            bg: "bg-blue-50",
        },
        {
            icon: Zap,
            title: t.landing.features.zeroFriction.title,
            description: t.landing.features.zeroFriction.description,
            color: "text-amber-500",
            bg: "bg-amber-50",
        },
        {
            icon: Download,
            title: t.landing.features.dataExport.title,
            description: t.landing.features.dataExport.description,
            color: "text-green-500",
            bg: "bg-green-50",
        },
        {
            icon: Sparkles,
            title: t.landing.features.aiPrompts.title,
            description: t.landing.features.aiPrompts.description,
            color: "text-purple-500",
            bg: "bg-purple-50",
        },
    ];

    return (
        <div className="py-24 bg-white relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 relative z-10">
                <div className="text-center max-w-2xl mx-auto mb-16">
                    <h2 className="font-bold mb-4">
                        Everything you need to <span className="text-(--color-brand)">understand traffic</span>
                    </h2>
                    <p className="text-lg text-(--color-text-secondary)">
                        Powerful features to help you grow your open source presence and understand your audience.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {features.map(({ icon: Icon, title, description, color, bg }) => (
                        <div
                            key={title}
                            className="group p-8 rounded-2xl bg-(--color-background-alt) hover:bg-white border border-transparent hover:border-gray-100 hover:shadow-xl transition-all duration-300"
                        >
                            <div className={`inline-flex p-3 rounded-xl mb-6 ${bg} group-hover:scale-110 transition-transform`}>
                                <Icon className={`w-6 h-6 ${color}`} />
                            </div>
                            <h3 className="text-lg font-bold mb-3 text-gray-900">{title}</h3>
                            <p className="text-sm text-(--color-text-muted) leading-relaxed">
                                {description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
