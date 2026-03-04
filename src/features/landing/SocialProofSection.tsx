import { Users } from "lucide-react";
import { useLanguage } from "@/i18n";

interface Props {
    onUserSelect: (username: string) => void;
}

export function SocialProofSection({ onUserSelect }: Props) {
    const { t } = useLanguage();

    const suggestedUsers = [
        { username: "torvalds", label: "Linus Torvalds", avatar: "https://github.com/torvalds.png" },
        { username: "yyx990803", label: "Evan You", avatar: "https://github.com/yyx990803.png" },
        { username: "gaearon", label: "Dan Abramov", avatar: "https://github.com/gaearon.png" },
        { username: "ruanyf", label: "阮一峰", avatar: "https://github.com/ruanyf.png" },
        { username: "antfu", label: "Anthony Fu", avatar: "https://github.com/antfu.png" },
        { username: "sindresorhus", label: "Sindre Sorhus", avatar: "https://github.com/sindresorhus.png" },
    ];

    return (
        <div className="py-12 border-y border-gray-100 bg-(--color-background-alt)">
            <div className="max-w-7xl mx-auto px-4 text-center">
                <div className="flex items-center justify-center gap-2 mb-6 text-(--color-text-muted)">
                    <Users className="w-4 h-4" />
                    <span className="text-sm font-semibold uppercase tracking-wider">
                        {t.landing.suggestedUsers}
                    </span>
                </div>

                <div className="flex flex-wrap justify-center gap-4">
                    {suggestedUsers.map(({ username, label, avatar }) => (
                        <button
                            key={username}
                            onClick={() => onUserSelect(username)}
                            className="group flex items-center gap-3 pl-1 pr-4 py-1.5 rounded-full bg-white border border-gray-200 shadow-sm hover:border-blue-300 hover:shadow-md transition-all duration-300"
                        >
                            <img
                                src={avatar}
                                alt={label}
                                className="w-8 h-8 rounded-full bg-gray-100"
                                loading="lazy"
                            />
                            <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600">
                                {label}
                            </span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
