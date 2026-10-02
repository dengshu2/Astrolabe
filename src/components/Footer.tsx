import { useLang } from "../i18n";

export function Footer() {
  const { t, toggle } = useLang();
  return (
    <footer className="foot">
      <span>{t.dataFrom}</span>
      <span aria-hidden="true">·</span>
      <a href="https://github.com/dengshu2/Astrolabe" target="_blank" rel="noopener noreferrer">
        {t.source}
      </a>
      <span aria-hidden="true">·</span>
      <button type="button" onClick={toggle}>
        {t.switchTo}
      </button>
    </footer>
  );
}
