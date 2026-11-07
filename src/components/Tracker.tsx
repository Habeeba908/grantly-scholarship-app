import { useMemo } from "react";
import { SCHOLARSHIPS } from "../data/scholarships";
import { STATUSES, type Status } from "../types";
import { useAppDispatch, useAppState } from "../state/store";
import { daysUntil, formatMoney } from "../lib/dates";

const HORIZON = 200; // days shown on the runway

export function Tracker({ onOpen }: { onOpen: (id: string) => void }) {
  const { tracked } = useAppState();
  const dispatch = useAppDispatch();
  const now = Date.now();

  const items = useMemo(
    () => SCHOLARSHIPS.filter((s) => tracked[s.id]).sort((a, b) => a.deadline.localeCompare(b.deadline)),
    [tracked]
  );
  const total = items.reduce((sum, s) => sum + s.amount, 0);

  if (!items.length) {
    return (
      <section className="empty" aria-live="polite">
        <h2>Nothing tracked yet</h2>
        <p>Save a scholarship from Discover and it appears here with its deadline and document checklist.</p>
      </section>
    );
  }

  return (
    <section aria-labelledby="runway-h">
      <h2 id="runway-h">Deadline runway</h2>
      <p className="muted">{items.length} saved &middot; {formatMoney(total)} in reach</p>
      <ol className="runway">
        {items.map((s) => {
          const d = daysUntil(s.deadline, now);
          const pos = Math.min(100, Math.max(0, (d / HORIZON) * 100));
          const cls = d < 0 ? "closed" : d <= 14 ? "urgent" : "open";
          return (
            <li key={s.id} className="runway-row">
              <button className="link-btn" onClick={() => onOpen(s.id)}>{s.name}</button>
              <div className="track" role="img" aria-label={d < 0 ? "Closed" : `${d} days until deadline`}>
                <span className={`pin pin-${cls}`} style={{ left: `${pos}%` }} />
              </div>
              <span className="muted small">{d < 0 ? "Closed" : `${d}d`}</span>
            </li>
          );
        })}
      </ol>

      <div className="columns">
        {STATUSES.map((st) => {
          const col = items.filter((s) => tracked[s.id].status === st);
          return (
            <section key={st} className="column" aria-labelledby={`col-${st}`}>
              <h3 id={`col-${st}`}>{st[0].toUpperCase() + st.slice(1)} <span className="count">{col.length}</span></h3>
              {col.length === 0 && <p className="muted small">None</p>}
              {col.map((s) => (
                <div key={s.id} className="mini">
                  <button className="link-btn" onClick={() => onOpen(s.id)}>{s.name}</button>
                  <label className="mini-select">
                    <span className="sr-only">Move {s.name} to</span>
                    <select value={tracked[s.id].status} onChange={(e) => dispatch({ type: "status", id: s.id, status: e.target.value as Status })}>
                      {STATUSES.map((x) => <option key={x} value={x}>{x}</option>)}
                    </select>
                  </label>
                  <span className="muted small">{tracked[s.id].done.length}/{s.documents.length} documents</span>
                </div>
              ))}
            </section>
          );
        })}
      </div>
    </section>
  );
}
