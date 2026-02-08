import { Activity, AlertTriangle, Archive, Skull } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  summary: {
    active: number;
    stale: number;
    archived: number;
    abandoned: number;
    total: number;
  };
}

const cards = [
  {
    key: "active" as const,
    label: "Active",
    icon: Activity,
    color: "text-[var(--color-success)]",
    bg: "bg-green-500/10",
  },
  {
    key: "stale" as const,
    label: "Stale (1y+)",
    icon: AlertTriangle,
    color: "text-[var(--color-warning)]",
    bg: "bg-yellow-500/10",
  },
  {
    key: "abandoned" as const,
    label: "Abandoned (2y+)",
    icon: Skull,
    color: "text-[var(--color-danger)]",
    bg: "bg-red-500/10",
  },
  {
    key: "archived" as const,
    label: "Archived",
    icon: Archive,
    color: "text-[var(--color-text-muted)]",
    bg: "bg-gray-500/10",
  },
];

export function HealthSummary({ summary }: Props) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {cards.map(({ key, label, icon: Icon, color, bg }) => (
        <div
          key={key}
          className="bg-[var(--color-surface-raised)] rounded-xl border border-[var(--color-border)] p-4 flex items-center gap-3"
        >
          <div className={cn("p-2 rounded-lg", bg)}>
            <Icon className={cn("w-5 h-5", color)} />
          </div>
          <div>
            <div className="text-2xl font-bold tabular-nums">
              {summary[key]}
            </div>
            <div className="text-xs text-[var(--color-text-muted)]">
              {label}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
