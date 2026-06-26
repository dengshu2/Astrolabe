import { useCallback, useEffect, useState } from "react";

/** Query-string key that holds the currently viewed username. */
const PARAM = "user";

function readUsernameFromUrl(): string {
  if (typeof window === "undefined") return "";
  return new URLSearchParams(window.location.search).get(PARAM)?.trim() ?? "";
}

/**
 * Keep the active username in the URL (`?user=...`) so views are shareable,
 * survive a refresh, and respond to browser back/forward navigation.
 * Returns the current username and a setter that also updates history.
 */
export function useUrlUsername(): [string, (name: string) => void] {
  const [username, setUsername] = useState(readUsernameFromUrl);

  useEffect(() => {
    const onPopState = () => setUsername(readUsernameFromUrl());
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  const navigate = useCallback((name: string) => {
    const trimmed = name.trim();
    setUsername(trimmed);

    const url = new URL(window.location.href);
    if (trimmed) {
      url.searchParams.set(PARAM, trimmed);
    } else {
      url.searchParams.delete(PARAM);
    }
    // Avoid pushing a duplicate entry when nothing actually changed.
    if (url.href !== window.location.href) {
      window.history.pushState({}, "", url);
    }
  }, []);

  return [username, navigate];
}
