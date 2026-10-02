import { useLang } from "../i18n";
import type { HealthCounts } from "../stats";
import type { Health } from "../types";

const ORDER: Health[] = ["active", "stale", "abandoned", "archived"];

/** The four health counts; choosing one filters the repository list. */
export function HealthTiles({ counts, selected, onSelect }: { counts: HealthCounts; selected: Health | "all"; onSelect: (h: Health | "all") => void }) {
  const { t } = useLang();
  const total = ORDER.reduce((s, h) => s + counts[h], 0) || 1;
  return (
    <div className="q-tiles health">
      {ORDER.map((h) => (
        <button
          key={h}
          type="button"
          className={`q-tile health-${h}`}
          aria-pressed={selected === h}
          onClick={() => onSelect(selected === h ? "all" : h)}
        >
          <span className="q-tile-label">{t.health[h]}</span>
          <span className="q-tile-value">
            {counts[h].toLocaleString()}
            <small>{Math.round((counts[h] / total) * 100)}%</small>
          </span>
          <span className="q-tile-sub">{t.healthHint[h]}</span>
        </button>
      ))}
    </div>
  );
}
