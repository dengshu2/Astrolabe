import { Octokit } from "@octokit/rest";
import { STARS_PER_PAGE, MAX_STARS } from "@/lib/constants";
import type { StarredRepo, FetchProgress } from "@/types/github";
import { getStoredToken } from "@/lib/token";

interface StarResponse {
  starred_at: string;
  repo: StarredRepo;
}

/**
 * Fetch starred repos for a given username.
 * Uses the PUBLIC endpoint — no authentication needed.
 * The star+json Accept header gives us starred_at timestamps.
 * If a token is stored, it will be used to increase rate limits.
 * @param maxCount Maximum number of stars to fetch (default: MAX_STARS)
 */
export async function fetchAllStars(
  username: string,
  onProgress?: (progress: FetchProgress) => void,
  signal?: AbortSignal,
  maxCount: number = MAX_STARS
): Promise<StarredRepo[]> {
  const token = getStoredToken();
  const octokit = new Octokit(token ? { auth: token } : undefined);
  const allRepos: StarredRepo[] = [];
  let page = 1;
  let hasMore = true;

  onProgress?.({ loaded: 0, total: null, status: "loading" });

  while (hasMore && allRepos.length < maxCount) {
    if (signal?.aborted) throw new DOMException("Aborted", "AbortError");

    const response = await octokit.request("GET /users/{username}/starred", {
      username,
      per_page: STARS_PER_PAGE,
      page,
      headers: {
        Accept: "application/vnd.github.star+json",
      },
    });

    const items = response.data as unknown as StarResponse[];

    const repos = items.map((item) => ({
      ...item.repo,
      starred_at: item.starred_at,
    }));

    allRepos.push(...repos);

    // Parse Link header for total estimate
    const linkHeader = response.headers.link ?? "";
    const lastMatch = linkHeader.match(/page=(\d+)>; rel="last"/);
    const total = lastMatch
      ? Math.min(parseInt(lastMatch[1]) * STARS_PER_PAGE, maxCount)
      : null;

    onProgress?.({
      loaded: Math.min(allRepos.length, maxCount),
      total: hasMore ? total : Math.min(allRepos.length, maxCount),
      status: "loading",
    });

    hasMore = items.length === STARS_PER_PAGE;
    page++;
  }

  // Trim to maxCount if we fetched more
  const result = allRepos.slice(0, maxCount);

  onProgress?.({
    loaded: result.length,
    total: result.length,
    status: "done",
  });

  return result;
}
