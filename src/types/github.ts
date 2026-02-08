/** Core starred repository type (subset of GitHub API response) */
export interface StarredRepo {
  id: number;
  name: string;
  full_name: string;
  html_url: string;
  description: string | null;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  archived: boolean;
  pushed_at: string;
  created_at: string;
  updated_at: string;
  topics: string[];
  owner: {
    login: string;
    avatar_url: string;
    html_url: string;
  };
  /** When the user starred this repo (from star+json Accept header) */
  starred_at?: string;
}

/** Language distribution stats */
export interface LanguageStat {
  language: string;
  count: number;
  percentage: number;
  color: string;
}

/** Star timeline entry */
export interface StarTimelineEntry {
  month: string; // "2024-01"
  count: number;
  cumulative: number;
}

/** Repo health status for filtering */
export type RepoHealth = "active" | "stale" | "archived" | "abandoned";

/** Sort options for repo list */
export type SortField =
  | "starred_at"
  | "stargazers_count"
  | "pushed_at"
  | "name";
export type SortDirection = "asc" | "desc";

/** Fetch progress info */
export interface FetchProgress {
  loaded: number;
  total: number | null;
  status: "idle" | "loading" | "done" | "error";
  error?: string;
}
