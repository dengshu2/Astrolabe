import { useLang } from "../i18n";
import type { MonthCount } from "../stats";

/** Stars per month as bars, with a year scale under them. */
export function Timeline({ months, last30 }: { months: MonthCount[]; last30: number }) {
  const { t } = useLang();
  const n = months.length;
  if (!n) return null;
  const max = Math.max(1, ...months.map((m) => m.count));
  const peak = months.reduce((a, b) => (b.count > a.count ? b : a));

  // Label Januaries (and the first month), at most about seven of them, and
  // none so close to the previous one that the two would touch.
  const years = months.map((m, i) => ({ i, m })).filter(({ m, i }) => m.month.endsWith("-01") || i === 0);
  const step = Math.ceil(years.length / 7);
  const ticks = years.filter((y, k) => k % step === 0 && (k === 0 || y.i - years[0].i >= n * 0.08));

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
      <div className="tl-axis" aria-hidden="true">
        {ticks.map(({ i, m }) => (
          <span key={m.month} style={{ left: `${((i + 0.5) / n) * 100}%` }}>
            {m.month.slice(0, 4)}
          </span>
        ))}
      </div>
      <p className="q-meta tl-note">
        {t.peak(peak.month, peak.count)} · {t.last30(last30)}
      </p>
    </div>
  );
}
