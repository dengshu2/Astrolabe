import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { LoadError, fetchStars } from "../api";
import { Footer } from "../components/Footer";
import { HealthTiles } from "../components/HealthTiles";
import { Icon, Waiting } from "../components/Icon";
import { LanguageBars } from "../components/LanguageBars";
import { RepoList } from "../components/RepoList";
import { Timeline } from "../components/Timeline";
import { useLang, type Dict } from "../i18n";
import { rememberUser } from "../recent";
import { daysSince, healthCounts, languageStats, timeline, type Filters } from "../stats";
import type { Health, SortKey, Stars } from "../types";
import { avatar, toast } from "../ui";

/** Answers already loaded in this tab, so back and forward are instant. */
const loaded = new Map<string, Stars>();

const VALID_HEALTH = new Set<string>(["active", "stale", "abandoned", "archived"]);
const VALID_SORT = new Set<string>(["starred", "pushed", "stars", "name"]);
const MONTH_RE = /^\d{4}-\d{2}$/;

function readInitialFilters(): Filters {
  const sp = new URLSearchParams(window.location.search);
  const h = sp.get("health");
  const s = sp.get("sort");
  const m = sp.get("month");
  return {
    query: "",
    health: h && VALID_HEALTH.has(h) ? (h as Health) : "all",
    language: sp.get("lang") || null,
    month: m && MONTH_RE.test(m) ? m : null,
    sort: s && VALID_SORT.has(s) ? (s as SortKey) : "starred",
  };
}

function syncFiltersToUrl(filters: Filters) {
  const url = new URL(window.location.href);
  if (filters.health !== "all") url.searchParams.set("health", filters.health);
  else url.searchParams.delete("health");
  if (filters.language) url.searchParams.set("lang", filters.language);
  else url.searchParams.delete("lang");
  if (filters.month) url.searchParams.set("month", filters.month);
  else url.searchParams.delete("month");
  if (filters.sort !== "starred") url.searchParams.set("sort", filters.sort);
  else url.searchParams.delete("sort");
  if (url.href !== window.location.href) {
    window.history.replaceState({}, "", url);
  }
}

type State = { status: "loading" } | { status: "ready"; data: Stars } | { status: "error"; error: LoadError };

function errorText(t: Dict, login: string, err: LoadError): string {
  switch (err.code) {
    case "not_found":
    case "invalid_user":
      return t.notFound(login);
    case "rate_limited":
      return t.rateLimited(err.retryAfter || 30);
    case "github_busy":
      return t.githubBusy(Math.max(1, Math.ceil(err.retryAfter / 60)));
    case "network":
      return t.offline;
    default:
      return t.failed;
  }
}

const asLoadError = (err: unknown) => (err instanceof LoadError ? err : new LoadError("upstream"));

export function Dashboard({ login, onBack }: { login: string; onBack: () => void }) {
  const { t, ago } = useLang();
  const key = login.toLowerCase();
  const [state, setState] = useState<State>(() => {
    const data = loaded.get(key);
    return data ? { status: "ready", data } : { status: "loading" };
  });
  const [attempt, setAttempt] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [filters, setFilters] = useState<Filters>(readInitialFilters);
  const listRef = useRef<HTMLElement>(null);

  const accept = useCallback(
    (data: Stars) => {
      loaded.set(key, data);
      rememberUser({ login: data.user.login, name: data.user.name, total: data.total });
      setState({ status: "ready", data });
    },
    [key],
  );

  useEffect(() => {
    if (loaded.has(key)) return;
    const ctl = new AbortController();
    fetchStars(login, { signal: ctl.signal })
      .then(accept)
      .catch((err) => {
        if (!ctl.signal.aborted) setState({ status: "error", error: asLoadError(err) });
      });
    return () => ctl.abort();
  }, [key, login, attempt, accept]);

  const data = state.status === "ready" ? state.data : null;

  useEffect(() => {
    const who = data?.user.login ?? login;
    document.title = `${who} · ${t.title}`;
    return () => {
      document.title = t.title;
    };
  }, [data?.user.login, login, t.title]);

  useEffect(() => {
    syncFiltersToUrl(filters);
  }, [filters]);

  const retry = () => {
    setState({ status: "loading" });
    setAttempt((a) => a + 1);
  };

  const refresh = () => {
    setRefreshing(true);
    fetchStars(login, { refresh: true })
      .then((next) => {
        accept(next);
        toast(t.refreshed);
      })
      .catch((err) => toast(errorText(t, login, asLoadError(err)), "error"))
      .finally(() => setRefreshing(false));
  };

  const showInList = (f: Partial<Filters>) => {
    setFilters((cur) => ({ ...cur, ...f }));
    listRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const repos = useMemo(() => data?.repos ?? [], [data]);
  const counts = useMemo(() => healthCounts(repos), [repos]);
  const langs = useMemo(() => languageStats(repos), [repos]);
  const months = useMemo(() => timeline(repos), [repos]);
  const last30 = useMemo(() => repos.filter((r) => daysSince(r.starred_at) < 30).length, [repos]);

  return (
    <>
      <header className="q-top">
        <button className="q-round" type="button" onClick={onBack} aria-label={t.back}>
          <Icon name="back" />
        </button>
        <div className="q-status">
          <b>{data?.user.login ?? login}</b>
          <span>{data ? `${t.stars(data.total)} · ${t.fetchedAgo(ago(data.fetched_at))}` : " "}</span>
        </div>
        {data ? (
          <button className={refreshing ? "q-pill is-busy" : "q-pill"} type="button" onClick={refresh} disabled={refreshing}>
            {refreshing ? <span className="q-spinner" aria-hidden="true" /> : <Icon name="refresh" small />}
            {t.refresh}
          </button>
        ) : (
          <span />
        )}
      </header>

      {state.status === "loading" && (
        <main className="q-page dash dash-wait" aria-busy="true">
          <div className="q-state dash-wait-note">
            <b>{t.loading(login)}</b>
            <span className="slow">{t.loadingSlow}</span>
            <Waiting />
          </div>
          <div className="dash-skel" aria-hidden="true">
            <div className="skel-profile">
              <span className="q-skeleton skel-avatar" />
              <div className="skel-lines">
                <span className="q-skeleton" style={{ width: 160, height: 22 }} />
                <span className="q-skeleton" style={{ width: 96, height: 14 }} />
              </div>
            </div>
            <div className="q-tiles">
              {Array.from({ length: 4 }, (_, i) => (
                <div key={i} className="q-tile skel-tile">
                  <span className="q-skeleton" style={{ width: 56, height: 13 }} />
                  <span className="q-skeleton" style={{ width: 84, height: 26 }} />
                  <span className="q-skeleton" style={{ width: 112, height: 12 }} />
                </div>
              ))}
            </div>
            <div className="charts">
              <div className="card skel-card">
                <span className="q-skeleton" style={{ width: 72, height: 13 }} />
                {Array.from({ length: 6 }, (_, i) => (
                  <span key={i} className="q-skeleton" style={{ width: `${92 - i * 11}%`, height: 16 }} />
                ))}
              </div>
              <div className="card skel-card">
                <span className="q-skeleton" style={{ width: 84, height: 13 }} />
                <span className="q-skeleton" style={{ width: "100%", height: 180 }} />
              </div>
            </div>
          </div>
        </main>
      )}

      {state.status === "error" && (
        <main className="q-page">
          <div className="q-state">
            <b>{errorText(t, login, state.error)}</b>
            <div className="q-actions">
              {state.error.code !== "not_found" && state.error.code !== "invalid_user" && (
                <button type="button" className="q-btn q-btn--primary" onClick={retry}>
                  {t.retry}
                </button>
              )}
              <button type="button" className="q-btn" onClick={onBack}>
                {t.otherUser}
              </button>
            </div>
          </div>
        </main>
      )}

      {data && (
        <main className="q-page dash">
          <section className="profile">
            <img src={avatar(data.user.avatar_url, 128)} alt="" width={64} height={64} />
            <div>
              <h1>{data.user.name || data.user.login}</h1>
              <a href={data.user.html_url} target="_blank" rel="noopener noreferrer">
                @{data.user.login}
                <Icon name="open" small />
              </a>
            </div>
          </section>

          {data.total === 0 ? (
            <div className="q-state">
              <b>{t.noStars(data.user.login)}</b>
              <button type="button" className="q-btn" onClick={onBack}>
                {t.otherUser}
              </button>
            </div>
          ) : (
            <>
              {data.truncated && <p className="q-notice">{t.truncated(data.total, repos.length)}</p>}

              <HealthTiles counts={counts} selected={filters.health} onSelect={(h: Health | "all") => showInList({ health: h })} />

              <div className="charts">
                <section className="card" aria-labelledby="langs-title">
                  <h3 id="langs-title">{t.languages}</h3>
                  <LanguageBars stats={langs} selected={filters.language} onSelect={(language) => showInList({ language })} />
                </section>
                <section className="card" aria-labelledby="tl-title">
                  <h3 id="tl-title">{t.timeline}</h3>
                  <Timeline
                    months={months}
                    last30={last30}
                    selected={filters.month ?? null}
                    onSelect={(month) => showInList({ month })}
                  />
                </section>
              </div>

              <section className="q-sec list" ref={listRef} aria-labelledby="repos-title">
                <h3 id="repos-title">{t.repos}</h3>
                <RepoList login={data.user.login} repos={repos} counts={counts} filters={filters} onChange={(f) => setFilters((cur) => ({ ...cur, ...f }))} />
              </section>
            </>
          )}
          <Footer />
        </main>
      )}
    </>
  );
}
