/** Prompts the visitor copies into an AI assistant, in the page's language. */

import type { Lang } from "./i18n";
import type { HealthCounts, LanguageStat } from "./stats";
import type { Repo } from "./types";

export const PROFILE_SAMPLE = 100;
export const LISTS_SAMPLE = 300;

function topTopics(repos: Repo[], limit: number): string[] {
  const counts = new Map<string, number>();
  for (const r of repos) for (const t of r.topics) counts.set(t, (counts.get(t) ?? 0) + 1);
  return [...counts].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).slice(0, limit).map(([t]) => t);
}

function compact(repos: Repo[], lang: Lang): string {
  const none = lang === "zh" ? "无描述" : "No description";
  return repos
    .map((r) => {
      const desc = r.description ? (r.description.length > 80 ? r.description.slice(0, 80) + "…" : r.description) : none;
      const topics = r.topics.slice(0, 3).join(", ");
      return `- ${r.full_name} [${r.language ?? "?"}] ⭐${r.stargazers_count}\n  ${desc}${topics ? `\n  Topics: ${topics}` : ""}`;
    })
    .join("\n");
}

export interface ProfileInput {
  login: string;
  total: number;
  recent: Repo[]; // newest first
  languages: LanguageStat[];
  health: HealthCounts;
}

export function profilePrompt({ login, total, recent, languages, health }: ProfileInput, lang: Lang): string {
  const sample = recent.slice(0, PROFILE_SAMPLE);
  const other = lang === "zh" ? "其他" : "Other";
  const langs = languages.slice(0, 8).map((l) => `${l.language ?? other} (${Math.round(l.percent)}%)`).join(", ");
  const topics = topTopics(sample, 10);
  const counted = health.active + health.stale + health.abandoned + health.archived;
  const activePct = counted ? Math.round((health.active / counted) * 100) : 0;
  const list = compact(sample.slice(0, 30), lang);

  if (lang === "en") {
    return `Based on the GitHub stars of **${login}** below, describe this developer's technical profile.

## Overview
- **Stars**: ${total} repositories
- **Sample**: the ${sample.length} most recently starred

## Languages
${langs}

## Main topics
${topics.length ? topics.join(", ") : "No clear topics"}

## Project health
- Active: ${activePct}%
- Active: ${health.active} | Quiet 1y+: ${health.stale} | Quiet 2y+: ${health.abandoned} | Archived: ${health.archived}

## Latest 30 stars
${list}

---

From this data, describe:

1. **Likely stack**: frontend, backend, full-stack, DevOps, data?
2. **Interests**: which fields, and any clear patterns
3. **Experience**: what the kinds of projects suggest (beginner, intermediate, senior)
4. **Likely role**
5. **What to explore next**: technologies or projects they would probably like`;
  }

  return `请根据以下 GitHub 用户 **${login}** 的 Star 数据，分析其技术画像：

## 基础数据
- **Star 总数**：${total} 个仓库
- **分析样本**：最近 Star 的 ${sample.length} 个

## 语言分布
${langs}

## 主要关注领域（来自 Topics）
${topics.length ? topics.join(", ") : "没有明显的标签"}

## 项目健康度
- 活跃项目占比：${activePct}%
- 活跃 ${health.active} | 一年没更新 ${health.stale} | 两年没更新 ${health.abandoned} | 已归档 ${health.archived}

## 最近 Star 的 30 个仓库
${list}

---

请基于以上数据生成技术画像，包括：

1. **技术栈推测**：前端、后端、全栈、DevOps 还是数据方向？
2. **兴趣领域**：关注哪些技术领域，有什么明显的模式
3. **经验判断**：从关注的项目类型推测经验水平（初级、中级、资深）
4. **可能的职业角色**
5. **接下来可以看什么**：推荐可能感兴趣的新技术或项目`;
}

export function listsPrompt(login: string, recent: Repo[], lang: Lang): string {
  const sample = recent.slice(0, LISTS_SAMPLE);
  const counts = new Map<string, number>();
  for (const r of sample) counts.set(r.language ?? "?", (counts.get(r.language ?? "?") ?? 0) + 1);
  const overview = [...counts].sort((a, b) => b[1] - a[1]).slice(0, 10).map(([l, n]) => `${l}: ${n}`).join(", ");
  const list = compact(sample, lang);

  if (lang === "en") {
    return `Help GitHub user **${login}** organize their stars into GitHub Lists.

## Overview
- **Repositories**: ${sample.length}
- **Languages**: ${overview}

## Repositories
${list}

---

Propose a set of **GitHub Lists**:

1. **How many**: 5–10 lists, at most 30 repositories each
2. **Names**: short and clear, e.g. "Frontend frameworks", "AI/ML tools", "CLI utilities"
3. **Grouping**: by field (frontend, backend, DevOps), by purpose (learning, tools, reference) or by language if one dominates
4. **Clean-up**: point out repositories worth unstarring (abandoned, duplicated, no longer relevant)

## Output format

### 📁 [List name]
- owner/repo - one-line note
...

### 🗑️ Worth unstarring
- owner/repo - reason`;
  }

  return `请帮 GitHub 用户 **${login}** 整理 Star 列表，给出 GitHub Lists 分类方案。

## 概览
- **仓库数**：${sample.length} 个
- **语言分布**：${overview}

## 仓库列表
${list}

---

请基于以上仓库，给出合理的 **GitHub Lists 分类方案**：

1. **分类数量**：5 到 10 个，每个不超过 30 个仓库
2. **分类命名**：简洁易懂，例如"前端框架""AI/ML 工具""命令行工具"
3. **分类依据**：按技术领域（前端、后端、DevOps）、按用途（学习资料、实用工具、参考项目），或在语言高度集中时按语言
4. **清理建议**：指出可以取消 Star 的仓库（已废弃、功能重复、不再相关）

## 输出格式

### 📁 [分类名]
- owner/repo - 一句话说明
...

### 🗑️ 建议清理
- owner/repo - 清理原因`;
}
