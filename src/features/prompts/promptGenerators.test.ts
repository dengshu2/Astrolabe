import { describe, expect, it } from "vitest";
import {
  generateListCategoryPrompt,
  generateUserProfilePrompt,
} from "./promptGenerators";
import { makeRepo } from "@/test/fixtures";

describe("generateUserProfilePrompt", () => {
  const data = {
    username: "octocat",
    totalStars: 250,
    recentRepos: [
      makeRepo({ full_name: "owner/a", topics: ["cli", "rust"] }),
      makeRepo({ full_name: "owner/b", topics: ["cli"] }),
    ],
    languageStats: [
      { language: "TypeScript", count: 10, percentage: 50, color: "#000" },
      { language: "Go", count: 10, percentage: 50, color: "#111" },
    ],
    healthSummary: { active: 3, stale: 1, archived: 0, abandoned: 0 },
  };

  it("embeds the username, totals and language distribution", () => {
    const prompt = generateUserProfilePrompt(data);
    expect(prompt).toContain("octocat");
    expect(prompt).toContain("250");
    expect(prompt).toContain("TypeScript (50%)");
  });

  it("computes the active percentage from the health summary", () => {
    const prompt = generateUserProfilePrompt(data);
    // active 3 of 4 total => 75%
    expect(prompt).toContain("活跃项目占比: 75%");
  });

  it("lists the most common topics", () => {
    const prompt = generateUserProfilePrompt(data);
    expect(prompt).toContain("cli");
  });
});

describe("generateListCategoryPrompt", () => {
  it("includes a language overview and every repo", () => {
    const prompt = generateListCategoryPrompt({
      username: "octocat",
      recentRepos: [
        makeRepo({ full_name: "owner/a", language: "Go" }),
        makeRepo({ full_name: "owner/b", language: "Go" }),
      ],
    });
    expect(prompt).toContain("Go: 2");
    expect(prompt).toContain("owner/a");
    expect(prompt).toContain("owner/b");
  });

  it("truncates long descriptions in the compact format", () => {
    const prompt = generateListCategoryPrompt({
      username: "octocat",
      recentRepos: [makeRepo({ description: "x".repeat(200) })],
    });
    expect(prompt).toContain("...");
  });
});
