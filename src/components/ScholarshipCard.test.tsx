import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ScholarshipCard } from "./ScholarshipCard";
import { SCHOLARSHIPS } from "../data/scholarships";

const profile = { level: "Undergraduate", field: "Computer Science", gpa: 3.5, region: "Asia" } as const;
const now = new Date("2026-11-07T10:00:00").getTime();

describe("ScholarshipCard", () => {
  it("announces match and supports keyboard save", async () => {
    const onToggleSave = vi.fn();
    render(<ScholarshipCard s={SCHOLARSHIPS[0]} profile={profile} saved={false} onToggleSave={onToggleSave} onOpen={() => {}} now={now} />);
    expect(screen.getByRole("img", { name: "100 percent match" })).toBeInTheDocument();
    const btn = screen.getByRole("button", { name: /save lumen/i });
    btn.focus();
    await userEvent.keyboard("{Enter}");
    expect(onToggleSave).toHaveBeenCalledWith("s01");
  });
  it("opens details from the title", async () => {
    const onOpen = vi.fn();
    render(<ScholarshipCard s={SCHOLARSHIPS[0]} profile={profile} saved onToggleSave={() => {}} onOpen={onOpen} now={now} />);
    await userEvent.click(screen.getByRole("button", { name: /lumen stem/i }));
    expect(onOpen).toHaveBeenCalledWith("s01");
  });
});
