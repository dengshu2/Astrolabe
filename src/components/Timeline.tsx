import { useEffect, useRef, useState } from "react";
import { useLang } from "../i18n";
import { yearTicks, type MonthCount } from "../stats";

/** Stars per month as bars, with a year scale under them; choosing a bar filters the list. */
export function Timeline({
  months,
  last30,
  selected = null,
  onSelect,
}: {
  months: MonthCount[];
  last30: number;
  selected?: string | null;
  onSelect?: (month: string | null) => void;
}) {
  const { t } = useLang();
  const axis = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const [hovered, setHovered] = useState<MonthCount | null>(null);

  // Labels have a fixed size in pixels, so how many fit depends on the
  // chart's real width, not on a share of it.
  useEffect(() => {
    const el = axis.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const n = months.length;
  if (!n) return null;
  const max = Math.max(1, ...months.map((m) => m.count));
  const peak = months.reduce((a, b) => (b.count > a.count ? b : a));
  const active = hovered ?? (selected ? months.find((m) => m.month === selected) ?? null : null);

  return (
    <div className="timeline">
      <div className="tl-chart">
        <span className="tl-max" aria-hidden="true">{max}</span>
        <svg viewBox={`0 0 ${n} 100`} preserveAspectRatio="none" role="img" aria-label={t.timelineLabel}>
          {months.map((m, i) => {
            if (!m.count) return null;
            const h = Math.max(2, (m.count / max) * 100);
            const isSelected = selected === m.month;
            const cls = isSelected ? "is-selected" : selected ? "is-dim" : undefined;
            return (
              <rect
                key={m.month}
                className={cls}
                x={i + 0.14}
                width={0.72}
                y={100 - h}
                height={h}
                role={onSelect ? "button" : undefined}
                tabIndex={onSelect ? 0 : undefined}
                aria-pressed={onSelect ? isSelected : undefined}
                aria-label={t.monthStars(m.month, m.count)}
                onMouseEnter={() => setHovered(m)}
                onMouseLeave={() => setHovered(null)}
                onFocus={() => setHovered(m)}
                onBlur={() => setHovered(null)}
                onClick={() => onSelect?.(isSelected ? null : m.month)}
                onKeyDown={(e) => {
                  if (onSelect && (e.key === "Enter" || e.key === " ")) {
                    e.preventDefault();
                    onSelect(isSelected ? null : m.month);
                  }
                }}
              >
                <title>{`${m.month}: ${m.count}`}</title>
              </rect>
            );
          })}
        </svg>
      </div>
      <div className="tl-axis" ref={axis} aria-hidden="true">
        {yearTicks(months, width).map(({ i, label }) => {
          const at = ((i + 0.5) / n) * 100;
          // Years are centred under their January (the card's padding takes
          // what reaches past the ends); a lone "2026-03" starts at its month.
          const shift = label.length > 4 ? "0" : "-50%";
          return (
            <span key={i} style={{ left: `${at}%`, transform: `translateX(${shift})` }}>
              {label}
            </span>
          );
        })}
      </div>
      <p className="q-meta tl-note">
        {active ? (
          <>
            <b className="tl-active">{t.monthStars(active.month, active.count)}</b>
            {onSelect && ` · ${selected === active.month ? t.monthSelectedHint : t.monthFilterHint}`}
          </>
        ) : (
          <>
            {t.peak(peak.month, peak.count)} · {t.last30(last30)}
          </>
        )}
      </p>
    </div>
  );
}
