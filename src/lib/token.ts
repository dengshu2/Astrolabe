const TOKEN_KEY = "astrolabe_github_token";

/**
 * Get the stored GitHub token from localStorage
 */
export function getStoredToken(): string | null {
    try {
        return localStorage.getItem(TOKEN_KEY);
    } catch {
        return null;
    }
}

/**
 * Save a GitHub token to localStorage
 */
export function saveToken(token: string): void {
    try {
        localStorage.setItem(TOKEN_KEY, token);
    } catch {
        // localStorage might be unavailable
    }
}

/**
 * Remove the stored GitHub token
 */
export function removeToken(): void {
    try {
        localStorage.removeItem(TOKEN_KEY);
    } catch {
        // localStorage might be unavailable
    }
}
