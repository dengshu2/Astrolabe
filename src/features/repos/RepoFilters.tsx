import { Search, SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import type { RepoHealth, SortField } from "@/types/github";
import { useLanguage } from "@/i18n";

interface Props {
  search: string;
  onSearchChange: (v: string) => void;
  healthFilter: RepoHealth | "all";
  onHealthFilterChange: (v: RepoHealth | "all") => void;
  sortField: SortField;
  onSortFieldChange: (v: SortField) => void;
  languageFilter: string;
  onLanguageFilterChange: (v: string) => void;
  languages: string[];
}

export function RepoFilters({
  search,
  onSearchChange,
  healthFilter,
  onHealthFilterChange,
  sortField,
  onSortFieldChange,
  languageFilter,
  onLanguageFilterChange,
  languages,
}: Props) {
  const { t } = useLanguage();

  const healthOptions: { value: RepoHealth | "all"; label: string }[] = [
    { value: "all", label: t.filters.all },
    { value: "active", label: t.filters.active },
    { value: "stale", label: t.filters.stale },
    { value: "abandoned", label: t.filters.abandoned },
    { value: "archived", label: t.filters.archived },
  ];

  const sortOptions: { value: SortField; label: string }[] = [
    { value: "starred_at", label: t.filters.sortRecentlyStarred },
    { value: "pushed_at", label: t.filters.sortRecentlyUpdated },
    { value: "stargazers_count", label: t.filters.sortMostStars },
    { value: "name", label: t.filters.sortName },
  ];

  return (
    <div className="space-y-3">
      {/* Search bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]" />
        <input
          type="text"
          placeholder={t.repos.searchPlaceholder}
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-9 pr-4 py-2 text-sm bg-[var(--color-surface-raised)] border border-[var(--color-border)] rounded-lg text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-brand)] focus:ring-1 focus:ring-[var(--color-brand)]/30"
        />
      </div>

      {/* Filters row */}
      <div className="flex flex-wrap items-center gap-2">
        <SlidersHorizontal className="w-4 h-4 text-[var(--color-text-muted)]" />

        {/* Health filter */}
        <div className="flex items-center gap-1 bg-[var(--color-surface-raised)] rounded-lg border border-[var(--color-border)] p-0.5">
          {healthOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => onHealthFilterChange(opt.value)}
              className={cn(
                "px-2.5 py-1 text-xs rounded-md cursor-pointer",
                healthFilter === opt.value
                  ? "bg-[var(--color-surface-overlay)] text-[var(--color-text-primary)]"
                  : "text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Sort */}
        <select
          value={sortField}
          onChange={(e) => onSortFieldChange(e.target.value as SortField)}
          className="text-xs bg-[var(--color-surface-raised)] border border-[var(--color-border)] rounded-lg px-2 py-1.5 text-[var(--color-text-secondary)] focus:outline-none cursor-pointer"
        >
          {sortOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        {/* Language filter */}
        {languages.length > 0 && (
          <select
            value={languageFilter}
            onChange={(e) => onLanguageFilterChange(e.target.value)}
            className="text-xs bg-[var(--color-surface-raised)] border border-[var(--color-border)] rounded-lg px-2 py-1.5 text-[var(--color-text-secondary)] focus:outline-none cursor-pointer"
          >
            <option value="">{t.filters.allLanguages}</option>
            {languages.map((lang) => (
              <option key={lang} value={lang}>
                {lang}
              </option>
            ))}
          </select>
        )}
      </div>
    </div>
  );
}
