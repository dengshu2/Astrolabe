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
        subtitle: string;
    };
    landing: {
        heroBadge: string;
        heroTitle: string;
        heroTitleHighlight: string;
        heroTitleEnd: string;
        heroDescription: string;
        inputPlaceholder: string;
        exploreButton: string;
        hint: string;
        suggestedUsers: string;
        featureHeading: string;
        featureHeadingHighlight: string;
        featureSubheading: string;
        features: {
            visualInsights: { title: string; description: string };
            zeroFriction: { title: string; description: string };
            dataExport: { title: string; description: string };
            aiPrompts: { title: string; description: string };
        };
        ctaHeading: string;
        ctaDescription: string;
        ctaButton: string;
        ctaGithub: string;
    };
    dashboard: {
        loadingStars: string;
        failedToLoad: string;
        noStars: string;
        userStars: string;
        userNotFound: string;
        rateLimited: string;
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
    progress: {
        loadingRepos: string;
    };
    footer: {
        copyright: string;
    };
    filters: {
        filterBy: string;
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
        subtitle: "Stars Explorer",
    },

    // Landing Page
    landing: {
        heroBadge: "Astrolabe 1.0 is here",
        heroTitle: "Explore your",
        heroTitleHighlight: "starred",
        heroTitleEnd: "universe",
        heroDescription:
            "Visualize any GitHub user's stars. Find stale repos, discover patterns, and clean up what you no longer need.",
        inputPlaceholder: "Enter a GitHub username...",
        exploreButton: "Explore",
        hint: "Try it with any public GitHub username — no sign-in needed",
        suggestedUsers: "Try exploring",
        featureHeading: "Everything you need to",
        featureHeadingHighlight: "understand your stars",
        featureSubheading: "Powerful features to help you grow your open source presence and understand your audience.",
        features: {
            visualInsights: {
                title: "Visual Insights",
                description: "See stars by language, timeline, and health at a glance.",
            },
            zeroFriction: {
                title: "Zero Friction",
                description: "Enter any GitHub username. No login, no setup, instant results.",
            },
            dataExport: {
                title: "Data Export",
                description: "Export your starred repositories to JSON or CSV for backup or further analysis.",
            },
            aiPrompts: {
                title: "AI-Powered Prompts",
                description: "Generate prompts for GitHub Lists categorization and user persona analysis.",
            },
        },
        ctaHeading: "Ready to dive into your analytics?",
        ctaDescription: "Join thousands of developers who are tracking their open source impact with Astrolabe. No credit card required, completely open source.",
        ctaButton: "Get Started Now",
        ctaGithub: "Star on GitHub",
    },

    // Dashboard
    dashboard: {
        loadingStars: "Loading stars for",
        failedToLoad: "Failed to load stars",
        noStars: "hasn't starred any repos yet",
        userStars: "'s Stars",
        userNotFound: "doesn't seem to exist on GitHub",
        rateLimited: "GitHub API rate limit reached. Please wait a moment and try again",
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

    // Progress
    progress: {
        loadingRepos: "Loading starred repos...",
    },

    // Footer
    footer: {
        copyright: "© 2026 Astrolabe. Built with ❤️ for the open source community.",
    },

    // Filters
    filters: {
        filterBy: "Filter by",
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
