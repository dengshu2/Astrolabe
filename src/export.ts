/** Download the listed repositories as JSON or CSV. */

import type { Repo } from "./types";

function rows(repos: Repo[]) {
  return repos.map((r) => ({
    name: r.full_name,
    url: r.html_url,
    description: r.description,
    language: r.language,
    stars: r.stargazers_count,
    forks: r.forks_count,
    topics: r.topics,
    archived: r.archived,
    starred_at: r.starred_at,
    pushed_at: r.pushed_at,
    created_at: r.created_at,
  }));
}

export function toJSON(repos: Repo[]): string {
  return JSON.stringify(rows(repos), null, 2);
}

const HEADERS = ["Name", "URL", "Description", "Language", "Stars", "Forks", "Topics", "Archived", "Starred At", "Last Pushed", "Created At"];

function cell(v: unknown): string {
  const s = v == null ? "" : String(v);
  // Quote anything with a comma, quote or line break; a leading = + - @
  // is defused so spreadsheets do not run it as a formula.
  const safe = /^[=+\-@]/.test(s) ? `'${s}` : s;
  return /[",\r\n]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
}

export function toCSV(repos: Repo[]): string {
  const lines = rows(repos).map((r) =>
    [r.name, r.url, r.description, r.language, r.stars, r.forks, r.topics.join(", "), r.archived, r.starred_at, r.pushed_at, r.created_at]
      .map(cell)
      .join(","),
  );
  // The byte order mark makes Excel read the file as UTF-8.
  return "﻿" + [HEADERS.join(","), ...lines].join("\r\n");
}

export function download(text: string, filename: string, type: string): void {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
