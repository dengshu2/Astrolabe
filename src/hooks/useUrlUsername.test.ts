import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { useUrlUsername } from "./useUrlUsername";

describe("useUrlUsername", () => {
  beforeEach(() => {
    window.history.replaceState({}, "", "/");
  });
  afterEach(() => {
    window.history.replaceState({}, "", "/");
  });

  it("initializes from the ?user= query param", () => {
    window.history.replaceState({}, "", "/?user=octocat");
    const { result } = renderHook(() => useUrlUsername());
    expect(result.current[0]).toBe("octocat");
  });

  it("writes the username to the URL on navigate", () => {
    const { result } = renderHook(() => useUrlUsername());
    act(() => result.current[1]("torvalds"));
    expect(result.current[0]).toBe("torvalds");
    expect(window.location.search).toBe("?user=torvalds");
  });

  it("clears the param when navigating home", () => {
    window.history.replaceState({}, "", "/?user=octocat");
    const { result } = renderHook(() => useUrlUsername());
    act(() => result.current[1](""));
    expect(result.current[0]).toBe("");
    expect(window.location.search).toBe("");
  });

  it("responds to browser back/forward (popstate)", () => {
    const { result } = renderHook(() => useUrlUsername());
    act(() => result.current[1]("octocat"));
    act(() => {
      window.history.replaceState({}, "", "/?user=other");
      window.dispatchEvent(new PopStateEvent("popstate"));
    });
    expect(result.current[0]).toBe("other");
  });
});
