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
  const prevUsernameRef = useRef<string>("");

  const load = useCallback(
    (name: string, forceRefresh: boolean = false) => {
      if (!name) return;

      // Try cache first (unless force refresh)
      if (!forceRefresh) {
        const cached = getCachedStars(name);
        if (cached) {
          setRepos(cached);
          setProgress({
            loaded: cached.length,
            total: cached.length,
            status: "done",
          });
          return;
        }
      } else {
        // Clear cache on force refresh
        clearCachedStars(name);
      }

      // Abort any ongoing request
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setRepos([]);
      setProgress({ loaded: 0, total: null, status: "loading" });

      fetchAllStars(name, setProgress, controller.signal)
        .then((result) => {
          setRepos(result);
          setProgress({
            loaded: result.length,
            total: result.length,
            status: "done",
          });
          // Cache the result
          setCachedStars(name, result);
        })
        .catch((err) => {
          if (err instanceof DOMException && err.name === "AbortError") return;
          setProgress((p) => ({
            ...p,
            status: "error",
            error: err instanceof Error ? err.message : "Unknown error",
          }));
        });
    },
    []
  );

  // Fetch when username changes
  useEffect(() => {
    if (username && username !== prevUsernameRef.current) {
      prevUsernameRef.current = username;
      load(username, false);
    }
  }, [username, load]);

  // Force reload (bypass cache)
  const reload = useCallback(() => load(username, true), [username, load]);

  return { repos, progress, reload };
}

