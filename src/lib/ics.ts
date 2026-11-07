import type { Scholarship } from "../types";

const esc = (t: string) => t.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
const compact = (iso: string) => iso.replace(/-/g, "");
function nextDay(iso: string) {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().slice(0, 10).replace(/-/g, "");
}

/** Builds an .ics calendar with a 7-day and 1-day reminder for every deadline. */
export function buildICS(items: Pick<Scholarship, "id" | "name" | "provider" | "deadline">[], now = new Date()): string {
  const stamp = now.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const lines = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Grantly//Deadlines//EN", "CALSCALE:GREGORIAN"];
  for (const s of items) {
    lines.push(
      "BEGIN:VEVENT",
      `UID:${s.id}@grantly.app`,
      `DTSTAMP:${stamp}`,
      `DTSTART;VALUE=DATE:${compact(s.deadline)}`,
      `DTEND;VALUE=DATE:${nextDay(s.deadline)}`,
      `SUMMARY:${esc(`Deadline: ${s.name}`)}`,
      `DESCRIPTION:${esc(`${s.provider}. Submit before the end of the day.`)}`,
      "BEGIN:VALARM", "ACTION:DISPLAY", "DESCRIPTION:Due in 7 days", "TRIGGER:-P7D", "END:VALARM",
      "BEGIN:VALARM", "ACTION:DISPLAY", "DESCRIPTION:Due tomorrow", "TRIGGER:-P1D", "END:VALARM",
      "END:VEVENT"
    );
  }
  lines.push("END:VCALENDAR");
  return lines.join("\r\n");
}

export function downloadFile(name: string, text: string, type: string) {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const a = document.createElement("a");
  a.href = url; a.download = name;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
