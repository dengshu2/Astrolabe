import { useState, type FormEvent } from "react";
import { Compass, Search, Github } from "lucide-react";
import { TokenSettings } from "./TokenSettings";
import { LanguageSwitch } from "./LanguageSwitch";
import { useLanguage } from "@/i18n";


interface Props {
  username?: string;
  onNavigate: (username: string) => void;
  onGoHome: () => void;
}

export function Header({ username, onNavigate, onGoHome }: Props) {
  const [searchInput, setSearchInput] = useState("");
  const { t } = useLanguage();

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = searchInput.trim();
    if (trimmed) {
      onNavigate(trimmed);
      setSearchInput("");
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-transparent shadow-sm">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand — click to go home */}
        <button
          onClick={onGoHome}
          className="flex items-center gap-3 shrink-0 hover:opacity-80 transition-opacity group"
        >
          <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center group-hover:bg-blue-100 transition-colors">
            <Compass className="w-6 h-6 text-[var(--color-brand)]" />
          </div>
          <div className="flex flex-col items-start">
            <span className="text-lg font-bold tracking-tight text-gray-900 leading-none">Astrolabe</span>
            <span className="text-[10px] text-gray-500 font-medium tracking-wider uppercase mt-0.5">Traffic Analytics</span>
          </div>
        </button>

        {/* Search bar — only visible when already viewing a user */}
        {username && (
          <form onSubmit={handleSearch} className="flex-1 max-w-md hidden sm:block">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[var(--color-brand)] transition-colors" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder={t.header.searchPlaceholder}
                className="w-full pl-10 pr-4 py-2.5 rounded-full bg-gray-100/50 border-0 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)]/20 focus:bg-white transition-all shadow-sm"
              />
            </div>
          </form>
        )}

        {/* Right side actions */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Language switch */}
          <LanguageSwitch />

          {/* Token settings */}
          <div className="relative">
            <TokenSettings />
          </div>

          {/* GitHub link */}
          <a
            href="https://github.com/dengshu2/Astrolabe"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center w-9 h-9 rounded-full text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-all"
            title={t.header.github}
          >
            <Github className="w-5 h-5" />
          </a>
        </div>
      </div>
    </header>
  );
}
