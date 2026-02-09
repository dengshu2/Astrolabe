import { Activity, AlertTriangle, Archive, Skull } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/i18n";
import { Card } from "@/components/ui/Card";

interface Props {
  summary: {
    active: number;
    stale: number;
    archived: number;
    abandoned: number;
    total: number;
  };
}

export function HealthSummary({ summary }: Props) {
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
        <Card
          key={key}
          className="flex items-center gap-4 p-5 border-0 shadow-sm hover:shadow-md transition-shadow"
          noPadding
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
        </Card>
      ))}
    </div>
  );
}
