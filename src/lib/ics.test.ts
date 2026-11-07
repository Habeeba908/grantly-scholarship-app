import { buildICS } from "./ics";

describe("buildICS", () => {
  const out = buildICS([{ id: "s01", name: "Lumen, STEM", provider: "Lumen", deadline: "2026-12-31" }], new Date("2026-11-07T10:00:00Z"));
  it("creates a valid calendar with reminders", () => {
    expect(out.startsWith("BEGIN:VCALENDAR")).toBe(true);
    expect(out).toContain("DTSTART;VALUE=DATE:20261231");
    expect(out).toContain("DTEND;VALUE=DATE:20270101");
    expect(out).toContain("TRIGGER:-P7D");
    expect(out).toContain("TRIGGER:-P1D");
  });
  it("escapes commas in text", () => expect(out).toContain("Lumen\\, STEM"));
});
