/** Stars per page when fetching (max GitHub allows) */
export const STARS_PER_PAGE = 100;

/** Repos not pushed in this many days are "stale" */
export const STALE_DAYS = 365;

/** Repos not pushed in this many days are "abandoned" */
export const ABANDONED_DAYS = 365 * 2;

/** GitHub language colors (top 20) */
export const LANGUAGE_COLORS: Record<string, string> = {
  TypeScript: "#3178c6",
  JavaScript: "#f1e05a",
  Python: "#3572a5",
  Rust: "#dea584",
  Go: "#00add8",
  Java: "#b07219",
  "C++": "#f34b7d",
  C: "#555555",
  Ruby: "#701516",
  Swift: "#f05138",
  Kotlin: "#a97bff",
  Dart: "#00b4ab",
  Shell: "#89e051",
  HTML: "#e34c26",
  CSS: "#563d7c",
  Vue: "#41b883",
  Lua: "#000080",
  Zig: "#ec915c",
  Elixir: "#6e4a7e",
  Haskell: "#5e5086",
  Other: "#8b949e",
};
