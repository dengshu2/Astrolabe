import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  avatarUrl,
  cn,
  classifyHealth,
  daysSince,
  formatCount,
  getLanguageColor,
  timeAgo,
} from "./utils";
import { ABANDONED_DAYS, LANGUAGE_COLORS, STALE_DAYS } from "./constants";
import { makeRepo } from "@/test/fixtures";

const NOW = new Date("2024-06-01T00:00:00Z");

/** Return an ISO string for `days` before the mocked "now". */
function daysAgo(days: number): string {
  return new Date(NOW.getTime() - days * 24 * 60 * 60 * 1000).toISOString();
}

describe("utils date helpers", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("daysSince computes whole days elapsed", () => {
    expect(daysSince(daysAgo(0))).toBe(0);
    expect(daysSince(daysAgo(10))).toBe(10);
    expect(daysSince(daysAgo(400))).toBe(400);
  });

  it("classifyHealth respects archived > abandoned > stale > active", () => {
    expect(classifyHealth(makeRepo({ archived: true }))).toBe("archived");
    expect(classifyHealth(makeRepo({ pushed_at: daysAgo(ABANDONED_DAYS) }))).toBe(
      "abandoned"
    );
    expect(classifyHealth(makeRepo({ pushed_at: daysAgo(STALE_DAYS) }))).toBe(
      "stale"
    );
    expect(classifyHealth(makeRepo({ pushed_at: daysAgo(10) }))).toBe("active");
  });

  it("classifyHealth treats archived repos as archived even if recently pushed", () => {
    expect(
      classifyHealth(makeRepo({ archived: true, pushed_at: daysAgo(1) }))
    ).toBe("archived");
  });

  it("timeAgo renders human-friendly buckets", () => {
    expect(timeAgo(daysAgo(0))).toBe("today");
    expect(timeAgo(daysAgo(1))).toBe("yesterday");
    expect(timeAgo(daysAgo(5))).toBe("5d ago");
    expect(timeAgo(daysAgo(60))).toBe("2mo ago");
    expect(timeAgo(daysAgo(800))).toBe("2y ago");
  });
});

describe("formatCount", () => {
  it("keeps small numbers as-is and abbreviates thousands", () => {
    expect(formatCount(0)).toBe("0");
    expect(formatCount(999)).toBe("999");
    expect(formatCount(1000)).toBe("1.0k");
    expect(formatCount(15400)).toBe("15.4k");
  });
});

describe("getLanguageColor", () => {
  it("returns the known color, falling back to Other", () => {
    expect(getLanguageColor("TypeScript", LANGUAGE_COLORS)).toBe(
      LANGUAGE_COLORS.TypeScript
    );
    expect(getLanguageColor(null, LANGUAGE_COLORS)).toBe(LANGUAGE_COLORS.Other);
    expect(getLanguageColor("Brainfuck", LANGUAGE_COLORS)).toBe(
      LANGUAGE_COLORS.Other
    );
  });
});

describe("cn", () => {
  it("merges truthy class values", () => {
    const hidden = false;
    expect(cn("a", hidden && "b", "c")).toBe("a c");
  });
});

describe("avatarUrl", () => {
  it("appends the size param to a URL with an existing query", () => {
    expect(avatarUrl("https://avatars.githubusercontent.com/u/1?v=4", 64)).toBe(
      "https://avatars.githubusercontent.com/u/1?v=4&s=64"
    );
  });

  it("appends the size param to a URL without a query", () => {
    expect(avatarUrl("https://avatars.githubusercontent.com/u/1", 64)).toBe(
      "https://avatars.githubusercontent.com/u/1?s=64"
    );
  });
});
