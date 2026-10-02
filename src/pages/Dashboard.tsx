import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { LoadError, fetchStars } from "../api";
import { Footer } from "../components/Footer";
import { HealthTiles } from "../components/HealthTiles";
import { Icon, Waiting } from "../components/Icon";
import { LanguageBars } from "../components/LanguageBars";
import { Prompts } from "../components/Prompts";
import { RepoList } from "../components/RepoList";
import { Timeline } from "../components/Timeline";
import { useLang, type Dict } from "../i18n";
import { rememberUser } from "../recent";
import { daysSince, healthCounts, languageStats, timeline, type Filters } from "../stats";
import type { Health, Stars } from "../types";
import { avatar, toast } from "../ui";

/** Answers already loaded in this tab, so back and forward are instant. */
const loaded = new Map<string, Stars>();

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
  const [filters, setFilters] = useState<Filters>({ query: "", health: "all", language: null, sort: "starred" });
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

  const retry = () => {
    setState({ status: "loading" });
    setAttempt((a) => a + 1);
  };

  const refresh = () => {
    setRefreshing(true);
    fetchStars(login, { refresh: true })
      .then((data) => {
        accept(data);
        toast(t.refreshed);
      })
      .catch((err) => toast(errorText(t, login, asLoadError(err)), "error"))
      .finally(() => setRefreshing(false));
  };

  const showInList = (f: Partial<Filters>) => {
    setFilters((cur) => ({ ...cur, ...f }));
    listRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const data = state.status === "ready" ? state.data : null;
  const repos = useMemo(() => data?.repos ?? [], [data]);
  const counts = useMemo(() => healthCounts(repos), [repos]);
  const langs = useMemo(() => languageStats(repos), [repos]);
  const months = useMemo(() => timeline(repos), [repos]);
  const last30 = useMemo(() => repos.filter((r) => daysSince(r.starred_at) < 30).length, [repos]);
  const promptInput = useMemo(
    () => ({ login: data?.user.login ?? login, total: data?.total ?? 0, recent: repos, languages: langs, health: counts }),
    [data, login, repos, langs, counts],
  );

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
        <main className="q-page dash-wait" aria-busy="true">
          <div className="q-state">
            <b>{t.loading(login)}</b>
            <span className="slow">{t.loadingSlow}</span>
            <Waiting />
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
                  <Timeline months={months} last30={last30} />
                </section>
              </div>

              <section className="q-sec" aria-labelledby="prompts-title">
                <div className="sec-head">
                  <h3 id="prompts-title">{t.prompts}</h3>
                  <span className="q-meta">{t.promptsLead}</span>
                </div>
                <Prompts input={promptInput} />
              </section>

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
