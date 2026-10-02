/** The shapes /api/stars returns. */

export interface Repo {
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
  fork: boolean;
  pushed_at: string;
  created_at: string;
  topics: string[];
  owner: { login: string; avatar_url: string };
  /** When the user starred it. */
  starred_at: string;
}

export interface GitHubUser {
  login: string;
  name: string;
  avatar_url: string;
  html_url: string;
  type: string;
}

export interface Stars {
  user: GitHubUser;
  /** Everything the user has starred; repos may hold only the newest part. */
  total: number;
  truncated: boolean;
  /** Newest star first. */
  repos: Repo[];
  fetched_at: string;
}

export type Health = "active" | "stale" | "abandoned" | "archived";
export type SortKey = "starred" | "pushed" | "stars" | "name";
