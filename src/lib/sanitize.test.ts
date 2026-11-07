import { sanitize, sanitizeQuery } from "./sanitize";

describe("sanitize", () => {
  it("removes tags and control characters", () => {
    expect(sanitize("<script>alert(1)</script>Hi\u0007")).toBe("alert(1)Hi");
  });
  it("caps length", () => expect(sanitize("a".repeat(900), 100)).toHaveLength(100));
  it("normalises search queries", () => expect(sanitizeQuery("  STEM   <b>Grant</b> ")).toBe("stem grant"));
});
