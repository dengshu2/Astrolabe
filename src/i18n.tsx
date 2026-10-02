/** Chinese and English text. The language follows the browser until the
 * visitor picks one, which is then remembered. */

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Health, SortKey } from "./types";

export type Lang = "zh" | "en";

const zh = {
  htmlLang: "zh-CN",
  title: "Astrolabe · GitHub Star 分析",
  tagline: "GitHub Star 分析",
  homeTitle: "看看一个人都 Star 了什么",
  homeLead: "输入 GitHub 用户名，看他收藏的仓库用了哪些语言、是什么时候收藏的，以及哪些已经没人维护。不用登录。",
  username: "GitHub 用户名",
  view: "查看",
  invalidUsername: "GitHub 用户名只能有字母、数字和连字符",
  tryThese: "试试这些",
  recent: "最近看过",
  forget: (login: string) => `从最近看过里去掉 ${login}`,
  stars: (n: number) => `${n.toLocaleString()} 个 Star`,
  back: "返回",
  refresh: "刷新",
  refreshed: "已是最新",
  fetchedAgo: (ago: string) => `${ago}读取`,
  loading: (login: string) => `正在读取 ${login} 的 Star`,
  loadingSlow: "Star 多的账号要多等几秒",
  notFound: (login: string) => `GitHub 上没有 ${login} 这个用户`,
  rateLimited: (s: number) => `查得太频繁了，${s} 秒后再试`,
  githubBusy: (m: number) => `GitHub 的查询额度暂时用完了，大约 ${m} 分钟后恢复`,
  failed: "读取失败，请稍后再试",
  offline: "连不上服务器，检查一下网络",
  retry: "重试",
  otherUser: "换一个用户",
  noStars: (login: string) => `${login} 还没有 Star 过仓库`,
  truncated: (total: number, kept: number) => `一共 ${total.toLocaleString()} 个 Star，这里分析最近的 ${kept.toLocaleString()} 个。`,
  health: { active: "活跃", stale: "一年没更新", abandoned: "两年没更新", archived: "已归档" } satisfies Record<Health, string>,
  healthHint: {
    active: "一年内有提交",
    stale: "最后提交在一到两年前",
    abandoned: "两年多没有提交",
    archived: "作者已停止维护",
  } satisfies Record<Health, string>,
  languages: "语言",
  otherLanguages: "其他",
  showLanguage: (lang: string) => `只看 ${lang} 的仓库`,
  timeline: "收藏时间线",
  timelineLabel: "每月 Star 的仓库数",
  peak: (month: string, n: number) => `最多的一个月是 ${month}，${n} 个`,
  last30: (n: number) => `最近 30 天 ${n} 个`,
  prompts: "AI 提示词",
  promptsLead: "复制后粘贴给任意 AI 助手",
  promptProfile: "技术画像",
  promptProfileHint: "根据语言、标签和最近的收藏，推测技术栈和兴趣",
  promptLists: "整理成 GitHub Lists",
  promptListsHint: (n: number) => `把最近 ${n} 个仓库分组，并挑出可以取消 Star 的`,
  preview: "预览",
  hide: "收起",
  copy: "复制",
  copied: "已复制",
  copyFailed: "复制失败，请检查浏览器的剪贴板权限",
  repos: "仓库",
  searchRepos: "搜索名称、描述或标签",
  all: "全部",
  sort: { starred: "最近收藏", pushed: "最近更新", stars: "Star 最多", name: "名称" } satisfies Record<SortKey, string>,
  allLanguages: "全部语言",
  moreLanguages: (n: number) => `还有 ${n} 种`,
  showMore: (n: number) => `再显示 ${n} 个`,
  noMatch: "没有符合条件的仓库",
  clearFilters: "清除筛选",
  exportJSON: "导出 JSON",
  exportCSV: "导出 CSV",
  exportHint: "导出当前列表里的仓库",
  pushedAgo: (ago: string) => `${ago}更新`,
  starredOn: (date: string) => `收藏于 ${date}`,
  source: "源码",
  dataFrom: "数据来自 GitHub 公开接口",
  switchTo: "English",
};

export type Dict = typeof zh;

const plural = (n: number, one: string, many: string) => `${n.toLocaleString("en")} ${n === 1 ? one : many}`;

const en: Dict = {
  htmlLang: "en",
  title: "Astrolabe · GitHub stars explorer",
  tagline: "GitHub stars explorer",
  homeTitle: "See what anyone has starred",
  homeLead: "Enter a GitHub username to see the languages of the repositories they starred, when they starred them, and which are no longer maintained. No sign-in needed.",
  username: "GitHub username",
  view: "View",
  invalidUsername: "GitHub usernames have only letters, digits and hyphens",
  tryThese: "Try these",
  recent: "Recently viewed",
  forget: (login) => `Remove ${login} from recently viewed`,
  stars: (n) => plural(n, "star", "stars"),
  back: "Back",
  refresh: "Refresh",
  refreshed: "Up to date",
  fetchedAgo: (ago) => `fetched ${ago}`,
  loading: (login) => `Reading ${login}'s stars`,
  loadingSlow: "Accounts with many stars take a few seconds",
  notFound: (login) => `There is no GitHub user called ${login}`,
  rateLimited: (s) => `Too many lookups — try again in ${s} s`,
  githubBusy: (m) => `GitHub's rate limit is used up for now; back in about ${m} min`,
  failed: "Could not load, try again shortly",
  offline: "Cannot reach the server; check your connection",
  retry: "Retry",
  otherUser: "Look up someone else",
  noStars: (login) => `${login} hasn't starred anything yet`,
  truncated: (total, kept) => `${total.toLocaleString("en")} stars in all; this covers the latest ${kept.toLocaleString("en")}.`,
  health: { active: "Active", stale: "Quiet 1y+", abandoned: "Quiet 2y+", archived: "Archived" },
  healthHint: {
    active: "Commits in the last year",
    stale: "Last commit 1–2 years ago",
    abandoned: "No commits for 2+ years",
    archived: "No longer maintained",
  },
  languages: "Languages",
  otherLanguages: "Other",
  showLanguage: (lang) => `Show only ${lang} repositories`,
  timeline: "Star timeline",
  timelineLabel: "Repositories starred each month",
  peak: (month, n) => `Busiest month: ${month}, ${n}`,
  last30: (n) => `${n} in the last 30 days`,
  prompts: "AI prompts",
  promptsLead: "Copy one and paste it into any AI assistant",
  promptProfile: "Developer profile",
  promptProfileHint: "Infers the stack and interests from languages, topics and recent stars",
  promptLists: "Organize into GitHub Lists",
  promptListsHint: (n) => `Groups the latest ${n} repositories and picks ones to unstar`,
  preview: "Preview",
  hide: "Hide",
  copy: "Copy",
  copied: "Copied",
  copyFailed: "Copy failed; check the browser's clipboard permission",
  repos: "Repositories",
  searchRepos: "Search names, descriptions or topics",
  all: "All",
  sort: { starred: "Recently starred", pushed: "Recently pushed", stars: "Most stars", name: "Name" },
  allLanguages: "All languages",
  moreLanguages: (n) => `${n} more`,
  showMore: (n) => `Show ${n} more`,
  noMatch: "No repositories match",
  clearFilters: "Clear filters",
  exportJSON: "Export JSON",
  exportCSV: "Export CSV",
  exportHint: "Exports the repositories in the list below",
  pushedAgo: (ago) => `pushed ${ago}`,
  starredOn: (date) => `starred ${date}`,
  source: "Source",
  dataFrom: "Data from GitHub's public API",
  switchTo: "中文",
};

const DICTS: Record<Lang, Dict> = { zh, en };
const KEY = "astrolabe:lang";

function initialLang(): Lang {
  try {
    const saved = localStorage.getItem(KEY);
    if (saved === "zh" || saved === "en") return saved;
  } catch {
    // fall through to the browser's language
  }
  return navigator.language.toLowerCase().startsWith("zh") ? "zh" : "en";
}

interface Ctx {
  lang: Lang;
  t: Dict;
  toggle: () => void;
  /** "3 天前" / "3 days ago" */
  ago: (iso: string) => string;
}

const LangContext = createContext<Ctx | null>(null);

const UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ["year", 365 * 86400],
  ["month", 30 * 86400],
  ["day", 86400],
  ["hour", 3600],
  ["minute", 60],
];

export function relativeTime(iso: string, lang: Lang, now = Date.now()): string {
  const secs = (new Date(iso).getTime() - now) / 1000;
  const fmt = new Intl.RelativeTimeFormat(DICTS[lang].htmlLang, { numeric: "auto" });
  for (const [unit, size] of UNITS) {
    if (Math.abs(secs) >= size) return fmt.format(Math.round(secs / size), unit);
  }
  return lang === "zh" ? "刚刚" : "just now";
}

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>(initialLang);
  const toggle = useCallback(() => {
    setLang((l) => {
      const next = l === "zh" ? "en" : "zh";
      try {
        localStorage.setItem(KEY, next);
      } catch {
        // not remembered
      }
      return next;
    });
  }, []);
  useEffect(() => {
    document.documentElement.lang = DICTS[lang].htmlLang;
    document.title = DICTS[lang].title;
  }, [lang]);
  const value = useMemo<Ctx>(
    () => ({ lang, t: DICTS[lang], toggle, ago: (iso) => relativeTime(iso, lang) }),
    [lang, toggle],
  );
  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export function useLang(): Ctx {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error("useLang outside LangProvider");
  return ctx;
}
