/** Small helpers shared by the components. */

export function toast(message: string, kind: "info" | "error" = "info"): void {
  const box = document.getElementById("toasts");
  if (!box) return;
  const el = document.createElement("div");
  el.className = kind === "error" ? "q-toast q-toast--error q-rise" : "q-toast q-rise";
  el.setAttribute("role", kind === "error" ? "alert" : "status");
  el.textContent = message;
  box.replaceChildren(el);
  setTimeout(() => {
    el.classList.add("is-leaving");
    setTimeout(() => el.remove(), 250);
  }, kind === "error" ? 4200 : 2400);
}

/** 1234 → "1.2k" */
export function compactCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}m`;
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, "")}k`;
  return String(n);
}

/** GitHub resizes avatars on its side through the s parameter. */
export function avatar(url: string, size: number): string {
  return `${url}${url.includes("?") ? "&" : "?"}s=${size}`;
}

export function avatarOf(login: string, size: number): string {
  return `https://avatars.githubusercontent.com/${encodeURIComponent(login)}?s=${size}`;
}

export const LOGIN_RE = /^[A-Za-z0-9](?:[A-Za-z0-9-]{0,38})$/;
