import { beforeEach, describe, expect, it } from "vitest";
import { forgetUser, loadRecent, rememberUser } from "./recent";

describe("recent users", () => {
  beforeEach(() => localStorage.clear());

  it("keeps the newest first without duplicates", () => {
    rememberUser({ login: "ann", name: "Ann", total: 1 });
    rememberUser({ login: "bob", name: "", total: 2 });
    rememberUser({ login: "ANN", name: "Ann", total: 3 });
    expect(loadRecent().map((u) => [u.login, u.total])).toEqual([["ANN", 3], ["bob", 2]]);
  });

  it("keeps at most eight", () => {
    for (let i = 0; i < 12; i++) rememberUser({ login: `u${i}`, name: "", total: i });
    expect(loadRecent()).toHaveLength(8);
    expect(loadRecent()[0].login).toBe("u11");
  });

  it("forgets one and survives junk", () => {
    rememberUser({ login: "ann", name: "", total: 1 });
    expect(forgetUser("Ann")).toEqual([]);
    localStorage.setItem("astrolabe:recent", "{not json");
    expect(loadRecent()).toEqual([]);
  });
});
