import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import type { StarTimelineEntry } from "@/types/github";
import { useLanguage } from "@/i18n";

interface Props {
  data: StarTimelineEntry[];
}

export function TimelineChart({ data }: Props) {
  const { t } = useLanguage();

  return (
    <div className="h-full flex flex-col">
      <div className="mb-6 flex items-baseline justify-between">
        <div>
          <h3 className="text-base font-semibold text-gray-900">
            {t.charts.starTimeline}
          </h3>
          <p className="text-xs text-gray-400 mt-1">
            {t.charts.timelineDescription}
          </p>
        </div>
      </div>
      <div className="flex-1 min-h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="starGradient" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="0%"
                  stopColor="var(--color-brand)"
                  stopOpacity={0.4}
                />
                <stop
                  offset="100%"
                  stopColor="var(--color-brand)"
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(0,0,0,0.05)"
              vertical={false}
            />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 11, fill: "#9ca3af" }}
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
              dy={10}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "#9ca3af" }}
              tickLine={false}
              axisLine={false}
              width={35}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(255, 255, 255, 0.95)",
                border: "none",
                borderRadius: "12px",
                boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                color: "#111827",
                fontSize: "12px",
                padding: "8px 12px",
              }}
              cursor={{ stroke: "var(--color-brand)", strokeWidth: 1, strokeDasharray: "4 4" }}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              formatter={((value: number) => [<span className="font-bold text-gray-900">{value} {t.common.total}</span>, ""]) as any}
            />
            <Area
              type="monotone"
              dataKey="cumulative"
              stroke="var(--color-brand)"
              strokeWidth={3}
              fill="url(#starGradient)"
              activeDot={{ r: 6, strokeWidth: 0, fill: "var(--color-brand)" }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
