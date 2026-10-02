import type { Repo } from "../types";

/** A repository with sensible defaults; override only what a test cares about. */
export function makeRepo(overrides: Partial<Repo> = {}): Repo {
  return {
    id: Math.floor(Math.random() * 1e9),
    name: "repo",
    full_name: "owner/repo",
    html_url: "https://github.com/owner/repo",
    description: "A repo",
    language: "TypeScript",
    stargazers_count: 100,
    forks_count: 10,
    open_issues_count: 0,
    archived: false,
    fork: false,
    pushed_at: "2026-09-01T00:00:00Z",
    created_at: "2020-01-01T00:00:00Z",
    topics: [],
    owner: { login: "owner", avatar_url: "https://avatars.githubusercontent.com/u/1?v=4" },
    starred_at: "2026-09-01T00:00:00Z",
    ...overrides,
  };
}
