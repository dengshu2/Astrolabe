import {
  Star,
  GitFork,
  ExternalLink,
  Clock,
} from "lucide-react";
import type { StarredRepo } from "@/types/github";
import {
  cn,
  classifyHealth,
  formatCount,
  getLanguageColor,
  timeAgo,
} from "@/lib/utils";
import { LANGUAGE_COLORS } from "@/lib/constants";

interface Props {
  repo: StarredRepo;
}

const healthBadge: Record<string, { label: string; className: string }> = {
  active: { label: "Active", className: "bg-green-500/10 text-[var(--color-success)]" },
  stale: { label: "Stale", className: "bg-yellow-500/10 text-[var(--color-warning)]" },
  abandoned: { label: "Abandoned", className: "bg-red-500/10 text-[var(--color-danger)]" },
  archived: { label: "Archived", className: "bg-gray-500/10 text-[var(--color-text-muted)]" },
};

export function RepoCard({ repo }: Props) {
  const health = classifyHealth(repo);
  const badge = healthBadge[health];
  const langColor = getLanguageColor(repo.language, LANGUAGE_COLORS);

  return (
    <a
      href={repo.html_url}
      target="_blank"
      rel="noopener noreferrer"
      className="group bg-[var(--color-surface-raised)] hover:bg-[var(--color-surface-overlay)] rounded-xl border border-[var(--color-border)] hover:border-[var(--color-brand)]/30 p-4 flex flex-col gap-3 transition-colors"
    >
      {/* Top row: owner + health badge */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0">
          <img
            src={repo.owner.avatar_url}
            alt={repo.owner.login}
            className="w-5 h-5 rounded-full shrink-0"
          />
          <span className="text-[var(--color-brand)] font-medium text-sm truncate">
            {repo.full_name}
          </span>
        </div>
        <span
          className={cn(
            "shrink-0 text-[10px] font-medium px-2 py-0.5 rounded-full",
            badge.className
          )}
        >
          {badge.label}
        </span>
      </div>

      {/* Description */}
      {repo.description && (
        <p className="text-xs text-[var(--color-text-secondary)] line-clamp-2 leading-relaxed">
          {repo.description}
        </p>
      )}

      {/* Meta row */}
      <div className="flex items-center gap-3 text-xs text-[var(--color-text-muted)] mt-auto">
        {repo.language && (
          <span className="flex items-center gap-1">
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: langColor }}
            />
            {repo.language}
          </span>
        )}
        <span className="flex items-center gap-1">
          <Star className="w-3 h-3" />
          {formatCount(repo.stargazers_count)}
        </span>
        <span className="flex items-center gap-1">
          <GitFork className="w-3 h-3" />
          {formatCount(repo.forks_count)}
        </span>
        <span className="flex items-center gap-1 ml-auto">
          <Clock className="w-3 h-3" />
          {timeAgo(repo.pushed_at)}
        </span>
      </div>

      {/* Hover hint */}
      <div className="flex items-center justify-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity text-xs text-[var(--color-text-muted)]">
        <ExternalLink className="w-3 h-3" />
        Open on GitHub
      </div>
    </a>
  );
}
