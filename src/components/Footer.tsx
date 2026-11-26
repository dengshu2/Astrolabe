import { useLang } from "../i18n";
import { useTheme } from "../theme";

export function Footer() {
  const { t, toggle } = useLang();
  const { theme, toggle: toggleTheme } = useTheme();
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
      <span aria-hidden="true">·</span>
      <button type="button" onClick={toggleTheme}>
        {theme === "dark" ? t.lightMode : t.darkMode}
      </button>
    </footer>
  );
}
