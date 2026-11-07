import { useEffect, useRef } from "react";
import type { Scholarship } from "../types";
import { STATUSES, type Status } from "../types";
import { useAppDispatch, useAppState } from "../state/store";
import { computeMatch } from "../lib/match";
import { formatDate, formatMoney, deadlineLabel } from "../lib/dates";

export function DetailDialog({ s, onClose }: { s: Scholarship | null; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const { profile, tracked } = useAppState();
  const dispatch = useAppDispatch();

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (s && !d.open) d.showModal();
    if (!s && d.open) d.close();
  }, [s]);

  const item = s ? tracked[s.id] : undefined;
  const match = s ? computeMatch(s, profile) : null;

  return (
    <dialog ref={ref} className="dialog" aria-labelledby="dlg-title" onClose={onClose}
      onClick={(e) => { if (e.target === ref.current) onClose(); }}>
      {s && match && (
        <div className="dialog-body">
          <header className="dialog-head">
            <div>
              <h2 id="dlg-title">{s.name}</h2>
              <p className="provider">{s.provider}</p>
            </div>
            <button className="icon-btn" onClick={onClose} aria-label="Close details">
              <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" stroke="currentColor" strokeWidth="2" fill="none"><path d="M5 5l14 14M19 5L5 19" /></svg>
            </button>
          </header>

          <dl className="facts">
            <div><dt>Award</dt><dd>{formatMoney(s.amount)}</dd></div>
            <div><dt>Deadline</dt><dd>{formatDate(s.deadline)} ({deadlineLabel(s.deadline)})</dd></div>
            <div><dt>Your match</dt><dd>{match.score}%</dd></div>
          </dl>

          <p>{s.summary}</p>

          <h3>Why it fits you</h3>
          <ul className="reasons">
            {match.reasons.map((r) => (
              <li key={r.label} className={r.ok ? "ok" : "no"}>
                <span aria-hidden="true">{r.ok ? "✓" : "✕"}</span>
                <span className="sr-only">{r.ok ? "Met: " : "Not met: "}</span>{r.label}
              </li>
            ))}
          </ul>

          <h3>Eligibility</h3>
          <ul className="plain">{s.eligibility.map((e) => <li key={e}>{e}</li>)}</ul>

          {item ? (
            <>
              <h3>Your application</h3>
              <label className="field">
                <span>Status</span>
                <select value={item.status} onChange={(e) => dispatch({ type: "status", id: s.id, status: e.target.value as Status })}>
                  {STATUSES.map((st) => <option key={st} value={st}>{st[0].toUpperCase() + st.slice(1)}</option>)}
                </select>
              </label>
              <fieldset className="checklist">
                <legend>Documents ({item.done.length}/{s.documents.length} ready)</legend>
                {s.documents.map((doc) => (
                  <label key={doc} className="check">
                    <input type="checkbox" checked={item.done.includes(doc)} onChange={() => dispatch({ type: "toggleDoc", id: s.id, doc })} />
                    {doc}
                  </label>
                ))}
              </fieldset>
              <label className="field">
                <span>Notes</span>
                <textarea rows={3} maxLength={600} value={item.notes} onChange={(e) => dispatch({ type: "notes", id: s.id, notes: e.target.value })} />
              </label>
              <button className="btn btn-quiet" onClick={() => dispatch({ type: "toggleSave", id: s.id })}>Remove from tracker</button>
            </>
          ) : (
            <button className="btn" onClick={() => dispatch({ type: "toggleSave", id: s.id })}>Save to tracker</button>
          )}
        </div>
      )}
    </dialog>
  );
}
