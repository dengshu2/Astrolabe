import { useState, type FormEvent } from "react";
import { Footer } from "../components/Footer";
import { Icon } from "../components/Icon";
import { useLang } from "../i18n";
import { forgetUser, loadRecent } from "../recent";
import { LOGIN_RE, avatarOf } from "../ui";

const SUGGESTED = [
  { login: "torvalds", label: "Linus Torvalds" },
  { login: "yyx990803", label: "Evan You" },
  { login: "gaearon", label: "Dan Abramov" },
  { login: "ruanyf", label: "阮一峰" },
  { login: "antfu", label: "Anthony Fu" },
  { login: "sindresorhus", label: "Sindre Sorhus" },
];

export function Home({ onOpen }: { onOpen: (login: string) => void }) {
  const { t, toggle, ago } = useLang();
  const [value, setValue] = useState("");
  const [error, setError] = useState("");
  const [recent, setRecent] = useState(loadRecent);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const login = value.trim().replace(/^@/, "").replace(/^https?:\/\/github\.com\//i, "").replace(/\/.*$/, "");
    if (!login) return;
    if (!LOGIN_RE.test(login)) {
      setError(t.invalidUsername);
      return;
    }
    onOpen(login);
  };

  return (
    <>
      <header className="q-top">
        <a className="q-round" href="https://github.com/dengshu2/Astrolabe" target="_blank" rel="noopener noreferrer" aria-label={t.source}>
          <Icon name="github" />
        </a>
        <div className="q-status">
          <b className="brand">
            <span className="q-mark" aria-hidden="true">A</span>Astrolabe
          </b>
          <span>{t.tagline}</span>
        </div>
        <button className="q-pill" type="button" onClick={toggle}>
          {t.switchTo}
        </button>
      </header>

      <main className="q-page home">
        <div className="hero">
          <span className="q-mark q-mark--lg" aria-hidden="true">A</span>
          <h1>{t.homeTitle}</h1>
          <p>{t.homeLead}</p>
        </div>

        <form className="lookup" onSubmit={submit} noValidate>
          <label className="q-visually-hidden" htmlFor="login">
            {t.username}
          </label>
          <input
            id="login"
            className="q-field"
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              setError("");
            }}
            placeholder={t.username}
            autoComplete="off"
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
            enterKeyHint="go"
            aria-invalid={!!error}
            aria-describedby={error ? "login-error" : undefined}
          />
          <button className="q-btn q-btn--primary" type="submit" disabled={!value.trim()}>
            {t.view}
          </button>
          {error && (
            <p className="q-hint lookup-error" id="login-error" role="alert">
              {error}
            </p>
          )}
        </form>

        <section className="q-sec" aria-labelledby="try-title">
          <h3 id="try-title">{t.tryThese}</h3>
          <div className="people">
            {SUGGESTED.map((s) => (
              <button key={s.login} type="button" className="person" onClick={() => onOpen(s.login)}>
                <img src={avatarOf(s.login, 64)} alt="" width={24} height={24} loading="lazy" />
                {s.label}
              </button>
            ))}
          </div>
        </section>

        {recent.length > 0 && (
          <section className="q-sec" aria-labelledby="recent-title">
            <h3 id="recent-title">{t.recent}</h3>
            <ul className="q-rows">
              {recent.map((u) => (
                <li key={u.login} className="recent-row">
                  <button type="button" className="q-row" onClick={() => onOpen(u.login)}>
                    <img className="avatar" src={avatarOf(u.login, 72)} alt="" width={36} height={36} loading="lazy" />
                    <span className="q-row-main">
                      <span>{u.name && u.name !== u.login ? `${u.name} · ${u.login}` : u.login}</span>
                      <span>
                        {t.stars(u.total)} · {ago(u.at)}
                      </span>
                    </span>
                  </button>
                  <button type="button" className="q-play q-play--sm forget" aria-label={t.forget(u.login)} onClick={() => setRecent(forgetUser(u.login))}>
                    <Icon name="x" />
                  </button>
                </li>
              ))}
            </ul>
          </section>
        )}
        <Footer />
      </main>
    </>
  );
}
