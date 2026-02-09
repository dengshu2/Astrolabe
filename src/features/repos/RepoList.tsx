import { useMemo, useState } from "react";
import { Download, ChevronDown } from "lucide-react";
import type { RepoHealth, SortField, StarredRepo } from "@/types/github";
import { classifyHealth } from "@/lib/utils";
import { exportToJSON, exportToCSV } from "@/lib/export";
import { RepoCard } from "./RepoCard";
import { RepoFilters } from "./RepoFilters";
import { useLanguage } from "@/i18n";

interface Props {
  repos: StarredRepo[];
  username?: string;
}

export function RepoList({ repos, username }: Props) {
  const [search, setSearch] = useState("");
  const [healthFilter, setHealthFilter] = useState<RepoHealth | "all">("all");
  const [sortField, setSortField] = useState<SortField>("starred_at");
  const [languageFilter, setLanguageFilter] = useState("");
  const [showExportMenu, setShowExportMenu] = useState(false);
  const { t } = useLanguage();

  // Available languages (sorted by frequency)
  const languages = useMemo(() => {
    const map = new Map<string, number>();
    for (const r of repos) {
      if (r.language) map.set(r.language, (map.get(r.language) ?? 0) + 1);
    }
    return Array.from(map.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([lang]) => lang);
  }, [repos]);

  // Filtered + sorted repos
  const filtered = useMemo(() => {
    let result = repos;

    // Search
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (r) =>
          r.full_name.toLowerCase().includes(q) ||
          r.description?.toLowerCase().includes(q) ||
          r.topics.some((t) => t.includes(q))
      );
    }

    // Health filter
    if (healthFilter !== "all") {
      result = result.filter((r) => classifyHealth(r) === healthFilter);
    }

    // Language filter
    if (languageFilter) {
      result = result.filter((r) => r.language === languageFilter);
    }

    // Sort
    result = [...result].sort((a, b) => {
      switch (sortField) {
        case "starred_at":
          return (
            new Date(b.starred_at ?? b.created_at).getTime() -
            new Date(a.starred_at ?? a.created_at).getTime()
          );
        case "pushed_at":
          return (
            new Date(b.pushed_at).getTime() - new Date(a.pushed_at).getTime()
          );
        case "stargazers_count":
          return b.stargazers_count - a.stargazers_count;
        case "name":
          return a.full_name.localeCompare(b.full_name);
        default:
          return 0;
      }
    });

    return result;
  }, [repos, search, healthFilter, sortField, languageFilter]);

  const handleExportJSON = () => {
    exportToJSON(filtered, username ? `${username}-stars` : "stars");
    setShowExportMenu(false);
  };

  const handleExportCSV = () => {
    exportToCSV(filtered, username ? `${username}-stars` : "stars");
    setShowExportMenu(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">
          {t.repos.title}
          <span className="ml-2 text-sm font-normal text-[var(--color-text-muted)]">
            {filtered.length}
            {filtered.length !== repos.length && ` / ${repos.length}`}
          </span>
        </h2>

        {/* Export dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowExportMenu(!showExportMenu)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[var(--color-text-secondary)] bg-[var(--color-surface-raised)] border border-[var(--color-border)] rounded-lg hover:bg-[var(--color-surface-overlay)] transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            {t.repos.export}
            <ChevronDown className="w-3 h-3" />
          </button>

          {showExportMenu && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowExportMenu(false)}
              />
              <div className="absolute right-0 mt-1 w-36 bg-[var(--color-surface-raised)] border border-[var(--color-border)] rounded-lg shadow-lg z-20 overflow-hidden">
                <button
                  onClick={handleExportJSON}
                  className="w-full px-3 py-2 text-left text-xs text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-overlay)] transition-colors"
                >
                  {t.repos.exportJSON}
                </button>
                <button
                  onClick={handleExportCSV}
                  className="w-full px-3 py-2 text-left text-xs text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-overlay)] transition-colors"
                >
                  {t.repos.exportCSV}
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <RepoFilters
        search={search}
        onSearchChange={setSearch}
        healthFilter={healthFilter}
        onHealthFilterChange={setHealthFilter}
        sortField={sortField}
        onSortFieldChange={setSortField}
        languageFilter={languageFilter}
        onLanguageFilterChange={setLanguageFilter}
        languages={languages}
      />

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-[var(--color-text-muted)]">
          <p className="text-lg">{t.repos.noMatch}</p>
          <p className="text-sm mt-1">{t.repos.tryAdjusting}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {filtered.map((repo) => (
            <RepoCard key={repo.id} repo={repo} />
          ))}
        </div>
      )}
    </div>
  );
}
