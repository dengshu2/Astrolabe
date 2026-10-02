import { describe, expect, it } from "vitest";
import { toCSV, toJSON } from "./export";
import { makeRepo } from "./test/fixtures";

describe("export", () => {
  it("writes CSV that spreadsheets read safely", () => {
    const csv = toCSV([makeRepo({ full_name: "o/a", description: 'Says "hi", twice\nreally', topics: ["x", "y"] }), makeRepo({ full_name: "o/b", description: "=HYPERLINK(1)" })]);
    expect(csv.startsWith("﻿Name,URL,")).toBe(true);
    const lines = csv.slice(1).split("\r\n");
    expect(lines).toHaveLength(3);
    expect(lines[1]).toContain('"Says ""hi"", twice\nreally"');
    expect(lines[1]).toContain('"x, y"');
    expect(lines[2]).toContain("'=HYPERLINK(1)");
  });

  it("writes JSON with the useful fields", () => {
    const [row] = JSON.parse(toJSON([makeRepo({ full_name: "o/a", stargazers_count: 7 })]));
    expect(row).toMatchObject({ name: "o/a", stars: 7, url: "https://github.com/owner/repo" });
    expect(row).not.toHaveProperty("owner");
  });
});
