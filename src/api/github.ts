import { STARS_PER_PAGE, MAX_STARS } from "@/lib/constants";
import type { StarredRepo, FetchProgress } from "@/types/github";

const API_BASE = "https://api.github.com";

/** Number of concurrent requests to make */
const CONCURRENT_REQUESTS = 3;

/** Error carrying the HTTP status so callers can distinguish 404/403 */
export class GitHubApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "GitHubApiError";
    this.status = status;
  }
}

/** Raw shape of one item from GET /users/{username}/starred (star+json) */
interface RawStarItem {
  starred_at: string;
  repo: StarredRepo & Record<string, unknown>;
}

/**
 * Pick only the fields declared on StarredRepo. The raw API object has 100+
 * fields; keeping them all bloats memory and overflows the localStorage
 * quota when caching large accounts.
 */
function toStarredRepo(item: RawStarItem): StarredRepo {
  const r = item.repo;
  return {
    id: r.id,
    name: r.name,
    full_name: r.full_name,
    html_url: r.html_url,
    description: r.description,
    language: r.language,
    stargazers_count: r.stargazers_count,
    forks_count: r.forks_count,
    open_issues_count: r.open_issues_count,
    archived: r.archived,
    pushed_at: r.pushed_at,
    created_at: r.created_at,
    updated_at: r.updated_at,
    topics: r.topics ?? [],
    owner: {
      login: r.owner.login,
      avatar_url: r.owner.avatar_url,
      html_url: r.owner.html_url,
    },
    starred_at: item.starred_at,
  };
}

/**
 * Fetch a single page of starred repos
 */
async function fetchStarPage(
  username: string,
  page: number,
  signal?: AbortSignal
): Promise<{ repos: StarredRepo[]; hasMore: boolean; lastPage: number | null }> {
  const url =
    `${API_BASE}/users/${encodeURIComponent(username)}/starred` +
    `?per_page=${STARS_PER_PAGE}&page=${page}`;

  const response = await fetch(url, {
    headers: {
      // The star+json media type includes starred_at timestamps
      Accept: "application/vnd.github.star+json",
    },
    signal,
  });

  if (!response.ok) {
    throw new GitHubApiError(
      `GitHub API responded with ${response.status}`,
      response.status
    );
  }

  const items = (await response.json()) as RawStarItem[];
  const repos = items.map(toStarredRepo);

  // Parse Link header for total estimate
  const linkHeader = response.headers.get("link") ?? "";
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
 * Note: unauthenticated requests are limited to 60/hour per IP by GitHub.
 * @param maxCount Maximum number of stars to fetch (default: MAX_STARS)
 */
export async function fetchAllStars(
  username: string,
  onProgress?: (progress: FetchProgress) => void,
  signal?: AbortSignal,
  maxCount: number = MAX_STARS
): Promise<StarredRepo[]> {
  onProgress?.({ loaded: 0, total: null, status: "loading" });

  // First, fetch page 1 to determine total pages
  const firstResult = await fetchStarPage(username, 1, signal);

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
      pagesToFetch.map((page) => fetchStarPage(username, page, signal))
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
