import { useEffect, useRef, useState } from "react";
import { useLang } from "../i18n";
import { yearTicks, type MonthCount } from "../stats";

/** Stars per month as bars, with a year scale under them. */
export function Timeline({ months, last30 }: { months: MonthCount[]; last30: number }) {
  const { t } = useLang();
  const axis = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);

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

  return (
    <div className="timeline">
      <div className="tl-chart">
        <span className="tl-max" aria-hidden="true">{max}</span>
        <svg viewBox={`0 0 ${n} 100`} preserveAspectRatio="none" role="img" aria-label={t.timelineLabel}>
          {months.map((m, i) =>
            m.count ? (
              <rect key={m.month} x={i + 0.14} width={0.72} y={100 - Math.max(2, (m.count / max) * 100)} height={Math.max(2, (m.count / max) * 100)}>
                <title>{`${m.month}: ${m.count}`}</title>
              </rect>
            ) : null,
          )}
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
        {t.peak(peak.month, peak.count)} · {t.last30(last30)}
      </p>
    </div>
  );
}
