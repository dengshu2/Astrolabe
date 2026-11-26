import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useUrlUser } from "./useUrlUser";

describe("useUrlUser", () => {
  beforeEach(() => {
    window.scrollTo = vi.fn() as typeof window.scrollTo; // jsdom has no scrolling
  });
  afterEach(() => window.history.replaceState({}, "", "/"));

  it("reads ?user= and writes it back", () => {
    window.history.replaceState({}, "", "/?user=octocat");
    const { result } = renderHook(() => useUrlUser());
    expect(result.current[0]).toBe("octocat");
    act(() => result.current[1]("torvalds"));
    expect(window.location.search).toBe("?user=torvalds");
    act(() => result.current[1](""));
    expect(window.location.search).toBe("");
    expect(result.current[0]).toBe("");
  });

  it("clears dashboard filter params when switching users or going home", () => {
    window.history.replaceState({}, "", "/?user=octocat&lang=Rust&health=active&month=2026-08&sort=stars");
    const { result } = renderHook(() => useUrlUser());
    act(() => result.current[1]("torvalds"));
    expect(window.location.search).toBe("?user=torvalds");
    act(() => result.current[1](""));
    expect(window.location.search).toBe("");
  });

  it("follows the back button", () => {
    const { result } = renderHook(() => useUrlUser());
    act(() => result.current[1]("ann"));
    act(() => {
      window.history.replaceState({}, "", "/?user=bob");
      window.dispatchEvent(new PopStateEvent("popstate"));
    });
    expect(result.current[0]).toBe("bob");
  });
});
