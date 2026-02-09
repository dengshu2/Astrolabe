import { Octokit } from "@octokit/rest";
import { STARS_PER_PAGE, MAX_STARS } from "@/lib/constants";
import type { StarredRepo, FetchProgress } from "@/types/github";


interface StarResponse {
  starred_at: string;
  repo: StarredRepo;
}

/** Number of concurrent requests to make */
const CONCURRENT_REQUESTS = 3;

/**
 * Fetch a single page of starred repos
 */
async function fetchStarPage(
  octokit: Octokit,
  username: string,
  page: number,
  signal?: AbortSignal
): Promise<{ repos: StarredRepo[]; hasMore: boolean; lastPage: number | null }> {
  const response = await octokit.request("GET /users/{username}/starred", {
    username,
    per_page: STARS_PER_PAGE,
    page,
    headers: {
      Accept: "application/vnd.github.star+json",
    },
    request: { signal },
  });

  const items = response.data as unknown as StarResponse[];
  const repos = items.map((item) => ({
    ...item.repo,
    starred_at: item.starred_at,
  }));

  // Parse Link header for total estimate
  const linkHeader = response.headers.link ?? "";
  const lastMatch = linkHeader.match(/page=(\d+)>; rel="last"/);
  const lastPage = lastMatch ? parseInt(lastMatch[1]) : null;

  return {
    repos,
    hasMore: items.length === STARS_PER_PAGE,
    lastPage,
  };
}

/**
 * Fetch starred repos for a given username with concurrent requests.
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

  const octokit = new Octokit();

  onProgress?.({ loaded: 0, total: null, status: "loading" });

  // First, fetch page 1 to determine total pages
  const firstResult = await fetchStarPage(octokit, username, 1, signal);

  if (signal?.aborted) throw new DOMException("Aborted", "AbortError");

  const allRepos: StarredRepo[] = [...firstResult.repos];

  // Calculate how many more pages we need
  const maxPages = Math.ceil(maxCount / STARS_PER_PAGE);
  const estimatedTotalPages = firstResult.lastPage
    ? Math.min(firstResult.lastPage, maxPages)
    : maxPages;
  const estimatedTotal = Math.min(
    estimatedTotalPages * STARS_PER_PAGE,
    maxCount
  );

  onProgress?.({
    loaded: allRepos.length,
    total: estimatedTotal,
    status: "loading",
  });

  // If first page wasn't full or we already have enough, we're done
  if (!firstResult.hasMore || allRepos.length >= maxCount) {
    const result = allRepos.slice(0, maxCount);
    onProgress?.({ loaded: result.length, total: result.length, status: "done" });
    return result;
  }

  // Fetch remaining pages concurrently in batches
  let currentPage = 2;
  const totalPagesToFetch = estimatedTotalPages;

  while (currentPage <= totalPagesToFetch && allRepos.length < maxCount) {
    if (signal?.aborted) throw new DOMException("Aborted", "AbortError");

    // Determine pages for this batch
    const pagesToFetch: number[] = [];
    for (let i = 0; i < CONCURRENT_REQUESTS && currentPage <= totalPagesToFetch; i++) {
      pagesToFetch.push(currentPage);
      currentPage++;
    }

    // Fetch pages concurrently
    const results = await Promise.all(
      pagesToFetch.map((page) => fetchStarPage(octokit, username, page, signal))
    );

    // Process results in order
    let shouldStop = false;
    for (const result of results) {
      allRepos.push(...result.repos);
      if (!result.hasMore) {
        shouldStop = true;
        break;
      }
    }

    onProgress?.({
      loaded: Math.min(allRepos.length, maxCount),
      total: estimatedTotal,
      status: "loading",
    });

    if (shouldStop) break;
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

