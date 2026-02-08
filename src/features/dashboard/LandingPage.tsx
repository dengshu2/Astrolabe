import { useState, type FormEvent } from "react";
import { Compass, BarChart3, StarOff, Zap, Search } from "lucide-react";

const features = [
  {
    icon: BarChart3,
    title: "Visual Insights",
    description:
      "See stars by language, timeline, and health at a glance.",
  },
  {
    icon: StarOff,
    title: "Quick Cleanup",
    description:
      "Find stale and abandoned repos. Unstar them in one click.",
  },
  {
    icon: Zap,
    title: "Zero Friction",
    description:
      "Enter any GitHub username. No login, no setup, instant results.",
  },
];

interface Props {
  onSubmit: (username: string) => void;
}

export function LandingPage({ onSubmit }: Props) {
  const [input, setInput] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (trimmed) onSubmit(trimmed);
  };

  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex flex-col items-center justify-center px-4">
      {/* Hero */}
      <div className="text-center max-w-2xl mx-auto mb-16">
        <div className="flex items-center justify-center gap-3 mb-6">
          <Compass className="w-12 h-12 text-[var(--color-brand)]" />
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
          Explore your{" "}
          <span className="text-[var(--color-brand)]">starred</span> universe
        </h1>
        <p className="text-lg text-[var(--color-text-secondary)] leading-relaxed mb-8">
          Visualize any GitHub user's stars. Find stale repos, discover
          patterns, and clean up what you no longer need.
        </p>

        {/* Username input */}
        <form onSubmit={handleSubmit} className="max-w-md mx-auto">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-text-muted)]" />
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Enter a GitHub username..."
              autoFocus
              className="w-full pl-12 pr-28 py-3.5 rounded-xl bg-[var(--color-surface-raised)] border border-[var(--color-border)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-brand)] focus:ring-1 focus:ring-[var(--color-brand)] text-base transition-colors"
            />
            <button
              type="submit"
              disabled={!input.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 px-5 py-2 rounded-lg bg-[var(--color-brand)] text-white text-sm font-medium hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
            >
              Explore
            </button>
          </div>
        </form>

        <p className="text-xs text-[var(--color-text-muted)] mt-3">
          Try it with any public GitHub username — no sign-in needed
        </p>
      </div>

      {/* Feature cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl w-full">
        {features.map(({ icon: Icon, title, description }) => (
          <div
            key={title}
            className="bg-[var(--color-surface-raised)] rounded-xl border border-[var(--color-border)] p-5 text-center"
          >
            <Icon className="w-8 h-8 text-[var(--color-brand)] mx-auto mb-3" />
            <h3 className="font-medium text-sm mb-1">{title}</h3>
            <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
              {description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
