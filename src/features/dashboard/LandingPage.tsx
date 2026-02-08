import { useState, type FormEvent } from "react";
import { Compass, BarChart3, Zap, Search, Users } from "lucide-react";
import { useLanguage } from "@/i18n";

interface Props {
  onSubmit: (username: string) => void;
}

export function LandingPage({ onSubmit }: Props) {
  const [input, setInput] = useState("");
  const { t } = useLanguage();

  const features = [
    {
      icon: BarChart3,
      title: t.landing.features.visualInsights.title,
      description: t.landing.features.visualInsights.description,
    },
    {
      icon: Zap,
      title: t.landing.features.zeroFriction.title,
      description: t.landing.features.zeroFriction.description,
    },
  ];

  // 推荐的活跃 GitHub 用户
  const suggestedUsers = [
    { username: "torvalds", label: "Linus Torvalds" },
    { username: "yyx990803", label: "Evan You" },
    { username: "gaearon", label: "Dan Abramov" },
    { username: "ruanyf", label: "阮一峰" },
    { username: "antfu", label: "Anthony Fu" },
    { username: "sindresorhus", label: "Sindre Sorhus" },
  ];

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
          {t.landing.heroTitle}{" "}
          <span className="text-[var(--color-brand)]">{t.landing.heroTitleHighlight}</span>{" "}
          {t.landing.heroTitleEnd}
        </h1>
        <p className="text-lg text-[var(--color-text-secondary)] leading-relaxed mb-8">
          {t.landing.heroDescription}
        </p>

        {/* Username input */}
        <form onSubmit={handleSubmit} className="max-w-md mx-auto">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-text-muted)]" />
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t.landing.inputPlaceholder}
              autoFocus
              className="w-full pl-12 pr-28 py-3.5 rounded-xl bg-[var(--color-surface-raised)] border border-[var(--color-border)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-brand)] focus:ring-1 focus:ring-[var(--color-brand)] text-base transition-colors"
            />
            <button
              type="submit"
              disabled={!input.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 px-5 py-2 rounded-lg bg-[var(--color-brand)] text-white text-sm font-medium hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
            >
              {t.landing.exploreButton}
            </button>
          </div>
        </form>

        <p className="text-xs text-[var(--color-text-muted)] mt-3">
          {t.landing.hint}
        </p>

        {/* 推荐用户 */}
        <div className="mt-6">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Users className="w-4 h-4 text-[var(--color-text-muted)]" />
            <span className="text-sm text-[var(--color-text-muted)]">
              {t.landing.suggestedUsers}
            </span>
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            {suggestedUsers.map(({ username, label }) => (
              <button
                key={username}
                onClick={() => onSubmit(username)}
                className="px-3 py-1.5 rounded-full text-xs font-medium bg-[var(--color-surface-raised)] border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-brand)] hover:text-[var(--color-brand)] transition-colors"
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Feature cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl w-full">
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
