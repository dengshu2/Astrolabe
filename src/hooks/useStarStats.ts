import { useMemo } from "react";
import type {
  LanguageStat,
  StarredRepo,
  StarTimelineEntry,
} from "@/types/github";
import { LANGUAGE_COLORS } from "@/lib/constants";
import { getLanguageColor, classifyHealth } from "@/lib/utils";

/** Every "YYYY-MM" key between two month keys, inclusive */
function monthRange(start: string, end: string): string[] {
  const [sy, sm] = start.split("-").map(Number);
  const [ey, em] = end.split("-").map(Number);
  const months: string[] = [];
  for (let i = sy * 12 + (sm - 1); i <= ey * 12 + (em - 1); i++) {
    months.push(`${Math.floor(i / 12)}-${String((i % 12) + 1).padStart(2, "0")}`);
  }
  return months;
}

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

    if (existingOtherIndex >= 0) {
      // Merge rest into existing "Other". Recompute percentage from the raw
      // count rather than summing per-language rounded percentages (which
      // accumulates rounding error and can show 0% for a non-trivial tail).
      const mergedCount = top10[existingOtherIndex].count + restCount;
      top10[existingOtherIndex] = {
        ...top10[existingOtherIndex],
        count: mergedCount,
        percentage: Math.round((mergedCount / total) * 100),
      };
      return top10;
    } else {
      // Add new "Other" entry
      return [
        ...top10,
        {
          language: "Other",
          count: restCount,
          percentage: Math.round((restCount / total) * 100),
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

    // Fill months with no stars: the chart's x-axis is categorical, so a
    // missing month would silently compress the time scale.
    const keys = Array.from(map.keys()).sort();
    let cumulative = 0;
    return monthRange(keys[0], keys[keys.length - 1]).map((month) => {
      const count = map.get(month) ?? 0;
      cumulative += count;
      return { month, count, cumulative };
    });
  }, [repos]);

  const healthSummary = useMemo(() => {
    let active = 0,
      stale = 0,
      archived = 0,
      abandoned = 0;
    for (const repo of repos) {
      // Reuse the single source of truth for health classification.
      switch (classifyHealth(repo)) {
        case "archived":
          archived++;
          break;
        case "abandoned":
          abandoned++;
          break;
        case "stale":
          stale++;
          break;
        default:
          active++;
      }
    }
    return { active, stale, archived, abandoned, total: repos.length };
  }, [repos]);

  return { languageStats, timeline, healthSummary };
}
