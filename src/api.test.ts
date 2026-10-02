import { afterEach, describe, expect, it, vi } from "vitest";
import { LoadError, fetchStars } from "./api";

function reply(status: number, body: unknown, headers: Record<string, string> = {}) {
  vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify(body), { status, headers })));
}

describe("fetchStars", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("asks for a refresh when told to", async () => {
    reply(200, { repos: [] });
    await fetchStars("ann", { refresh: true });
    expect(vi.mocked(fetch).mock.calls[0][0]).toBe("/api/stars?user=ann&refresh=1");
  });

  it("turns error answers into codes", async () => {
    reply(404, { error: "not_found" });
    await expect(fetchStars("ghost")).rejects.toMatchObject({ code: "not_found" });
    reply(429, { error: "rate_limited", retry_after: 30 }, { "Retry-After": "30" });
    await expect(fetchStars("ann")).rejects.toMatchObject({ code: "rate_limited", retryAfter: 30 });
    reply(500, "oops");
    await expect(fetchStars("ann")).rejects.toMatchObject({ code: "upstream" });
  });

  it("reports a network failure", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => Promise.reject(new TypeError("Failed to fetch"))));
    const err = await fetchStars("ann").catch((e) => e);
    expect(err).toBeInstanceOf(LoadError);
    expect(err.code).toBe("network");
  });
});
