/** Everything the dashboard derives from the list of starred repositories. */

import { languageColor } from "./colors";
import type { Health, Repo, SortKey } from "./types";

/** Not pushed for this long: "stale"; twice as long: "abandoned". */
export const STALE_DAYS = 365;
export const ABANDONED_DAYS = 365 * 2;

const DAY = 24 * 60 * 60 * 1000;

export function daysSince(iso: string, now = Date.now()): number {
  return Math.floor((now - new Date(iso).getTime()) / DAY);
}

export function classifyHealth(repo: Repo, now = Date.now()): Health {
  if (repo.archived) return "archived";
  const days = daysSince(repo.pushed_at, now);
  if (days >= ABANDONED_DAYS) return "abandoned";
  if (days >= STALE_DAYS) return "stale";
  return "active";
}

export type HealthCounts = Record<Health, number>;

export function healthCounts(repos: Repo[], now = Date.now()): HealthCounts {
  const counts: HealthCounts = { active: 0, stale: 0, abandoned: 0, archived: 0 };
  for (const r of repos) counts[classifyHealth(r, now)]++;
  return counts;
}

export interface LanguageStat {
  /** null groups repositories without a language and the long tail. */
  language: string | null;
  count: number;
  percent: number;
  color: string;
}

/** The top languages by count, the rest (and repos with no language) folded into one row. */
export function languageStats(repos: Repo[], top = 10): LanguageStat[] {
  const counts = new Map<string, number>();
  let none = 0;
  for (const r of repos) {
    if (r.language) counts.set(r.language, (counts.get(r.language) ?? 0) + 1);
    else none++;
  }
  const total = repos.length || 1;
  const sorted = [...counts].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  const rows: LanguageStat[] = sorted.slice(0, top).map(([language, count]) => ({
    language,
    count,
    percent: (count / total) * 100,
    color: languageColor(language),
  }));
  const rest = none + sorted.slice(top).reduce((s, [, c]) => s + c, 0);
  if (rest) rows.push({ language: null, count: rest, percent: (rest / total) * 100, color: languageColor(null) });
  return rows;
}

/** Every language present, most used first, for the list filter. */
export function allLanguages(repos: Repo[]): { language: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const r of repos) if (r.language) counts.set(r.language, (counts.get(r.language) ?? 0) + 1);
  return [...counts].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).map(([language, count]) => ({ language, count }));
}

export interface MonthCount {
  month: string; // "2024-01"
  count: number;
}

/** Stars per month from the first star to the current month, empty months included. */
export function timeline(repos: Repo[], now = new Date()): MonthCount[] {
  if (!repos.length) return [];
  const counts = new Map<string, number>();
  for (const r of repos) {
    const m = r.starred_at.slice(0, 7);
    counts.set(m, (counts.get(m) ?? 0) + 1);
  }
  const first = [...counts.keys()].sort()[0];
  const [fy, fm] = first.split("-").map(Number);
  const end = now.getUTCFullYear() * 12 + now.getUTCMonth();
  const out: MonthCount[] = [];
  for (let i = fy * 12 + fm - 1; i <= end; i++) {
    const month = `${Math.floor(i / 12)}-${String((i % 12) + 1).padStart(2, "0")}`;
    out.push({ month, count: counts.get(month) ?? 0 });
  }
  return out;
}

export interface Filters {
  query: string;
  health: Health | "all";
  language: string | null;
  sort: SortKey;
}

export function filterRepos(repos: Repo[], f: Filters, now = Date.now()): Repo[] {
  const q = f.query.trim().toLowerCase();
  const out = repos.filter(
    (r) =>
      (f.health === "all" || classifyHealth(r, now) === f.health) &&
      (!f.language || r.language === f.language) &&
      (!q ||
        r.full_name.toLowerCase().includes(q) ||
        (r.description ?? "").toLowerCase().includes(q) ||
        r.topics.some((t) => t.includes(q))),
  );
  const by: Record<SortKey, (a: Repo, b: Repo) => number> = {
    starred: (a, b) => b.starred_at.localeCompare(a.starred_at),
    pushed: (a, b) => b.pushed_at.localeCompare(a.pushed_at),
    stars: (a, b) => b.stargazers_count - a.stargazers_count,
    name: (a, b) => a.full_name.localeCompare(b.full_name),
  };
  return out.sort(by[f.sort]);
}
