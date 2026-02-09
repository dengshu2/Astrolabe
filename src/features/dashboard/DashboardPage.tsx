import { useStars } from "@/hooks/useStars";
import { useStarStats } from "@/hooks/useStarStats";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { HealthSummary } from "./HealthSummary";
import { LanguageChart } from "./LanguageChart";
import { TimelineChart } from "./TimelineChart";
import { RepoList } from "@/features/repos/RepoList";
import { PromptSection } from "@/features/prompts/PromptSection";
import { RefreshCw, AlertCircle, User } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useLanguage } from "@/i18n";


interface Props {
  username: string;
}

export function DashboardPage({ username }: Props) {
  const { repos, progress, reload } = useStars(username);
  const { languageStats, timeline, healthSummary } = useStarStats(repos);
  const { t } = useLanguage();

  // Loading state — only show if we have no repos yet
  if (progress.status === "loading" && repos.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="max-w-md mx-auto text-center">
          <p className="text-sm text-[var(--color-text-muted)] mb-4">
            {t.dashboard.loadingStars} <span className="font-medium text-[var(--color-text-primary)]">{username}</span>...
          </p>
          <ProgressBar loaded={progress.loaded} total={progress.total} />
        </div>
      </div>
    );
  }

  // Error state
  if (progress.status === "error") {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 text-center">
        <AlertCircle className="w-10 h-10 text-[var(--color-danger)] mx-auto mb-3" />
        <p className="text-[var(--color-text-secondary)] mb-4">
          {progress.error ?? t.dashboard.failedToLoad}
        </p>
        <Button variant="secondary" onClick={reload}>
          <RefreshCw className="w-4 h-4" />
          {t.common.retry}
        </Button>
      </div>
    );
  }

  // Empty state
  if (repos.length === 0 && progress.status === "done") {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 text-center">
        <User className="w-10 h-10 text-[var(--color-text-muted)] mx-auto mb-3" />
        <p className="text-lg text-[var(--color-text-muted)]">
          <span className="font-medium">{username}</span> {t.dashboard.noStars}
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Stats overview */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">
          <a
            href={`https://github.com/${username}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--color-brand)] hover:underline"
          >
            {username}
          </a>
          <span className="text-[var(--color-text-primary)]">{t.dashboard.userStars}</span>
          <span className="ml-2 text-sm font-normal text-[var(--color-text-muted)]">
            {repos.length} {t.common.repos}
          </span>
        </h2>
        <Button variant="ghost" size="sm" onClick={reload}>
          <RefreshCw className="w-4 h-4" />
          {t.common.refresh}
        </Button>
      </div>

      {/* Health summary cards */}
      <HealthSummary summary={healthSummary} />

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <LanguageChart data={languageStats} />
        <TimelineChart data={timeline} />
      </div>

      {/* AI Prompts */}
      <PromptSection
        username={username}
        repos={repos}
        languageStats={languageStats}
        healthSummary={healthSummary}
      />

      {/* Repo list with filters */}
      <RepoList repos={repos} />
    </div>
  );
}

