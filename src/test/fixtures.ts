import type { StarredRepo } from "@/types/github";

/** Build a StarredRepo with sensible defaults; override only what a test cares about. */
export function makeRepo(overrides: Partial<StarredRepo> = {}): StarredRepo {
  return {
    id: 1,
    name: "repo",
    full_name: "owner/repo",
    html_url: "https://github.com/owner/repo",
    description: "A repo",
    language: "TypeScript",
    stargazers_count: 100,
    forks_count: 10,
    open_issues_count: 0,
    archived: false,
    pushed_at: "2024-01-01T00:00:00Z",
    created_at: "2020-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
    topics: [],
    owner: { login: "owner", avatar_url: "", html_url: "" },
    starred_at: "2024-01-01T00:00:00Z",
    ...overrides,
  };
}

/** Repeat a factory n times into an array. */
export function times<T>(n: number, factory: (i: number) => T): T[] {
  return Array.from({ length: n }, (_, i) => factory(i));
}
