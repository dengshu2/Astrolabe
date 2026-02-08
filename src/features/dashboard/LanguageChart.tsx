import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import type { LanguageStat } from "@/types/github";

interface Props {
  data: LanguageStat[];
}

export function LanguageChart({ data }: Props) {
  // Data is already processed in useStarStats hook (top 10 + "Other")
  const chartData = data;

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
                content={({ active, payload }) => {
                  if (active && payload && payload.length > 0) {
                    const data = payload[0].payload as LanguageStat;
                    return (
                      <div
                        style={{
                          backgroundColor: "var(--color-surface-overlay)",
                          border: "1px solid var(--color-border)",
                          borderRadius: "8px",
                          padding: "8px 12px",
                          fontSize: "12px",
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: data.color }}
                          />
                          <span style={{ color: "var(--color-text-primary)" }}>
                            {data.language}
                          </span>
                        </div>
                        <div
                          style={{
                            color: "var(--color-text-muted)",
                            marginTop: "4px",
                          }}
                        >
                          {data.count} repos ({data.percentage}%)
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
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
