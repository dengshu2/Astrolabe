import type { StarredRepo } from "@/types/github";

/**
 * Export repos to JSON format
 */
export function exportToJSON(repos: StarredRepo[], filename: string = "stars"): void {
    const data = repos.map((repo) => ({
        name: repo.full_name,
        url: repo.html_url,
        description: repo.description,
        language: repo.language,
        stars: repo.stargazers_count,
        forks: repo.forks_count,
        topics: repo.topics,
        archived: repo.archived,
        starred_at: repo.starred_at,
        pushed_at: repo.pushed_at,
        created_at: repo.created_at,
    }));

    const json = JSON.stringify(data, null, 2);
    downloadFile(json, `${filename}.json`, "application/json");
}

/**
 * Export repos to CSV format
 */
export function exportToCSV(repos: StarredRepo[], filename: string = "stars"): void {
    const headers = [
        "Name",
        "URL",
        "Description",
        "Language",
        "Stars",
        "Forks",
        "Topics",
        "Archived",
        "Starred At",
        "Last Pushed",
        "Created At",
    ];

    const rows = repos.map((repo) => [
        escapeCsvField(repo.full_name),
        repo.html_url,
        escapeCsvField(repo.description ?? ""),
        repo.language ?? "",
        repo.stargazers_count.toString(),
        repo.forks_count.toString(),
        escapeCsvField(repo.topics.join(", ")),
        repo.archived ? "Yes" : "No",
        formatDate(repo.starred_at),
        formatDate(repo.pushed_at),
        formatDate(repo.created_at),
    ]);

    const csv = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
    downloadFile(csv, `${filename}.csv`, "text/csv;charset=utf-8");
}

/**
 * Escape special characters for CSV
 */
function escapeCsvField(field: string): string {
    if (field.includes(",") || field.includes('"') || field.includes("\n")) {
        return `"${field.replace(/"/g, '""')}"`;
    }
    return field;
}

/**
 * Format date for export
 */
function formatDate(dateStr?: string): string {
    if (!dateStr) return "";
    return new Date(dateStr).toISOString().split("T")[0];
}

/**
 * Trigger file download
 */
function downloadFile(content: string, filename: string, mimeType: string): void {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}
