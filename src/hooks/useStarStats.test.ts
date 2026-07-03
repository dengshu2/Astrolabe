import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useStarStats } from "./useStarStats";
import { makeRepo, times } from "@/test/fixtures";

describe("useStarStats languageStats", () => {
  it("sorts by count and computes percentages", () => {
    const repos = [
      ...times(6, () => makeRepo({ language: "TypeScript" })),
      ...times(3, () => makeRepo({ language: "Python" })),
      ...times(1, () => makeRepo({ language: "Go" })),
    ];
    const { result } = renderHook(() => useStarStats(repos));
    const stats = result.current.languageStats;
    expect(stats.map((s) => s.language)).toEqual(["TypeScript", "Python", "Go"]);
    expect(stats[0].percentage).toBe(60);
  });

  it("maps a null language to 'Other'", () => {
    const repos = times(2, () => makeRepo({ language: null }));
    const { result } = renderHook(() => useStarStats(repos));
    expect(result.current.languageStats[0].language).toBe("Other");
  });

  it("groups the tail into 'Other' using the raw count, not summed rounded percentages", () => {
    // 100 of L0 + 20 languages x 10 repos = 300 total, 21 distinct languages.
    const repos = [
      ...times(100, () => makeRepo({ language: "L0" })),
      ...Array.from({ length: 20 }, (_, i) =>
        times(10, () => makeRepo({ language: `L${i + 1}` }))
      ).flat(),
    ];
    const { result } = renderHook(() => useStarStats(repos));
    const stats = result.current.languageStats;

    // Top 10 kept + a single synthesized "Other" entry.
    expect(stats).toHaveLength(11);
    const other = stats[stats.length - 1];
    expect(other.language).toBe("Other");

    // 11 tail languages x 10 repos = 110 of 300 => 37% (rounded from the
    // raw count). The old summed-rounded-percentage logic produced 33%.
    expect(other.count).toBe(110);
    expect(other.percentage).toBe(37);
  });
});

describe("useStarStats healthSummary", () => {
  it("classifies each repo into exactly one bucket", () => {
    const now = Date.now();
    const day = 24 * 60 * 60 * 1000;
    const repos = [
      makeRepo({ pushed_at: new Date(now - 10 * day).toISOString() }), // active
      makeRepo({ pushed_at: new Date(now - 400 * day).toISOString() }), // stale
      makeRepo({ pushed_at: new Date(now - 800 * day).toISOString() }), // abandoned
      makeRepo({ archived: true }), // archived
    ];
    const { result } = renderHook(() => useStarStats(repos));
    expect(result.current.healthSummary).toMatchObject({
      active: 1,
      stale: 1,
      abandoned: 1,
      archived: 1,
      total: 4,
    });
  });
});

describe("useStarStats timeline", () => {
  it("buckets by month, fills gap months with zero, and accumulates", () => {
    const repos = [
      makeRepo({ starred_at: "2024-01-15T00:00:00Z" }),
      makeRepo({ starred_at: "2024-01-20T00:00:00Z" }),
      makeRepo({ starred_at: "2024-03-01T00:00:00Z" }),
    ];
    const { result } = renderHook(() => useStarStats(repos));
    expect(result.current.timeline).toEqual([
      { month: "2024-01", count: 2, cumulative: 2 },
      { month: "2024-02", count: 0, cumulative: 2 },
      { month: "2024-03", count: 1, cumulative: 3 },
    ]);
  });

  it("fills gaps across a year boundary", () => {
    const repos = [
      makeRepo({ starred_at: "2023-11-01T00:00:00Z" }),
      makeRepo({ starred_at: "2024-02-01T00:00:00Z" }),
    ];
    const { result } = renderHook(() => useStarStats(repos));
    expect(result.current.timeline.map((e) => e.month)).toEqual([
      "2023-11",
      "2023-12",
      "2024-01",
      "2024-02",
    ]);
  });

  it("is empty for no repos", () => {
    const { result } = renderHook(() => useStarStats([]));
    expect(result.current.timeline).toEqual([]);
  });
});
