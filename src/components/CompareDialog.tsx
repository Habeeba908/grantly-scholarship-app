import { useEffect, useRef, type ReactNode } from "react";
import type { Profile, Scholarship } from "../types";
import { computeMatch } from "../lib/match";
import { formatDate, formatMoney, daysUntil } from "../lib/dates";

interface Props { items: Scholarship[]; open: boolean; profile: Profile; onClose: () => void }

export function CompareDialog({ items, open, profile, onClose }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  const maxAmount = Math.max(0, ...items.map((s) => s.amount));
  const soonest = [...items].filter((s) => daysUntil(s.deadline) >= 0).sort((a, b) => a.deadline.localeCompare(b.deadline))[0]?.id;
  const bestMatch = Math.max(0, ...items.map((s) => computeMatch(s, profile).score));

  const rows: [string, (s: Scholarship) => ReactNode, (s: Scholarship) => boolean][] = [
    ["Award", (s) => formatMoney(s.amount), (s) => s.amount === maxAmount],
    ["Your match", (s) => `${computeMatch(s, profile).score}%`, (s) => computeMatch(s, profile).score === bestMatch],
    ["Deadline", (s) => formatDate(s.deadline), (s) => s.id === soonest],
    ["Minimum GPA", (s) => s.minGpa.toFixed(1), () => false],
    ["Levels", (s) => s.levels.join(", "), () => false],
    ["Fields", (s) => s.fields.join(", "), () => false],
    ["Regions", (s) => s.regions.join(", "), () => false],
    ["Documents needed", (s) => s.documents.length, () => false],
  ];

  return (
    <dialog ref={ref} className="dialog wide" aria-labelledby="cmp-title" onClose={onClose}
      onClick={(e) => { if (e.target === ref.current) onClose(); }}>
      <div className="dialog-body">
        <header className="dialog-head">
          <h2 id="cmp-title">Compare scholarships</h2>
          <button className="icon-btn" onClick={onClose} aria-label="Close comparison">×</button>
        </header>
        <p className="muted small">Highlighted cells are the best value in that row.</p>
        <div className="table-wrap">
          <table className="compare">
            <thead>
              <tr><td />{items.map((s) => <th key={s.id} scope="col">{s.name}</th>)}</tr>
            </thead>
            <tbody>
              {rows.map(([label, render, best]) => (
                <tr key={label}>
                  <th scope="row">{label}</th>
                  {items.map((s) => <td key={s.id} className={best(s) ? "best" : undefined}>{render(s)}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </dialog>
  );
}
