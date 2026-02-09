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
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder={t.repos.searchPlaceholder}
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-gray-200 rounded-full text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 shadow-sm transition-all"
        />
      </div>

      {/* Filters row */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 text-gray-500 text-sm font-medium">
          <SlidersHorizontal className="w-4 h-4" />
          <span>{t.filters.filterBy}:</span>
        </div>

        {/* Health filter */}
        <div className="flex items-center p-1 bg-white border border-gray-200 rounded-full shadow-sm">
          {healthOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => onHealthFilterChange(opt.value)}
              className={cn(
                "px-3 py-1 text-xs font-medium rounded-full transition-all",
                healthFilter === opt.value
                  ? "bg-gray-100 text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <div className="h-6 w-px bg-gray-200 mx-1" />

        {/* Sort */}
        <select
          value={sortField}
          onChange={(e) => onSortFieldChange(e.target.value as SortField)}
          className="text-13px bg-white border border-gray-200 rounded-full px-3 py-1.5 text-gray-600 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer shadow-sm transition-all"
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
            className="text-13px bg-white border border-gray-200 rounded-full px-3 py-1.5 text-gray-600 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer shadow-sm transition-all"
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
