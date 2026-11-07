import { parseFilters, serializeFilters } from "./urlState";

describe("url filters", () => {
  it("round-trips valid filters", () => {
    const f = { q: "stem", cat: "STEM" as const, sort: "deadline" as const, strong: true };
    expect(parseFilters(serializeFilters(f))).toEqual(f);
  });
  it("rejects invalid values", () => {
    expect(parseFilters("?cat=<x>&sort=hack&q=<b>hi</b>")).toEqual({ q: "hi", cat: "All", sort: "match", strong: false });
  });
});
