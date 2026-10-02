import { describe, expect, it } from "vitest";
import { classifyHealth, filterRepos, healthCounts, languageStats, timeline, type Filters } from "./stats";
import { makeRepo } from "./test/fixtures";

const NOW = Date.parse("2026-10-02T00:00:00Z");
const ago = (days: number) => new Date(NOW - days * 86400_000).toISOString();

describe("health", () => {
  it("classifies by last push, archived first", () => {
    expect(classifyHealth(makeRepo({ pushed_at: ago(10) }), NOW)).toBe("active");
    expect(classifyHealth(makeRepo({ pushed_at: ago(400) }), NOW)).toBe("stale");
    expect(classifyHealth(makeRepo({ pushed_at: ago(800) }), NOW)).toBe("abandoned");
    expect(classifyHealth(makeRepo({ pushed_at: ago(1), archived: true }), NOW)).toBe("archived");
  });

  it("counts each kind", () => {
    const repos = [makeRepo({ pushed_at: ago(1) }), makeRepo({ pushed_at: ago(1) }), makeRepo({ pushed_at: ago(500) }), makeRepo({ archived: true })];
    expect(healthCounts(repos, NOW)).toEqual({ active: 2, stale: 1, abandoned: 0, archived: 1 });
  });
});

describe("languageStats", () => {
  it("folds the tail and repos without a language into one row", () => {
    const repos = [
      ...Array.from({ length: 5 }, () => makeRepo({ language: "Go" })),
      ...Array.from({ length: 3 }, () => makeRepo({ language: "Rust" })),
      makeRepo({ language: "Zig" }),
      makeRepo({ language: null }),
    ];
    const rows = languageStats(repos, 2);
    expect(rows.map((r) => [r.language, r.count])).toEqual([["Go", 5], ["Rust", 3], [null, 2]]);
    expect(rows[0].percent).toBe(50);
  });

  it("gives unknown languages a stable colour", () => {
    const [a] = languageStats([makeRepo({ language: "Gleam" })]);
    const [b] = languageStats([makeRepo({ language: "Gleam" })]);
    expect(a.color).toBe(b.color);
  });
});

describe("timeline", () => {
  it("fills empty months up to the current one", () => {
    const repos = [makeRepo({ starred_at: "2026-06-15T00:00:00Z" }), makeRepo({ starred_at: "2026-06-20T00:00:00Z" }), makeRepo({ starred_at: "2026-08-01T00:00:00Z" })];
    expect(timeline(repos, new Date(NOW))).toEqual([
      { month: "2026-06", count: 2 },
      { month: "2026-07", count: 0 },
      { month: "2026-08", count: 1 },
      { month: "2026-09", count: 0 },
      { month: "2026-10", count: 0 },
    ]);
  });

  it("crosses a year boundary", () => {
    const months = timeline([makeRepo({ starred_at: "2025-11-01T00:00:00Z" })], new Date("2026-01-10T00:00:00Z")).map((m) => m.month);
    expect(months).toEqual(["2025-11", "2025-12", "2026-01"]);
  });
});

describe("filterRepos", () => {
  const base: Filters = { query: "", health: "all", language: null, sort: "starred" };
  const repos = [
    makeRepo({ full_name: "a/vite", description: "Next generation tooling", topics: ["bundler"], language: "TypeScript", stargazers_count: 5, starred_at: "2026-01-01T00:00:00Z" }),
    makeRepo({ full_name: "b/ripgrep", description: "Fast grep", language: "Rust", stargazers_count: 50, starred_at: "2026-03-01T00:00:00Z" }),
    makeRepo({ full_name: "c/old", language: "Rust", archived: true, stargazers_count: 1, starred_at: "2026-02-01T00:00:00Z" }),
  ];

  it("sorts newest star first by default", () => {
    expect(filterRepos(repos, base).map((r) => r.full_name)).toEqual(["b/ripgrep", "c/old", "a/vite"]);
  });

  it("searches names, descriptions and topics", () => {
    expect(filterRepos(repos, { ...base, query: "GREP" }).map((r) => r.full_name)).toEqual(["b/ripgrep"]);
    expect(filterRepos(repos, { ...base, query: "bundler" }).map((r) => r.full_name)).toEqual(["a/vite"]);
  });

  it("combines health, language and sort", () => {
    expect(filterRepos(repos, { ...base, language: "Rust", sort: "stars" }).map((r) => r.full_name)).toEqual(["b/ripgrep", "c/old"]);
    expect(filterRepos(repos, { ...base, health: "archived" }).map((r) => r.full_name)).toEqual(["c/old"]);
  });

  it("does not reorder the input", () => {
    filterRepos(repos, { ...base, sort: "name" });
    expect(repos[0].full_name).toBe("a/vite");
  });
});
