import type { Translations } from "./en";

export const zh: Translations = {
    // Common
    common: {
        loading: "加载中",
        retry: "重试",
        refresh: "刷新",
        save: "保存",
        cancel: "取消",
        show: "显示",
        hide: "隐藏",
        repos: "个仓库",
        total: "共计",
    },

    // Header
    header: {
        searchPlaceholder: "搜索其他用户...",
        github: "GitHub",
        apiSettings: "API 设置",
    },

    // Landing Page
    landing: {
        heroTitle: "探索你的",
        heroTitleHighlight: "星标",
        heroTitleEnd: "宇宙",
        heroDescription:
            "可视化任意 GitHub 用户的 Stars。发现过时仓库，探索规律，清理不再需要的内容。",
        inputPlaceholder: "输入 GitHub 用户名...",
        exploreButton: "探索",
        hint: "输入任意公开的 GitHub 用户名即可使用，无需登录",
        suggestedUsers: "试试探索",
        features: {
            visualInsights: {
                title: "可视化洞察",
                description: "一目了然地查看语言分布、时间线和项目健康状态。",
            },
            zeroFriction: {
                title: "零门槛",
                description: "输入任意 GitHub 用户名，无需登录，即刻获取结果。",
            },
        },
    },

    // Dashboard
    dashboard: {
        loadingStars: "正在加载",
        failedToLoad: "加载失败",
        noStars: "还没有收藏任何仓库",
        userStars: " 的收藏",
    },

    // Health Summary
    health: {
        active: "活跃",
        stale: "过时 (1年+)",
        abandoned: "废弃 (2年+)",
        archived: "已归档",
    },

    // Charts
    charts: {
        languages: "编程语言",
        starTimeline: "Star 时间线",
        timelineDescription: "按月统计 Star 数量，展示累计趋势",
        stars: "Stars",
    },

    // Repo List
    repos: {
        title: "仓库列表",
        searchPlaceholder: "搜索仓库...",
        noMatch: "没有匹配的仓库",
        tryAdjusting: "尝试调整搜索条件或筛选器",
        openOnGithub: "在 GitHub 打开",
        export: "导出",
        exportJSON: "导出 JSON",
        exportCSV: "导出 CSV",
    },

    // Filters
    filters: {
        filterBy: "筛选",
        all: "全部",
        active: "活跃",
        stale: "过时",
        abandoned: "废弃",
        archived: "已归档",
        allLanguages: "所有语言",
        sortRecentlyStarred: "最近收藏",
        sortRecentlyUpdated: "最近更新",
        sortMostStars: "最多 Stars",
        sortName: "按名称",
    },

    // Token Settings
    token: {
        title: "GitHub Token",
        subtitle: "可选配置，用于提高 API 限额",
        configured: "已配置 Token (5,000 次/小时)",
        notConfigured: "未配置 Token (60 次/小时)",
        label: "Personal Access Token",
        placeholder: "ghp_xxxxxxxxxxxxxxxxxxxx",
        securityNote: "Token 仅存储在浏览器本地，不会上传到任何服务器。",
        createToken: "创建新的 Token（无需任何权限）",
        removeToken: "移除 Token",
        close: "关闭",
    },

    // Time ago
    timeAgo: {
        justNow: "刚刚",
        minutesAgo: "分钟前",
        hoursAgo: "小时前",
        daysAgo: "天前",
        monthsAgo: "个月前",
        yearsAgo: "年前",
    },

    // Prompts
    prompts: {
        title: "AI 提示词",
        subtitle: "复制后配合 AI 助手使用",
        copy: "复制",
        copied: "已复制!",
        userProfile: {
            title: "用户画像分析",
            description: "基于最近 {count} 个仓库分析技术画像",
        },
        listCategory: {
            title: "GitHub Lists 整理",
            description: "为 {count} 个仓库生成分类方案",
        },
    },
};
