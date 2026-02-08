import { clsx, type ClassValue } from "clsx";
import { ABANDONED_DAYS, STALE_DAYS } from "./constants";
import type { RepoHealth, StarredRepo } from "@/types/github";

/** Merge Tailwind classes safely */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

/** Days since a date string */
export function daysSince(dateStr: string): number {
  return Math.floor(
    (Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24)
  );
}

/** Classify repo health based on last push */
export function classifyHealth(repo: StarredRepo): RepoHealth {
  if (repo.archived) return "archived";
  const days = daysSince(repo.pushed_at);
  if (days >= ABANDONED_DAYS) return "abandoned";
  if (days >= STALE_DAYS) return "stale";
  return "active";
}

/** Human-friendly relative time */
export function timeAgo(dateStr: string): string {
  const days = daysSince(dateStr);
  if (days === 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 30) return `${days}d ago`;
  if (days < 365) return `${Math.floor(days / 30)}mo ago`;
  const years = Math.floor(days / 365);
  return `${years}y ago`;
}

/** Format number with K suffix */
export function formatCount(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

/** Get a color for a language, fallback to hash-based */
export function getLanguageColor(
  language: string | null,
  colors: Record<string, string>
): string {
  if (!language) return colors["Other"] ?? "#8b949e";
  return colors[language] ?? colors["Other"] ?? "#8b949e";
}
