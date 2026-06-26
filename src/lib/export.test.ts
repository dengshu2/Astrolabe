import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { exportToCSV, exportToJSON } from "./export";
import { makeRepo } from "@/test/fixtures";

/**
 * The export helpers trigger a browser download. We stub the side effects
 * (object URL + anchor click) and capture the Blob to assert on its content.
 */
let captured: Blob[] = [];

beforeEach(() => {
  captured = [];
  vi.stubGlobal("URL", {
    ...URL,
    createObjectURL: (blob: Blob) => {
      captured.push(blob);
      return "blob:mock";
    },
    revokeObjectURL: () => {},
  });
  vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

async function lastBlobText(): Promise<string> {
  expect(captured).toHaveLength(1);
  return captured[0].text();
}

describe("exportToCSV", () => {
  it("writes a header row and one row per repo", async () => {
    exportToCSV([
      makeRepo({ full_name: "owner/one", language: "Go", stargazers_count: 5 }),
      makeRepo({ full_name: "owner/two", language: "Rust", stargazers_count: 9 }),
    ]);
    const lines = (await lastBlobText()).split("\n");
    expect(lines[0]).toContain("Name");
    expect(lines).toHaveLength(3);
    expect(lines[1]).toContain("owner/one");
    expect(lines[2]).toContain("owner/two");
  });

  it("escapes commas, quotes and newlines per RFC 4180", async () => {
    exportToCSV([
      makeRepo({ description: 'has, comma and "quote"\nand newline' }),
    ]);
    const text = await lastBlobText();
    // Field is wrapped in quotes and inner quotes are doubled.
    expect(text).toContain('"has, comma and ""quote""');
  });

  it("renders missing language/description without crashing", async () => {
    exportToCSV([makeRepo({ language: null, description: null })]);
    const text = await lastBlobText();
    expect(text).toBeTruthy();
  });
});

describe("exportToJSON", () => {
  it("emits the projected fields as valid JSON", async () => {
    exportToJSON([
      makeRepo({ full_name: "owner/repo", stargazers_count: 42, archived: true }),
    ]);
    const parsed = JSON.parse(await lastBlobText());
    expect(parsed).toHaveLength(1);
    expect(parsed[0]).toMatchObject({
      name: "owner/repo",
      stars: 42,
      archived: true,
    });
  });
});
