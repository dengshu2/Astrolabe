import type { StarredRepo } from "@/types/github";

const CACHE_KEY_PREFIX = "astrolabe-stars-";
const CACHE_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes

interface CacheEntry {
    data: StarredRepo[];
    timestamp: number;
}

/**
 * Get cached stars for a user
 */
export function getCachedStars(username: string): StarredRepo[] | null {
    try {
        const key = CACHE_KEY_PREFIX + username.toLowerCase();
        const cached = sessionStorage.getItem(key);
        if (!cached) return null;

        const entry: CacheEntry = JSON.parse(cached);
        const now = Date.now();

        // Check if cache is expired
        if (now - entry.timestamp > CACHE_EXPIRY_MS) {
            sessionStorage.removeItem(key);
            return null;
        }

        return entry.data;
    } catch {
        return null;
    }
}

/**
 * Cache stars for a user
 */
export function setCachedStars(username: string, data: StarredRepo[]): void {
    try {
        const key = CACHE_KEY_PREFIX + username.toLowerCase();
        const entry: CacheEntry = {
            data,
            timestamp: Date.now(),
        };
        sessionStorage.setItem(key, JSON.stringify(entry));
    } catch {
        // Ignore storage errors (e.g., quota exceeded)
    }
}

/**
 * Clear cached stars for a user
 */
export function clearCachedStars(username: string): void {
    try {
        const key = CACHE_KEY_PREFIX + username.toLowerCase();
        sessionStorage.removeItem(key);
    } catch {
        // Ignore errors
    }
}
