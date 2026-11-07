import { FIELDS, LEVELS, REGIONS, type Level } from "../types";
import { useAppDispatch, useAppState } from "../state/store";

export function ProfilePanel() {
  const { profile } = useAppState();
  const dispatch = useAppDispatch();
  return (
    <form className="profile" aria-label="Your profile" onSubmit={(e) => e.preventDefault()}>
      <label className="field">
        <span>Study level</span>
        <select value={profile.level} onChange={(e) => dispatch({ type: "profile", patch: { level: e.target.value as Level } })}>
          {LEVELS.map((l) => <option key={l}>{l}</option>)}
        </select>
      </label>
      <label className="field">
        <span>Field</span>
        <select value={profile.field} onChange={(e) => dispatch({ type: "profile", patch: { field: e.target.value } })}>
          {FIELDS.map((f) => <option key={f}>{f}</option>)}
        </select>
      </label>
      <label className="field">
        <span>Region</span>
        <select value={profile.region} onChange={(e) => dispatch({ type: "profile", patch: { region: e.target.value } })}>
          {REGIONS.map((r) => <option key={r}>{r}</option>)}
        </select>
      </label>
      <label className="field">
        <span>GPA <output>{profile.gpa.toFixed(1)}</output></span>
        <input type="range" min={0} max={4} step={0.1} value={profile.gpa}
          onChange={(e) => dispatch({ type: "profile", patch: { gpa: Number(e.target.value) } })} />
      </label>
    </form>
  );
}
