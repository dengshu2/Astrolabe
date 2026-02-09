export interface Translations {
    common: {
        loading: string;
        retry: string;
        refresh: string;
        save: string;
        cancel: string;
        show: string;
        hide: string;
        repos: string;
        total: string;
    };
    header: {
        searchPlaceholder: string;
        github: string;
        apiSettings: string;
    };
    landing: {
        heroTitle: string;
        heroTitleHighlight: string;
        heroTitleEnd: string;
        heroDescription: string;
        inputPlaceholder: string;
        exploreButton: string;
        hint: string;
        suggestedUsers: string;
        features: {
            visualInsights: { title: string; description: string };
            zeroFriction: { title: string; description: string };
        };
    };
    dashboard: {
        loadingStars: string;
        failedToLoad: string;
        noStars: string;
        userStars: string;
    };
    health: {
        active: string;
        stale: string;
        abandoned: string;
        archived: string;
    };
    charts: {
        languages: string;
        starTimeline: string;
        timelineDescription: string;
        stars: string;
    };
    repos: {
        title: string;
        searchPlaceholder: string;
        noMatch: string;
        tryAdjusting: string;
        openOnGithub: string;
        export: string;
        exportJSON: string;
        exportCSV: string;
    };
    filters: {
        all: string;
        active: string;
        stale: string;
        abandoned: string;
        archived: string;
        allLanguages: string;
        sortRecentlyStarred: string;
        sortRecentlyUpdated: string;
        sortMostStars: string;
        sortName: string;
    };
    token: {
        title: string;
        subtitle: string;
        configured: string;
        notConfigured: string;
        label: string;
        placeholder: string;
        securityNote: string;
        createToken: string;
        removeToken: string;
        close: string;
    };
    timeAgo: {
        justNow: string;
        minutesAgo: string;
        hoursAgo: string;
        daysAgo: string;
        monthsAgo: string;
        yearsAgo: string;
    };
    prompts: {
        title: string;
        subtitle: string;
        copy: string;
        copied: string;
        userProfile: {
            title: string;
            description: string;
        };
        listCategory: {
            title: string;
            description: string;
        };
    };
}

export const en: Translations = {
    // Common
    common: {
        loading: "Loading",
        retry: "Retry",
        refresh: "Refresh",
        save: "Save",
        cancel: "Cancel",
        show: "Show",
        hide: "Hide",
        repos: "repos",
        total: "total",
    },

    // Header
    header: {
        searchPlaceholder: "Search another user...",
        github: "GitHub",
        apiSettings: "API Settings",
    },

    // Landing Page
    landing: {
        heroTitle: "Explore your",
        heroTitleHighlight: "starred",
        heroTitleEnd: "universe",
        heroDescription:
            "Visualize any GitHub user's stars. Find stale repos, discover patterns, and clean up what you no longer need.",
        inputPlaceholder: "Enter a GitHub username...",
        exploreButton: "Explore",
        hint: "Try it with any public GitHub username — no sign-in needed",
        suggestedUsers: "Try exploring",
        features: {
            visualInsights: {
                title: "Visual Insights",
                description: "See stars by language, timeline, and health at a glance.",
            },
            zeroFriction: {
                title: "Zero Friction",
                description: "Enter any GitHub username. No login, no setup, instant results.",
            },
        },
    },

    // Dashboard
    dashboard: {
        loadingStars: "Loading stars for",
        failedToLoad: "Failed to load stars",
        noStars: "hasn't starred any repos yet",
        userStars: "'s Stars",
    },

    // Health Summary
    health: {
        active: "Active",
        stale: "Stale (1y+)",
        abandoned: "Abandoned (2y+)",
        archived: "Archived",
    },

    // Charts
    charts: {
        languages: "Languages",
        starTimeline: "Star Timeline",
        timelineDescription: "Monthly star count, showing cumulative star trend",
        stars: "Stars",
    },

    // Repo List
    repos: {
        title: "Repositories",
        searchPlaceholder: "Search repos...",
        noMatch: "No repos match your filters",
        tryAdjusting: "Try adjusting your search or filters",
        openOnGithub: "Open on GitHub",
        export: "Export",
        exportJSON: "Export JSON",
        exportCSV: "Export CSV",
    },

    // Filters
    filters: {
        all: "All",
        active: "Active",
        stale: "Stale",
        abandoned: "Abandoned",
        archived: "Archived",
        allLanguages: "All languages",
        sortRecentlyStarred: "Recently starred",
        sortRecentlyUpdated: "Recently updated",
        sortMostStars: "Most stars",
        sortName: "Name",
    },

    // Token Settings
    token: {
        title: "GitHub Token",
        subtitle: "Optional, used to increase API rate limit",
        configured: "Token configured (5,000 requests/hour)",
        notConfigured: "No token (60 requests/hour)",
        label: "Personal Access Token",
        placeholder: "ghp_xxxxxxxxxxxxxxxxxxxx",
        securityNote: "Token is stored locally in browser, never uploaded to any server.",
        createToken: "Create a new Token (no permissions required)",
        removeToken: "Remove Token",
        close: "Close",
    },

    // Time ago
    timeAgo: {
        justNow: "just now",
        minutesAgo: "m ago",
        hoursAgo: "h ago",
        daysAgo: "d ago",
        monthsAgo: "mo ago",
        yearsAgo: "y ago",
    },

    // Prompts
    prompts: {
        title: "AI Prompts",
        subtitle: "Copy and use with your favorite AI assistant",
        copy: "Copy",
        copied: "Copied!",
        userProfile: {
            title: "User Profile Analysis",
            description: "Analyze tech profile based on recent {count} repos",
        },
        listCategory: {
            title: "GitHub Lists Organizer",
            description: "Generate list categories for {count} repos",
        },
    },
};
