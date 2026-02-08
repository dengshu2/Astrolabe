import { useCallback, useEffect, useRef, useState } from "react";
import { fetchAllStars } from "@/api/github";
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
    (name: string) => {
      if (!name) return;
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
      load(username);
    }
  }, [username, load]);

  const reload = useCallback(() => load(username), [username, load]);

  return { repos, progress, reload };
}
