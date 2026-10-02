import type { Stars } from "./types";

export type LoadErrorCode = "not_found" | "invalid_user" | "rate_limited" | "github_busy" | "upstream" | "network";

export class LoadError extends Error {
  constructor(
    readonly code: LoadErrorCode,
    /** Seconds until trying again makes sense, for the rate-limit codes. */
    readonly retryAfter = 0,
  ) {
    super(code);
  }
}

const CODES: LoadErrorCode[] = ["not_found", "invalid_user", "rate_limited", "github_busy", "upstream"];

export async function fetchStars(login: string, opts: { refresh?: boolean; signal?: AbortSignal } = {}): Promise<Stars> {
  const q = new URLSearchParams({ user: login });
  if (opts.refresh) q.set("refresh", "1");
  let res: Response;
  try {
    res = await fetch(`/api/stars?${q}`, { signal: opts.signal });
  } catch (err) {
    if ((err as Error).name === "AbortError") throw err;
    throw new LoadError("network");
  }
  if (res.ok) return res.json();
  const body = await res.json().catch(() => null);
  const code = CODES.includes(body?.error) ? (body.error as LoadErrorCode) : "upstream";
  const retry = Number(res.headers.get("Retry-After")) || body?.retry_after || 0;
  throw new LoadError(code, retry);
}
