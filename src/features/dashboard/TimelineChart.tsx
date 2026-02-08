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

interface Props {
  data: StarTimelineEntry[];
}

export function TimelineChart({ data }: Props) {
  return (
    <div className="bg-[var(--color-surface-raised)] rounded-xl border border-[var(--color-border)] p-5">
      <div className="mb-4">
        <h3 className="text-sm font-medium text-[var(--color-text-secondary)]">
          Star Timeline
        </h3>
        <p className="text-xs text-[var(--color-text-muted)] mt-1">
          按每月 star 数量统计，展示累计 star 趋势
        </p>
      </div>
      <div className="h-52">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="starGradient" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="0%"
                  stopColor="var(--color-brand)"
                  stopOpacity={0.3}
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
              stroke="var(--color-border-muted)"
              vertical={false}
            />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 11, fill: "var(--color-text-muted)" }}
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              tick={{ fontSize: 11, fill: "var(--color-text-muted)" }}
              tickLine={false}
              axisLine={false}
              width={35}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--color-surface-overlay)",
                border: "1px solid var(--color-border)",
                borderRadius: "8px",
                color: "var(--color-text-primary)",
                fontSize: "12px",
              }}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              formatter={((value: number) => [`${value} total`, "Stars"]) as any}
            />
            <Area
              type="monotone"
              dataKey="cumulative"
              stroke="var(--color-brand)"
              strokeWidth={2}
              fill="url(#starGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
