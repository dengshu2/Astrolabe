import type { StarredRepo, LanguageStat } from "@/types/github";

export interface UserProfilePromptData {
    username: string;
    totalStars: number;
    recentRepos: StarredRepo[];
    languageStats: LanguageStat[];
    healthSummary: {
        active: number;
        stale: number;
        archived: number;
        abandoned: number;
    };
}

export interface ListCategoryPromptData {
    username: string;
    recentRepos: StarredRepo[];
}

/**
 * Get top topics from repos
 */
function getTopTopics(repos: StarredRepo[], limit = 15): string[] {
    const topicCount = new Map<string, number>();
    for (const repo of repos) {
        for (const topic of repo.topics) {
            topicCount.set(topic, (topicCount.get(topic) ?? 0) + 1);
        }
    }
    return Array.from(topicCount.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, limit)
        .map(([topic]) => topic);
}

/**
 * Format repos for prompt (compact format)
 */
function formatReposCompact(repos: StarredRepo[]): string {
    return repos
        .map((r) => {
            const lang = r.language ?? "Unknown";
            const topics = r.topics.slice(0, 3).join(", ");
            const desc = r.description
                ? r.description.slice(0, 80) + (r.description.length > 80 ? "..." : "")
                : "No description";
            return `- ${r.full_name} [${lang}] ⭐${r.stargazers_count}\n  ${desc}${topics ? `\n  Topics: ${topics}` : ""}`;
        })
        .join("\n");
}

/**
 * Generate user profile analysis prompt (Chinese)
 */
export function generateUserProfilePrompt(data: UserProfilePromptData): string {
    const { username, totalStars, recentRepos, languageStats, healthSummary } = data;

    // Top languages
    const topLanguages = languageStats
        .slice(0, 8)
        .map((l) => `${l.language} (${l.percentage}%)`)
        .join(", ");

    // Top topics from recent repos
    const topTopics = getTopTopics(recentRepos, 10);

    // Health distribution
    const total = healthSummary.active + healthSummary.stale + healthSummary.archived + healthSummary.abandoned;
    const activePercent = total > 0 ? Math.round((healthSummary.active / total) * 100) : 0;

    // Recent repos formatted
    const recentReposFormatted = formatReposCompact(recentRepos.slice(0, 30));

    return `请根据以下 GitHub 用户 **${username}** 的 Stars 数据，分析其技术画像：

## 基础数据
- **总 Star 数**: ${totalStars} 个仓库
- **分析样本**: 最近关注的 ${recentRepos.length} 个仓库

## 语言分布
${topLanguages}

## 热门关注领域 (基于 Topics)
${topTopics.length > 0 ? topTopics.join(", ") : "无明显标签"}

## 项目健康度偏好
- 活跃项目占比: ${activePercent}%
- 活跃: ${healthSummary.active} | 过时: ${healthSummary.stale} | 废弃: ${healthSummary.abandoned} | 已归档: ${healthSummary.archived}

## 最近关注的仓库 (前30个)
${recentReposFormatted}

---

请基于以上数据，生成该用户的技术画像，包括：

1. **技术栈推测**: 该用户可能使用什么技术栈？是前端/后端/全栈/DevOps/数据科学？
2. **兴趣领域分析**: 该用户关注哪些技术领域？有什么明显的兴趣模式？
3. **技术成熟度判断**: 从关注的项目类型推测其经验水平（初学者/中级/资深）
4. **可能的职业方向**: 基于技术偏好推测可能的职业角色
5. **学习路径建议**: 基于当前兴趣，推荐可能感兴趣的新技术或项目`;
}

/**
 * Generate GitHub List category prompt (Chinese)
 */
export function generateListCategoryPrompt(data: ListCategoryPromptData): string {
    const { username, recentRepos } = data;

    // Group repos by language for quick overview
    const langGroups = new Map<string, number>();
    for (const repo of recentRepos) {
        const lang = repo.language ?? "Other";
        langGroups.set(lang, (langGroups.get(lang) ?? 0) + 1);
    }
    const langOverview = Array.from(langGroups.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([lang, count]) => `${lang}: ${count}`)
        .join(", ");

    // Format all repos
    const reposFormatted = formatReposCompact(recentRepos);

    return `请帮助 GitHub 用户 **${username}** 整理 Stars 列表，生成 GitHub Lists 分类方案。

## 概览
- **仓库总数**: ${recentRepos.length} 个
- **语言分布**: ${langOverview}

## 仓库列表
${reposFormatted}

---

请基于以上仓库列表，生成合理的 **GitHub Lists 分类方案**，要求：

1. **分类数量**: 建议 5-10 个分类，每个分类不超过 30 个仓库
2. **分类命名**: 简洁易懂，例如 "前端框架"、"AI/ML工具"、"CLI实用工具"
3. **分类逻辑**:
   - 可按技术领域分（前端/后端/DevOps）
   - 可按用途分（学习资料/实用工具/参考项目）
   - 可按语言分（如仓库语言高度集中）
4. **清理建议**: 标识出可能可以 "取消 Star" 的仓库（如已废弃、功能重复、不再相关）

## 输出格式

### 📁 [分类名称1]
- repo1/name - 简短说明
- repo2/name - 简短说明
...

### 📁 [分类名称2]
...

### 🗑️ 建议清理
- repo/name - 清理原因`;
}
