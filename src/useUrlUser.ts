import { useCallback, useEffect, useState } from "react";

/** The viewed user lives in ?user=, so a view can be shared, survives a
 * reload and follows the browser's back and forward buttons. */
const PARAM = "user";

function read(): string {
  return new URLSearchParams(window.location.search).get(PARAM)?.trim() ?? "";
}

const FILTER_PARAMS = ["health", "lang", "sort", "month"];

export function useUrlUser(): [string, (login: string) => void] {
  const [login, setLogin] = useState(read);

  useEffect(() => {
    const onPop = () => setLogin(read());
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const navigate = useCallback((next: string) => {
    const trimmed = next.trim();
    const url = new URL(window.location.href);
    const prev = url.searchParams.get(PARAM)?.trim() ?? "";
    if (trimmed) url.searchParams.set(PARAM, trimmed);
    else url.searchParams.delete(PARAM);
    if (trimmed.toLowerCase() !== prev.toLowerCase()) {
      for (const p of FILTER_PARAMS) url.searchParams.delete(p);
    }
    if (url.href !== window.location.href) {
      window.history.pushState({}, "", url);
      window.scrollTo(0, 0);
    }
    setLogin(trimmed);
  }, []);

  return [login, navigate];
}
