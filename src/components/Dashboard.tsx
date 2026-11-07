import { useMemo, useRef } from "react";
import { SCHOLARSHIPS } from "../data/scholarships";
import type { Status } from "../types";
import { parseState, useAppDispatch, useAppState } from "../state/store";
import { computeMatch } from "../lib/match";
import { daysUntil, deadlineLabel, formatMoney } from "../lib/dates";
import { buildICS, downloadFile } from "../lib/ics";

interface Props { onOpen: (id: string) => void; onToast: (msg: string) => void }

export function Dashboard({ onOpen, onToast }: Props) {
  const state = useAppState();
  const { tracked, goal, profile } = state;
  const dispatch = useAppDispatch();
  const fileRef = useRef<HTMLInputElement>(null);

  const d = useMemo(() => {
    const rows = SCHOLARSHIPS.filter((s) => tracked[s.id]);
    const sum = (st: Status[]) => rows.filter((s) => st.includes(tracked[s.id].status)).reduce((a, s) => a + s.amount, 0);
    const active = rows.filter((s) => tracked[s.id].status !== "awarded");
    const docsTotal = active.reduce((a, s) => a + s.documents.length, 0);
    const docsDone = active.reduce((a, s) => a + tracked[s.id].done.length, 0);
    const upcoming = rows.filter((s) => tracked[s.id].status !== "awarded" && daysUntil(s.deadline) >= 0)
      .sort((a, b) => a.deadline.localeCompare(b.deadline)).slice(0, 3);
    const radar = SCHOLARSHIPS.filter((s) => !tracked[s.id] && daysUntil(s.deadline) >= 0 && daysUntil(s.deadline) <= 30 && computeMatch(s, profile).score >= 80)
      .sort((a, b) => a.deadline.localeCompare(b.deadline)).slice(0, 3);
    return { rows, awarded: sum(["awarded"]), pipeline: sum(["applying", "submitted"]), saved: sum(["saved"]), readiness: docsTotal ? Math.round((docsDone / docsTotal) * 100) : 0, upcoming, radar };
  }, [tracked, profile]);

  const pct = (n: number) => (goal > 0 ? Math.min(100, (n / goal) * 100) : 0);

  const exportCalendar = () => {
    const open = d.rows.filter((s) => daysUntil(s.deadline) >= 0);
    if (!open.length) return onToast("Save a scholarship with an open deadline first.");
    downloadFile("grantly-deadlines.ics", buildICS(open), "text/calendar");
    onToast(`Calendar file ready with ${open.length} deadline${open.length === 1 ? "" : "s"}.`);
  };
  const exportData = () => { downloadFile("grantly-backup.json", JSON.stringify(state, null, 2), "application/json"); onToast("Backup downloaded."); };
  const importData = async (file?: File) => {
    if (!file) return;
    if (file.size > 200_000) return onToast("That file is too large to be a Grantly backup.");
    try {
      const parsed = parseState(JSON.parse(await file.text()));
      if (!parsed) throw new Error("bad");
      dispatch({ type: "import", state: parsed });
      onToast("Backup restored.");
    } catch { onToast("That file isn't a valid Grantly backup."); }
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <div className="dash">
      <h2>Your funding plan</h2>

      <section className="panel" aria-labelledby="goal-h">
        <h3 id="goal-h">Funding goal</h3>
        <label className="field goal-field">
          <span>How much do you need to raise (USD)?</span>
          <input type="number" inputMode="numeric" min={0} max={500000} step={500} value={goal}
            onChange={(e) => dispatch({ type: "goal", goal: Number(e.target.value) })} />
        </label>
        <div className="bar" role="img" aria-label={`${formatMoney(d.awarded)} awarded and ${formatMoney(d.pipeline)} in progress toward a ${formatMoney(goal)} goal`}>
          <span className="bar-awarded" style={{ width: `${pct(d.awarded)}%` }} />
          <span className="bar-pipe" style={{ width: `${Math.min(100 - pct(d.awarded), pct(d.pipeline))}%` }} />
        </div>
        <ul className="legend">
          <li><i className="dot dot-awarded" />Awarded {formatMoney(d.awarded)}</li>
          <li><i className="dot dot-pipe" />Applying or submitted {formatMoney(d.pipeline)}</li>
          <li><i className="dot dot-saved" />Saved {formatMoney(d.saved)}</li>
        </ul>
      </section>

      <div className="stats">
        <div className="panel"><p className="stat">{d.rows.length}</p><p className="muted small">scholarships tracked</p></div>
        <div className="panel"><p className="stat">{d.readiness}%</p><p className="muted small">documents ready</p></div>
        <div className="panel"><p className="stat">{formatMoney(d.awarded + d.pipeline + d.saved)}</p><p className="muted small">total in reach</p></div>
      </div>

      <div className="two-col">
        <section className="panel" aria-labelledby="up-h">
          <h3 id="up-h">Next deadlines</h3>
          {d.upcoming.length === 0 ? <p className="muted">Nothing due. Save scholarships to see them here.</p> : (
            <ul className="plain-list">
              {d.upcoming.map((s) => (
                <li key={s.id}><button className="link-btn" onClick={() => onOpen(s.id)}>{s.name}</button>
                  <span className={daysUntil(s.deadline) <= 14 ? "deadline-urgent small" : "muted small"}>{deadlineLabel(s.deadline)}</span></li>
              ))}
            </ul>
          )}
        </section>
        <section className="panel" aria-labelledby="rad-h">
          <h3 id="rad-h">Closing soon and a strong match</h3>
          {d.radar.length === 0 ? <p className="muted">No untracked strong matches close within 30 days.</p> : (
            <ul className="plain-list">
              {d.radar.map((s) => (
                <li key={s.id}><button className="link-btn" onClick={() => onOpen(s.id)}>{s.name}</button>
                  <span className="deadline-urgent small">{deadlineLabel(s.deadline)}</span></li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <section className="panel" aria-labelledby="tools-h">
        <h3 id="tools-h">Reminders and backup</h3>
        <div className="btn-row">
          <button className="btn" onClick={exportCalendar}>Add deadlines to calendar</button>
          <button className="btn btn-quiet" onClick={exportData}>Download backup</button>
          <label className="btn btn-quiet file-btn">
            Restore backup
            <input ref={fileRef} type="file" accept="application/json" className="sr-only" onChange={(e) => importData(e.target.files?.[0])} />
          </label>
        </div>
        <p className="muted small">The calendar file adds a reminder 7 days and 1 day before each deadline. Your data stays on this device.</p>
      </section>
    </div>
  );
}
