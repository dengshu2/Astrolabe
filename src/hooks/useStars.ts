import { useCallback, useEffect, useRef, useState } from "react";
import { fetchAllStars } from "@/api/github";
import { getCachedStars, setCachedStars, clearCachedStars } from "@/lib/cache";
import type { FetchProgress, StarredRepo } from "@/types/github";

export function useStars(username: string) {
  const [repos, setRepos] = useState<StarredRepo[]>([]);
  const [progress, setProgress] = useState<FetchProgress>({
    loaded: 0,
    total: null,
    status: "idle",
  });
  const abortRef = useRef<AbortController | null>(null);

  // Track previous username via state to detect changes during render
  // (React-recommended pattern for "storing information from previous renders")
  const [prevUsername, setPrevUsername] = useState("");

  if (username && username !== prevUsername) {
    setPrevUsername(username);

    const cached = getCachedStars(username);
    if (cached) {
      setRepos(cached);
      setProgress({
        loaded: cached.length,
        total: cached.length,
        status: "done",
      });
    } else {
      setRepos([]);
      setProgress({ loaded: 0, total: null, status: "loading" });
    }
  }

  // Fetch from API when status is "loading" (cache miss)
  useEffect(() => {
    if (!username || progress.status !== "loading") return;

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    fetchAllStars(username, setProgress, controller.signal)
      .then((result) => {
        setRepos(result);
        setProgress({
          loaded: result.length,
          total: result.length,
          status: "done",
        });
        setCachedStars(username, result);
      })
      .catch((err) => {
        if (err instanceof DOMException && err.name === "AbortError") return;

        const statusCode =
          err && typeof err === "object" && "status" in err
            ? (err as { status: number }).status
            : undefined;

        setProgress((p) => ({
          ...p,
          status: "error",
          error: err instanceof Error ? err.message : "Unknown error",
          errorCode: statusCode,
        }));
      });

    return () => {
      controller.abort();
    };
  }, [username, progress.status]);

  // Force reload (bypass cache)
  const reload = useCallback(() => {
    if (!username) return;

    clearCachedStars(username);
    setPrevUsername("");

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setRepos([]);
    setProgress({ loaded: 0, total: null, status: "loading" });

    fetchAllStars(username, setProgress, controller.signal)
      .then((result) => {
        setRepos(result);
        setProgress({
          loaded: result.length,
          total: result.length,
          status: "done",
        });
        setCachedStars(username, result);
        setPrevUsername(username);
      })
      .catch((err) => {
        if (err instanceof DOMException && err.name === "AbortError") return;

        const statusCode =
          err && typeof err === "object" && "status" in err
            ? (err as { status: number }).status
            : undefined;

        setProgress((p) => ({
          ...p,
          status: "error",
          error: err instanceof Error ? err.message : "Unknown error",
          errorCode: statusCode,
        }));
      });
  }, [username]);

  return { repos, progress, reload };
}
