import { describe, expect, it } from "vitest";
import { listsPrompt, profilePrompt } from "./prompts";
import { languageStats } from "./stats";
import { makeRepo } from "./test/fixtures";

const repos = Array.from({ length: 400 }, (_, i) =>
  makeRepo({ full_name: `o/r${i}`, topics: i % 2 ? ["cli"] : ["web"], description: "x".repeat(120) }),
);
const input = { login: "ann", total: 512, recent: repos, languages: languageStats(repos), health: { active: 300, stale: 50, abandoned: 40, archived: 10 } };

describe("prompts", () => {
  it("writes the profile prompt in the page's language", () => {
    const zh = profilePrompt(input, "zh");
    const en = profilePrompt(input, "en");
    expect(zh).toContain("**ann**");
    expect(zh).toContain("Star 总数**：512");
    expect(zh).toContain("活跃项目占比：75%");
    expect(en).toContain("**Stars**: 512 repositories");
    expect(en).not.toMatch(/[一-鿿]/);
  });

  it("samples the newest repositories and trims descriptions", () => {
    const p = profilePrompt(input, "en");
    expect(p).toContain("o/r0");
    expect(p).not.toContain("o/r30 ");
    expect(p).toContain("x".repeat(80) + "…");
  });

  it("lists up to 300 repositories for GitHub Lists", () => {
    const p = listsPrompt("ann", repos, "zh");
    expect(p).toContain("仓库数**：300 个");
    expect(p).toContain("o/r299");
    expect(p).not.toContain("o/r300");
  });
});
