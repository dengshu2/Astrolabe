import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import type { LanguageStat } from "@/types/github";
import { useLanguage } from "@/i18n";

interface Props {
  data: LanguageStat[];
}

export function LanguageChart({ data }: Props) {
  const { t } = useLanguage();
  // Data is already processed in useStarStats hook (top 10 + "Other")
  const chartData = data;

  return (
    <div className="h-full flex flex-col">
      <h3 className="text-base font-semibold text-gray-900 mb-6">
        {t.charts.languages}
      </h3>
      <div className="flex items-center gap-6 flex-1">
        <div className="w-48 h-48 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                dataKey="count"
                nameKey="language"
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={4}
                strokeWidth={0}
                cornerRadius={4}
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
                      <div className="bg-white/90 backdrop-blur border border-gray-100 rounded-xl shadow-xl p-3 text-xs">
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className="w-2 h-2 rounded-full shrink-0"
                            style={{ backgroundColor: data.color }}
                          />
                          <span className="font-semibold text-gray-900">
                            {data.language}
                          </span>
                        </div>
                        <div className="text-gray-500 pl-4">
                          {data.count} {t.common.repos} ({data.percentage}%)
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
        <ul className="flex-1 space-y-2 text-sm overflow-auto max-h-56 pr-2 custom-scrollbar">
          {chartData.map((item) => (
            <li key={item.language} className="flex items-center gap-3">
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-gray-700 font-medium truncate flex-1">
                {item.language}
              </span>
              <span className="text-gray-400 tabular-nums text-xs">
                {item.percentage}%
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
