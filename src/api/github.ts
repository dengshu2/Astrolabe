import { Octokit } from "@octokit/rest";
import { STARS_PER_PAGE } from "@/lib/constants";
import type { StarredRepo, FetchProgress } from "@/types/github";

interface StarResponse {
  starred_at: string;
  repo: StarredRepo;
}

/**
 * Fetch ALL starred repos for a given username.
 * Uses the PUBLIC endpoint — no authentication needed.
 * The star+json Accept header gives us starred_at timestamps.
 */
export async function fetchAllStars(
  username: string,
  onProgress?: (progress: FetchProgress) => void,
  signal?: AbortSignal
): Promise<StarredRepo[]> {
  const octokit = new Octokit();
  const allRepos: StarredRepo[] = [];
  let page = 1;
  let hasMore = true;

  onProgress?.({ loaded: 0, total: null, status: "loading" });

  while (hasMore) {
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
      ? parseInt(lastMatch[1]) * STARS_PER_PAGE
      : null;

    onProgress?.({
      loaded: allRepos.length,
      total: hasMore ? total : allRepos.length,
      status: "loading",
    });

    hasMore = items.length === STARS_PER_PAGE;
    page++;
  }

  onProgress?.({
    loaded: allRepos.length,
    total: allRepos.length,
    status: "done",
  });

  return allRepos;
}
