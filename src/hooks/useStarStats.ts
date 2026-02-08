import { useMemo } from "react";
import type {
  LanguageStat,
  StarredRepo,
  StarTimelineEntry,
} from "@/types/github";
import { LANGUAGE_COLORS } from "@/lib/constants";
import { getLanguageColor } from "@/lib/utils";

/** Derive all dashboard statistics from the raw repo list */
export function useStarStats(repos: StarredRepo[]) {
  const languageStats = useMemo<LanguageStat[]>(() => {
    const map = new Map<string, number>();
    for (const repo of repos) {
      const lang = repo.language ?? "Other";
      map.set(lang, (map.get(lang) ?? 0) + 1);
    }
    const total = repos.length || 1;
    const allStats = Array.from(map.entries())
      .map(([language, count]) => ({
        language,
        count,
        percentage: Math.round((count / total) * 100),
        color: getLanguageColor(language, LANGUAGE_COLORS),
      }))
      .sort((a, b) => b.count - a.count);

    // Show top 10, group rest as "Other" (merge with existing "Other" if present)
    if (allStats.length <= 10) {
      return allStats;
    }

    const top10 = allStats.slice(0, 10);
    const rest = allStats.slice(10);

    // Check if "Other" is already in top 10
    const existingOtherIndex = top10.findIndex((s) => s.language === "Other");
    const restCount = rest.reduce((s, d) => s + d.count, 0);
    const restPercentage = rest.reduce((s, d) => s + d.percentage, 0);

    if (existingOtherIndex >= 0) {
      // Merge rest into existing "Other"
      top10[existingOtherIndex] = {
        ...top10[existingOtherIndex],
        count: top10[existingOtherIndex].count + restCount,
        percentage: top10[existingOtherIndex].percentage + restPercentage,
      };
      return top10;
    } else {
      // Add new "Other" entry
      return [
        ...top10,
        {
          language: "Other",
          count: restCount,
          percentage: restPercentage,
          color: "#8b949e",
        },
      ];
    }
  }, [repos]);

  const timeline = useMemo<StarTimelineEntry[]>(() => {
    if (repos.length === 0) return [];

    // Group by month
    const map = new Map<string, number>();
    for (const repo of repos) {
      const date = repo.starred_at ?? repo.created_at;
      const month = date.slice(0, 7); // "2024-01"
      map.set(month, (map.get(month) ?? 0) + 1);
    }

    // Sort and compute cumulative
    const sorted = Array.from(map.entries()).sort(([a], [b]) =>
      a.localeCompare(b)
    );
    let cumulative = 0;
    return sorted.map(([month, count]) => {
      cumulative += count;
      return { month, count, cumulative };
    });
  }, [repos]);

  const healthSummary = useMemo(() => {
    const now = Date.now();
    let active = 0,
      stale = 0,
      archived = 0,
      abandoned = 0;
    for (const repo of repos) {
      if (repo.archived) {
        archived++;
        continue;
      }
      const days = (now - new Date(repo.pushed_at).getTime()) / 86400000;
      if (days >= 730) abandoned++;
      else if (days >= 365) stale++;
      else active++;
    }
    return { active, stale, archived, abandoned, total: repos.length };
  }, [repos]);

  return { languageStats, timeline, healthSummary };
}
