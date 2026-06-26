import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { clearCachedStars, getCachedStars, setCachedStars } from "./cache";
import { makeRepo } from "@/test/fixtures";

describe("stars cache", () => {
  beforeEach(() => {
    localStorage.clear();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("round-trips data through localStorage", () => {
    const repos = [makeRepo({ full_name: "a/b" })];
    setCachedStars("octocat", repos);
    expect(getCachedStars("octocat")).toEqual(repos);
  });

  it("returns null on a miss", () => {
    expect(getCachedStars("nobody")).toBeNull();
  });

  it("is case-insensitive on username", () => {
    setCachedStars("OctoCat", [makeRepo()]);
    expect(getCachedStars("octocat")).not.toBeNull();
  });

  it("expires entries older than the TTL", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2024-01-01T00:00:00Z"));
    setCachedStars("octocat", [makeRepo()]);

    // Just under 30 minutes: still cached.
    vi.setSystemTime(new Date("2024-01-01T00:29:00Z"));
    expect(getCachedStars("octocat")).not.toBeNull();

    // Past 30 minutes: expired and evicted.
    vi.setSystemTime(new Date("2024-01-01T00:31:00Z"));
    expect(getCachedStars("octocat")).toBeNull();
    expect(localStorage.getItem("astrolabe-stars-octocat")).toBeNull();
  });

  it("clears a cached user", () => {
    setCachedStars("octocat", [makeRepo()]);
    clearCachedStars("octocat");
    expect(getCachedStars("octocat")).toBeNull();
  });

  it("never throws on corrupt cache data", () => {
    localStorage.setItem("astrolabe-stars-octocat", "{not valid json");
    expect(getCachedStars("octocat")).toBeNull();
  });
});
