import { Activity, AlertTriangle, Archive, Skull } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/i18n";
import type { RepoHealth } from "@/types/github";

interface Props {
  summary: {
    active: number;
    stale: number;
    archived: number;
    abandoned: number;
    total: number;
  };
  /** Currently selected health filter; clicking a card toggles it */
  selected: RepoHealth | "all";
  onSelect: (health: RepoHealth | "all") => void;
}

export function HealthSummary({ summary, selected, onSelect }: Props) {
  const { t } = useLanguage();

  const cards = [
    {
      key: "active" as const,
      label: t.health.active,
      icon: Activity,
      color: "text-emerald-500",
      bg: "bg-emerald-50",
    },
    {
      key: "stale" as const,
      label: t.health.stale,
      icon: AlertTriangle,
      color: "text-amber-500",
      bg: "bg-amber-50",
    },
    {
      key: "abandoned" as const,
      label: t.health.abandoned,
      icon: Skull,
      color: "text-rose-500",
      bg: "bg-rose-50",
    },
    {
      key: "archived" as const,
      label: t.health.archived,
      icon: Archive,
      color: "text-slate-400",
      bg: "bg-slate-50",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map(({ key, label, icon: Icon, color, bg }) => (
        <button
          key={key}
          type="button"
          aria-pressed={selected === key}
          onClick={() => onSelect(selected === key ? "all" : key)}
          className={cn(
            "flex items-center gap-4 p-5 text-left cursor-pointer",
            "bg-(--color-surface) rounded-(--radius-card) shadow-sm hover:shadow-md transition-all",
            selected === key
              ? "ring-2 ring-(--color-brand)"
              : "ring-1 ring-transparent"
          )}
        >
          <div className={cn("p-3 rounded-xl shrink-0", bg)}>
            <Icon className={cn("w-6 h-6", color)} />
          </div>
          <div>
            <div className="text-2xl font-bold tabular-nums text-gray-900">
              {summary[key]}
            </div>
            <div className="text-sm font-medium text-gray-500">
              {label}
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}
