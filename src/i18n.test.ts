import { describe, expect, it } from "vitest";
import { relativeTime } from "./i18n";

const NOW = Date.parse("2026-10-02T12:00:00Z");

describe("relativeTime", () => {
  it("says hours for the same day (not 'just now')", () => {
    expect(relativeTime("2026-10-02T09:00:00Z", "en", NOW)).toBe("3 hours ago");
    expect(relativeTime("2026-10-02T09:00:00Z", "zh", NOW)).toBe("3小时前");
  });

  it("uses the largest unit that fits", () => {
    expect(relativeTime("2026-09-25T12:00:00Z", "en", NOW)).toBe("7 days ago");
    expect(relativeTime("2024-09-01T12:00:00Z", "en", NOW)).toBe("2 years ago");
    expect(relativeTime("2026-10-02T11:59:50Z", "en", NOW)).toBe("just now");
    expect(relativeTime("2026-10-02T11:59:50Z", "zh", NOW)).toBe("刚刚");
  });
});
