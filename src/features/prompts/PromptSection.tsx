import { useMemo } from "react";
import { User, FolderTree, Sparkles } from "lucide-react";
import { PromptCard } from "./PromptCard";
import {
    generateUserProfilePrompt,
    generateListCategoryPrompt,
} from "./promptGenerators";
import type { StarredRepo, LanguageStat } from "@/types/github";
import { useLanguage } from "@/i18n";

interface Props {
    username: string;
    repos: StarredRepo[];
    languageStats: LanguageStat[];
    healthSummary: {
        active: number;
        stale: number;
        archived: number;
        abandoned: number;
    };
}

export function PromptSection({
    username,
    repos,
    languageStats,
    healthSummary,
}: Props) {
    const { t } = useLanguage();

    // Sort repos by starred_at (most recent first)
    const sortedRepos = useMemo(() => {
        return [...repos].sort((a, b) => {
            const dateA = a.starred_at ?? a.created_at;
            const dateB = b.starred_at ?? b.created_at;
            return dateB.localeCompare(dateA);
        });
    }, [repos]);

    // Generate prompts
    const userProfilePrompt = useMemo(() => {
        const recentRepos = sortedRepos.slice(0, 100);
        return generateUserProfilePrompt({
            username,
            totalStars: repos.length,
            recentRepos,
            languageStats,
            healthSummary,
        });
    }, [username, repos.length, sortedRepos, languageStats, healthSummary]);

    const listCategoryPrompt = useMemo(() => {
        const recentRepos = sortedRepos.slice(0, 300);
        return generateListCategoryPrompt({
            username,
            recentRepos,
        });
    }, [username, sortedRepos]);

    return (
        <div className="h-full">
            {/* Section Header */}
            <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-orange-500" />
                </div>
                <div>
                    <h2 className="font-semibold text-gray-900 leading-none">
                        {t.prompts.title}
                    </h2>
                    <span className="text-xs text-gray-500">
                        {t.prompts.subtitle}
                    </span>
                </div>
            </div>

            {/* Prompt Cards */}
            <div className="space-y-4">
                <PromptCard
                    title={t.prompts.userProfile.title}
                    description={t.prompts.userProfile.description.replace(
                        "{count}",
                        String(Math.min(100, repos.length))
                    )}
                    icon={<User className="w-5 h-5" />}
                    prompt={userProfilePrompt}
                />
                <PromptCard
                    title={t.prompts.listCategory.title}
                    description={t.prompts.listCategory.description.replace(
                        "{count}",
                        String(Math.min(300, repos.length))
                    )}
                    icon={<FolderTree className="w-5 h-5" />}
                    prompt={listCategoryPrompt}
                />
            </div>
        </div>
    );
}
