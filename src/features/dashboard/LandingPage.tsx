import { useState, type FormEvent } from "react";
import { Compass, BarChart3, Zap, Search, Users, ArrowRight } from "lucide-react";
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
      color: "text-blue-500",
      bg: "bg-blue-50",
    },
    {
      icon: Zap,
      title: t.landing.features.zeroFriction.title,
      description: t.landing.features.zeroFriction.description,
      color: "text-amber-500",
      bg: "bg-amber-50",
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
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-blue-200/20 blur-[100px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-purple-200/20 blur-[100px]" />
      </div>

      {/* Hero */}
      <div className="text-center max-w-3xl mx-auto mb-16 relative z-10">
        <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-white shadow-xl shadow-blue-500/10 mb-8 border border-blue-50">
          <Compass className="w-10 h-10 text-[var(--color-brand)]" />
        </div>

        <h1 className="text-5xl sm:text-6xl font-bold tracking-tight mb-8 text-gray-900 leading-tight">
          {t.landing.heroTitle}{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 leading-normal pb-2">
            {t.landing.heroTitleHighlight}
          </span>{" "}
          {t.landing.heroTitleEnd}
        </h1>

        <p className="text-xl text-gray-500 leading-relaxed mb-10 max-w-2xl mx-auto">
          {t.landing.heroDescription}
        </p>

        {/* Username input */}
        <div className="max-w-xl mx-auto p-2 bg-white rounded-[20px] shadow-2xl shadow-blue-900/5 border border-gray-100">
          <form onSubmit={handleSubmit} className="relative flex items-center">
            <div className="absolute left-4 text-gray-400">
              <Search className="w-5 h-5" />
            </div>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t.landing.inputPlaceholder}
              autoFocus
              className="w-full pl-12 pr-4 py-4 rounded-xl bg-transparent text-lg text-gray-900 placeholder:text-gray-400 focus:outline-none"
            />
            <button
              type="submit"
              disabled={!input.trim()}
              className="absolute right-2 px-6 py-2.5 rounded-xl bg-[var(--color-brand)] text-white text-base font-semibold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-500/30 flex items-center gap-2"
            >
              {t.landing.exploreButton}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>

        <p className="text-sm text-gray-400 mt-4 font-medium">
          {t.landing.hint}
        </p>

        {/* 推荐用户 */}
        <div className="mt-10">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Users className="w-4 h-4 text-gray-400" />
            <span className="text-sm font-medium text-gray-500 uppercase tracking-widest">
              {t.landing.suggestedUsers}
            </span>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            {suggestedUsers.map(({ username, label }) => (
              <button
                key={username}
                onClick={() => onSubmit(username)}
                className="px-4 py-2 rounded-full text-sm font-medium bg-white border border-gray-200 text-gray-600 hover:border-blue-400 hover:text-blue-600 hover:shadow-md transition-all"
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Feature cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-3xl w-full relative z-10">
        {features.map(({ icon: Icon, title, description, color, bg }) => (
          <div
            key={title}
            className="bg-white rounded-2xl border border-transparent shadow-lg shadow-gray-200/50 p-8 text-center hover:scale-[1.02] transition-transform duration-300"
          >
            <div className={`inline-flex p-3 rounded-xl mb-4 ${bg}`}>
              <Icon className={`w-6 h-6 ${color}`} />
            </div>
            <h3 className="font-bold text-lg mb-2 text-gray-900">{title}</h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              {description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
