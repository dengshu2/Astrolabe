import {
  Star,
  GitFork,

  Clock,
} from "lucide-react";
import type { StarredRepo } from "@/types/github";
import {
  cn,
  classifyHealth,
  formatCount,
  getLanguageColor,
} from "@/lib/utils";
import { LANGUAGE_COLORS } from "@/lib/constants";
import { useLanguage } from "@/i18n";
import { useTimeAgo } from "@/hooks/useTimeAgo";

interface Props {
  repo: StarredRepo;
}

export function RepoCard({ repo }: Props) {
  const { t } = useLanguage();
  const timeAgo = useTimeAgo();
  const health = classifyHealth(repo);
  const langColor = getLanguageColor(repo.language, LANGUAGE_COLORS);

  const healthBadge: Record<string, { label: string; className: string }> = {
    active: { label: t.filters.active, className: "bg-emerald-50 text-emerald-600 border border-emerald-100" },
    stale: { label: t.filters.stale, className: "bg-amber-50 text-amber-600 border border-amber-100" },
    abandoned: { label: t.filters.abandoned, className: "bg-rose-50 text-rose-600 border border-rose-100" },
    archived: { label: t.filters.archived, className: "bg-slate-50 text-slate-500 border border-slate-100" },
  };

  const badge = healthBadge[health];

  return (
    <a
      href={repo.html_url}
      target="_blank"
      rel="noopener noreferrer"
      className="group bg-white hover:bg-gray-50 rounded-2xl border border-transparent shadow-sm hover:shadow-md hover:border-blue-100 p-5 flex flex-col gap-4 transition-all duration-300"
    >
      {/* Top row: owner + health badge */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <img
            src={repo.owner.avatar_url}
            alt={repo.owner.login}
            className="w-8 h-8 rounded-full shrink-0 border border-gray-100"
          />
          <div className="min-w-0">
            <span className="text-gray-900 font-semibold text-sm truncate block group-hover:text-blue-600 transition-colors">
              {repo.name}
            </span>
            <span className="text-gray-500 text-xs truncate block">
              {repo.owner.login}
            </span>
          </div>
        </div>
        <span
          className={cn(
            "shrink-0 text-[10px] font-semibold px-2.5 py-1 rounded-full uppercase tracking-wider",
            badge.className
          )}
        >
          {badge.label}
        </span>
      </div>

      {/* Description */}
      {repo.description && (
        <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
          {repo.description}
        </p>
      )}

      {/* Meta row */}
      <div className="flex items-center gap-4 text-xs text-gray-400 mt-auto pt-2 border-t border-gray-50">
        {repo.language && (
          <span className="flex items-center gap-1.5 text-gray-600">
            <span
              className="w-2.5 h-2.5 rounded-full ring-1 ring-inset ring-black/5"
              style={{ backgroundColor: langColor }}
            />
            {repo.language}
          </span>
        )}
        <span className="flex items-center gap-1">
          <Star className="w-3.5 h-3.5" />
          {formatCount(repo.stargazers_count)}
        </span>
        <span className="flex items-center gap-1">
          <GitFork className="w-3.5 h-3.5" />
          {formatCount(repo.forks_count)}
        </span>
        <span className="flex items-center gap-1 ml-auto">
          <Clock className="w-3.5 h-3.5" />
          {timeAgo(repo.pushed_at)}
        </span>
      </div>
    </a>
  );
}
