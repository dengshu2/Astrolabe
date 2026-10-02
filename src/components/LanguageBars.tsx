import { useLang } from "../i18n";
import type { LanguageStat } from "../stats";

/** One bar per language, longest first; choosing one filters the list. */
export function LanguageBars({ stats, selected, onSelect }: { stats: LanguageStat[]; selected: string | null; onSelect: (lang: string | null) => void }) {
  const { t } = useLang();
  const max = Math.max(1, ...stats.map((s) => s.count));
  return (
    <ul className="langs">
      {stats.map((s) => {
        const name = s.language ?? t.otherLanguages;
        const row = (
          <>
            <span className="lang-name">
              <i style={{ background: s.color }} />
              {name}
            </span>
            <span className="q-bar">
              <i style={{ width: `${(s.count / max) * 100}%`, background: s.color }} />
            </span>
            <span className="lang-num">
              {s.count} <small>{s.percent < 1 ? "<1" : Math.round(s.percent)}%</small>
            </span>
          </>
        );
        return (
          <li key={name}>
            {s.language ? (
              <button
                type="button"
                className="lang-row"
                aria-pressed={selected === s.language}
                title={t.showLanguage(s.language)}
                onClick={() => onSelect(selected === s.language ? null : s.language)}
              >
                {row}
              </button>
            ) : (
              <div className="lang-row">{row}</div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
