import { computeMatch, tone } from "./match";
import { SCHOLARSHIPS } from "../data/scholarships";
import type { Profile } from "../types";

const profile: Profile = { level: "Undergraduate", field: "Computer Science", gpa: 3.5, region: "Asia" };

describe("computeMatch", () => {
  it("scores a full fit at 100", () => {
    expect(computeMatch(SCHOLARSHIPS.find((s) => s.id === "s01")!, profile).score).toBe(100);
  });
  it("drops points when GPA is too low", () => {
    expect(computeMatch(SCHOLARSHIPS.find((s) => s.id === "s01")!, { ...profile, gpa: 3.0 }).score).toBe(80);
  });
  it("excludes wrong level and region", () => {
    expect(computeMatch(SCHOLARSHIPS.find((s) => s.id === "s05")!, profile).score).toBeLessThan(50);
  });
  it("maps scores to tones", () => {
    expect([tone(90), tone(60), tone(20)]).toEqual(["strong", "fair", "low"]);
  });
});
