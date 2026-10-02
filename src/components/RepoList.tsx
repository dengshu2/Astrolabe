import { useMemo, useState } from "react";
import { download, toCSV, toJSON } from "../export";
import { useLang } from "../i18n";
import { allLanguages, classifyHealth, filterRepos, type Filters, type HealthCounts } from "../stats";
import type { Health, Repo, SortKey } from "../types";
import { avatar, compactCount } from "../ui";
import { languageColor } from "../colors";
import { Icon } from "./Icon";

const PAGE = 60;
const SHOWN_LANGUAGES = 10;
const HEALTHS: Health[] = ["active", "stale", "abandoned", "archived"];
const SORTS: SortKey[] = ["starred", "pushed", "stars", "name"];

export function RepoList({
  login,
  repos,
  counts,
  filters,
  onChange,
}: {
  login: string;
  repos: Repo[];
  counts: HealthCounts;
  filters: Filters;
  onChange: (f: Partial<Filters>) => void;
}) {
  const { t } = useLang();
  const [limit, setLimit] = useState(PAGE);
  const [allLangs, setAllLangs] = useState(false);
  const shown = useMemo(() => filterRepos(repos, filters), [repos, filters]);
  const languages = useMemo(() => allLanguages(repos), [repos]);
  const top = allLangs ? languages : languages.slice(0, SHOWN_LANGUAGES);
  // Keep a chosen language visible even when it is outside the top ones.
  const chosen = languages.find((l) => l.language === filters.language);
  const visibleLangs = chosen && !top.includes(chosen) ? [...top, chosen] : top;
  const set = (f: Partial<Filters>) => {
    setLimit(PAGE);
    onChange(f);
  };
  const filtered = filters.query.trim() !== "" || filters.health !== "all" || filters.language !== null;

  return (
    <>
      <div className="list-tools">
        <input
          className="q-search"
          type="search"
          value={filters.query}
          onChange={(e) => set({ query: e.target.value })}
          placeholder={t.searchRepos}
          aria-label={t.searchRepos}
          autoComplete="off"
          spellCheck={false}
        />
        <div className="seg-row">
          <div className="q-seg" role="group" aria-label={t.repos}>
            <button type="button" aria-pressed={filters.health === "all"} onClick={() => set({ health: "all" })}>
              {t.all}
            </button>
            {HEALTHS.filter((h) => counts[h] > 0 || filters.health === h).map((h) => (
              <button key={h} type="button" aria-pressed={filters.health === h} onClick={() => set({ health: h })}>
                {t.health[h]}
              </button>
            ))}
          </div>
          <div className="q-seg" role="group" aria-label="sort">
            {SORTS.map((s) => (
              <button key={s} type="button" aria-pressed={filters.sort === s} onClick={() => set({ sort: s })}>
                {t.sort[s]}
              </button>
            ))}
          </div>
        </div>
        <div className="q-chips lang-chips" role="group" aria-label={t.languages}>
          <button type="button" className="q-chip" aria-pressed={filters.language === null} onClick={() => set({ language: null })}>
            {t.allLanguages}
          </button>
          {visibleLangs.map((l) => (
            <button
              key={l.language}
              type="button"
              className="q-chip"
              aria-pressed={filters.language === l.language}
              onClick={() => set({ language: filters.language === l.language ? null : l.language })}
            >
              <i style={{ background: languageColor(l.language) }} />
              {l.language}
              <small>{l.count}</small>
            </button>
          ))}
          {!allLangs && languages.length > SHOWN_LANGUAGES && (
            <button type="button" className="q-chip more" onClick={() => setAllLangs(true)}>
              {t.moreLanguages(languages.length - SHOWN_LANGUAGES)}
            </button>
          )}
        </div>
        <div className="list-meta">
          <span className="q-meta">
            {shown.length === repos.length ? repos.length.toLocaleString() : `${shown.length.toLocaleString()} / ${repos.length.toLocaleString()}`}
          </span>
          <span className="list-export" title={t.exportHint}>
            <button type="button" className="q-btn q-btn--quiet q-btn--sm" disabled={!shown.length} onClick={() => download(toJSON(shown), `${login}-stars.json`, "application/json")}>
              {t.exportJSON}
            </button>
            <button type="button" className="q-btn q-btn--quiet q-btn--sm" disabled={!shown.length} onClick={() => download(toCSV(shown), `${login}-stars.csv`, "text/csv;charset=utf-8")}>
              {t.exportCSV}
            </button>
          </span>
        </div>
      </div>

      {shown.length === 0 ? (
        <div className="q-state">
          <b>{t.noMatch}</b>
          {filtered && (
            <button type="button" className="q-btn q-btn--sm" onClick={() => set({ query: "", health: "all", language: null })}>
              {t.clearFilters}
            </button>
          )}
        </div>
      ) : (
        <div className="repos">
          {shown.slice(0, limit).map((r) => (
            <RepoCard key={r.id} repo={r} />
          ))}
        </div>
      )}
      {shown.length > limit && (
        <div className="more-row">
          <button type="button" className="q-btn" onClick={() => setLimit(limit + PAGE)}>
            {t.showMore(Math.min(PAGE, shown.length - limit))}
          </button>
        </div>
      )}
    </>
  );
}

function RepoCard({ repo }: { repo: Repo }) {
  const { t, ago } = useLang();
  const health = classifyHealth(repo);
  return (
    <a className="repo" href={repo.html_url} target="_blank" rel="noopener noreferrer">
      <span className="repo-head">
        <img src={avatar(repo.owner.avatar_url, 40)} alt="" width={20} height={20} loading="lazy" />
        <span className="repo-name">
          <span>{repo.owner.login}/</span>
          <b>{repo.name}</b>
        </span>
        {health !== "active" && <span className={`badge badge--${health}`}>{t.health[health]}</span>}
      </span>
      {repo.description && <span className="repo-desc">{repo.description}</span>}
      <span className="repo-meta">
        {repo.language && (
          <span>
            <i className="dot" style={{ background: languageColor(repo.language) }} />
            {repo.language}
          </span>
        )}
        <span title={repo.stargazers_count.toLocaleString()}>
          <Icon name="star" small />
          {compactCount(repo.stargazers_count)}
        </span>
        <span>{t.pushedAgo(ago(repo.pushed_at))}</span>
        <span className="starred">{t.starredOn(repo.starred_at.slice(0, 10))}</span>
      </span>
    </a>
  );
}
