import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import type { LanguageStat } from "@/types/github";

interface Props {
  data: LanguageStat[];
}

export function LanguageChart({ data }: Props) {
  // Show top 10, group rest as "Other"
  const top = data.slice(0, 10);
  const rest = data.slice(10);
  const chartData =
    rest.length > 0
      ? [
          ...top,
          {
            language: "Other",
            count: rest.reduce((s, d) => s + d.count, 0),
            percentage: rest.reduce((s, d) => s + d.percentage, 0),
            color: "#8b949e",
          },
        ]
      : top;

  return (
    <div className="bg-[var(--color-surface-raised)] rounded-xl border border-[var(--color-border)] p-5">
      <h3 className="text-sm font-medium text-[var(--color-text-secondary)] mb-4">
        Languages
      </h3>
      <div className="flex items-center gap-6">
        <div className="w-40 h-40 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                dataKey="count"
                nameKey="language"
                cx="50%"
                cy="50%"
                innerRadius={35}
                outerRadius={65}
                paddingAngle={2}
                strokeWidth={0}
              >
                {chartData.map((entry) => (
                  <Cell key={entry.language} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--color-surface-overlay)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "8px",
                  color: "var(--color-text-primary)",
                  fontSize: "12px",
                }}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                formatter={((value: number, name: string) => [
                  `${value} repos`,
                  name,
                ]) as any}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <ul className="flex-1 space-y-1.5 text-sm overflow-auto max-h-40">
          {chartData.map((item) => (
            <li key={item.language} className="flex items-center gap-2">
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-[var(--color-text-primary)] truncate">
                {item.language}
              </span>
              <span className="ml-auto text-[var(--color-text-muted)] tabular-nums">
                {item.count}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
