/** Users looked up on this device, newest first. */

export interface RecentUser {
  login: string;
  name: string;
  total: number;
  at: string; // ISO time of the lookup
}

const KEY = "astrolabe:recent";
const LIMIT = 8;

export function loadRecent(): RecentUser[] {
  try {
    const list = JSON.parse(localStorage.getItem(KEY) ?? "[]");
    return Array.isArray(list) ? list.filter((u) => u && typeof u.login === "string").slice(0, LIMIT) : [];
  } catch {
    return [];
  }
}

function save(list: RecentUser[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(list.slice(0, LIMIT)));
  } catch {
    // not remembered
  }
}

export function rememberUser(u: Omit<RecentUser, "at">, now = new Date()): void {
  const rest = loadRecent().filter((r) => r.login.toLowerCase() !== u.login.toLowerCase());
  save([{ ...u, at: now.toISOString() }, ...rest]);
}

export function forgetUser(login: string): RecentUser[] {
  const list = loadRecent().filter((r) => r.login.toLowerCase() !== login.toLowerCase());
  save(list);
  return list;
}
