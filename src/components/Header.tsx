import { useState, type FormEvent } from "react";
import { Compass, Search, Github } from "lucide-react";

interface Props {
  username?: string;
  onNavigate: (username: string) => void;
  onGoHome: () => void;
}

export function Header({ username, onNavigate, onGoHome }: Props) {
  const [searchInput, setSearchInput] = useState("");

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = searchInput.trim();
    if (trimmed) {
      onNavigate(trimmed);
      setSearchInput("");
    }
  };

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--color-border)] bg-[var(--color-surface)]/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
        {/* Brand — click to go home */}
        <button
          onClick={onGoHome}
          className="flex items-center gap-2.5 shrink-0 hover:opacity-80 transition-opacity"
        >
          <Compass className="w-6 h-6 text-[var(--color-brand)]" />
          <span className="text-lg font-semibold tracking-tight">Astrolabe</span>
        </button>

        {/* Search bar — only visible when already viewing a user */}
        {username && (
          <form onSubmit={handleSearch} className="flex-1 max-w-sm hidden sm:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search another user..."
                className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-[var(--color-surface-raised)] border border-[var(--color-border)] text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-brand)] transition-colors"
              />
            </div>
          </form>
        )}

        {/* GitHub link */}
        <a
          href="https://github.com"
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] transition-colors"
          title="GitHub"
        >
          <Github className="w-5 h-5" />
        </a>
      </div>
    </header>
  );
}
