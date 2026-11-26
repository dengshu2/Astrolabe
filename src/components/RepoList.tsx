import { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { download, toCSV, toJSON } from "../export";
import { useLang } from "../i18n";
import { allLanguages, classifyHealth, filterRepos, type Filters, type HealthCounts } from "../stats";
import type { Health, Repo, SortKey } from "../types";
import { avatar, compactCount } from "../ui";
import { languageColor } from "../colors";
import { Icon } from "./Icon";

const PAGE = 60;
const SHOWN_LANGUAGES = 10;
const MAX_TOPICS = 3;
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
  const searchRef = useRef<HTMLInputElement>(null);

  const deferredQuery = useDeferredValue(filters.query);
  const deferredFilters = useMemo(
    () => ({ ...filters, query: deferredQuery }),
    [filters, deferredQuery],
  );

  const shown = useMemo(() => filterRepos(repos, deferredFilters), [repos, deferredFilters]);
  const languages = useMemo(() => allLanguages(repos), [repos]);
  const top = allLangs ? languages : languages.slice(0, SHOWN_LANGUAGES);
  // Keep a chosen language visible even when it is outside the top ones.
  const chosen = languages.find((l) => l.language === filters.language);
  const visibleLangs = chosen && !top.includes(chosen) ? [...top, chosen] : top;

  const set = (f: Partial<Filters>) => {
    setLimit(PAGE);
    onChange(f);
  };

  const clearAll = () => set({ query: "", health: "all", language: null, month: null });

  const availableHealths = HEALTHS.filter((h) => counts[h] > 0 || filters.health === h);
  const showHealthSeg = availableHealths.length > 1 || filters.health !== "all";
  const filtered =
    filters.query.trim() !== "" ||
    filters.health !== "all" ||
    filters.language !== null ||
    Boolean(filters.month);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "/" || e.metaKey || e.ctrlKey || e.altKey) return;
      const el = e.target as HTMLElement | null;
      if (el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.tagName === "SELECT" || el.isContentEditable)) {
        return;
      }
      e.preventDefault();
      searchRef.current?.focus();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const queryTerm = deferredQuery.trim().toLowerCase();

  return (
    <>
      <div className="list-tools">
        <div className="search-wrap">
          <span className="search-icon" aria-hidden="true">
            <Icon name="search" small />
          </span>
          <input
            ref={searchRef}
            className="q-search"
            type="search"
            value={filters.query}
            onChange={(e) => set({ query: e.target.value })}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                if (filters.query) set({ query: "" });
                else searchRef.current?.blur();
              }
            }}
            placeholder={t.searchRepos}
            aria-label={t.searchRepos}
            autoComplete="off"
            spellCheck={false}
          />
          {filters.query ? (
            <button
              type="button"
              className="search-clear"
              aria-label={t.clearSearch}
              onClick={() => {
                set({ query: "" });
                searchRef.current?.focus();
              }}
            >
              <Icon name="x" small />
            </button>
          ) : (
            <kbd className="search-kbd" aria-hidden="true">/</kbd>
          )}
        </div>

        <div className={showHealthSeg ? "seg-row" : "seg-row seg-row--single"}>
          {showHealthSeg && (
            <div className="q-seg" role="group" aria-label={t.repos}>
              <button type="button" aria-pressed={filters.health === "all"} onClick={() => set({ health: "all" })}>
                {t.all}
              </button>
              {availableHealths.map((h) => (
                <button key={h} type="button" aria-pressed={filters.health === h} onClick={() => set({ health: h })}>
                  {t.health[h]}
                </button>
              ))}
            </div>
          )}
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
          {languages.length > SHOWN_LANGUAGES && (
            <button type="button" className="q-chip more" onClick={() => setAllLangs((v) => !v)}>
              {allLangs ? t.lessLanguages : t.moreLanguages(languages.length - SHOWN_LANGUAGES)}
            </button>
          )}
        </div>

        <div className="list-meta">
          <span className="q-meta q-num">
            {shown.length === repos.length ? repos.length.toLocaleString() : `${shown.length.toLocaleString()} / ${repos.length.toLocaleString()}`}
          </span>
          {filters.month && (
            <button
              type="button"
              className="active-tag"
              aria-label={t.removeMonth(filters.month)}
              onClick={() => set({ month: null })}
            >
              {filters.month}
              <Icon name="x" small />
            </button>
          )}
          {filtered && (
            <button type="button" className="q-btn q-btn--quiet q-btn--sm clear-inline" onClick={clearAll}>
              {t.clearFilters}
            </button>
          )}
          <span className="list-export" title={t.exportHint}>
            {filtered && shown.length > 0 && <span className="q-meta export-label">{t.exportCount(shown.length)}</span>}
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
            <button type="button" className="q-btn q-btn--sm" onClick={clearAll}>
              {t.clearFilters}
            </button>
          )}
        </div>
      ) : (
        <div className="repos">
          {shown.slice(0, limit).map((r) => (
            <RepoCard key={r.id} repo={r} query={queryTerm} onTopic={(topic) => set({ query: topic })} />
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

function pickTopics(topics: string[], query: string): string[] {
  if (!topics.length) return [];
  if (!query) return topics.slice(0, MAX_TOPICS);
  const matched = topics.filter((tp) => tp.toLowerCase().includes(query));
  const rest = topics.filter((tp) => !tp.toLowerCase().includes(query));
  return [...matched, ...rest].slice(0, MAX_TOPICS);
}

function RepoCard({ repo, query, onTopic }: { repo: Repo; query: string; onTopic: (topic: string) => void }) {
  const { t, ago } = useLang();
  const health = classifyHealth(repo);
  const topics = pickTopics(repo.topics, query);

  return (
    <article className="repo">
      <div className="repo-head">
        <img src={avatar(repo.owner.avatar_url, 40)} alt="" width={20} height={20} loading="lazy" />
        <a className="repo-link" href={repo.html_url} target="_blank" rel="noopener noreferrer">
          <span className="repo-name">
            <span>{repo.owner.login}/</span>
            <b>{repo.name}</b>
          </span>
        </a>
        {health !== "active" && <span className={`badge badge--${health}`}>{t.health[health]}</span>}
      </div>

      <div className="repo-body">
        {repo.description && <p className="repo-desc">{repo.description}</p>}
        {topics.length > 0 && (
          <div className="repo-topics">
            {topics.map((tp) => {
              const isMatch = Boolean(query && tp.toLowerCase().includes(query));
              return (
                <button
                  key={tp}
                  type="button"
                  className={isMatch ? "repo-topic is-match" : "repo-topic"}
                  aria-label={t.filterByTopic(tp)}
                  onClick={() => onTopic(tp)}
                >
                  {tp}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="repo-foot">
        <div className="repo-meta">
          {repo.language && (
            <span>
              <i className="dot" style={{ background: languageColor(repo.language) }} />
              {repo.language}
            </span>
          )}
          <span className="q-num" title={repo.stargazers_count.toLocaleString()}>
            <Icon name="star" small />
            {compactCount(repo.stargazers_count)}
          </span>
        </div>
        <div className="repo-dates">
          <span>{t.pushedAgo(ago(repo.pushed_at))}</span>
          <span className="starred q-num">{t.starredOn(repo.starred_at.slice(0, 10))}</span>
        </div>
      </div>
    </article>
  );
}
