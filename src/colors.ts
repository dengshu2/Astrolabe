/** GitHub's (linguist) colours for the languages people star most. */
const COLORS: Record<string, string> = {
  Assembly: "#6e4c13", Astro: "#ff5a03", C: "#555555", "C#": "#178600", "C++": "#f34b7d", Clojure: "#db5855",
  CSS: "#663399", Cuda: "#3a4e3a", Dart: "#00b4ab", Dockerfile: "#384d54", Elixir: "#6e4a7e", Elm: "#60b5cc",
  Erlang: "#b83998", "F#": "#b845fc", Fortran: "#4d41b1", GDScript: "#355570", Go: "#00add8", Groovy: "#4298b8",
  Haskell: "#5e5086", HCL: "#844fba", HTML: "#e34c26", Java: "#b07219", JavaScript: "#f1e05a", Julia: "#a270ba",
  "Jupyter Notebook": "#da5b0b", Kotlin: "#a97bff", Lua: "#000080", Makefile: "#427819", MDX: "#fcb32c",
  Nix: "#7e7eff", "Objective-C": "#438eff", OCaml: "#ef7a08", Perl: "#0298c3", PHP: "#4f5d95",
  PowerShell: "#012456", Python: "#3572a5", R: "#198ce7", Ruby: "#701516", Rust: "#dea584", Scala: "#c22d40",
  SCSS: "#c6538c", Shell: "#89e051", Solidity: "#aa6746", Svelte: "#ff3e00", Swift: "#f05138", TeX: "#3d6117",
  TypeScript: "#3178c6", Vim: "#199f4b", "Vim Script": "#199f4b", Vue: "#41b883", Zig: "#ec915c",
};

const OTHER = "#9a9a9a";

/** A language's colour; unknown ones get a stable colour from their name. */
export function languageColor(language: string | null): string {
  if (!language) return OTHER;
  const known = COLORS[language];
  if (known) return known;
  let h = 0;
  for (const ch of language) h = (h * 31 + ch.charCodeAt(0)) % 360;
  return `hsl(${h} 45% 52%)`;
}
