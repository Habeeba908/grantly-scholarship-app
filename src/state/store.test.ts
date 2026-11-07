import { reducer, initialState } from "./store";

describe("reducer", () => {
  it("saves and removes a scholarship", () => {
    const saved = reducer(initialState, { type: "toggleSave", id: "s01" });
    expect(saved.tracked.s01.status).toBe("saved");
    expect(reducer(saved, { type: "toggleSave", id: "s01" }).tracked.s01).toBeUndefined();
  });
  it("sanitises notes", () => {
    let s = reducer(initialState, { type: "toggleSave", id: "s01" });
    s = reducer(s, { type: "notes", id: "s01", notes: "<img src=x onerror=1>ask Sam" });
    expect(s.tracked.s01.notes).toBe("ask Sam");
  });
  it("ignores updates for untracked items", () => {
    expect(reducer(initialState, { type: "status", id: "zzz", status: "applying" })).toBe(initialState);
  });
});

import { parseState } from "./store";
describe("parseState", () => {
  it("rejects non-objects", () => { expect(parseState(null)).toBeNull(); expect(parseState([])).toBeNull(); });
  it("clamps and cleans untrusted data", () => {
    const s = parseState({ goal: 9e9, tracked: { s01: { status: "awarded", notes: "<i>x</i>", done: [] }, s02: { status: "hacked" } } })!;
    expect(s.goal).toBe(500000);
    expect(s.tracked.s01.notes).toBe("x");
    expect(s.tracked.s02).toBeUndefined();
  });
});
