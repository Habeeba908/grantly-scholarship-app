import { memo } from "react";
import type { Scholarship } from "../types";
import { computeMatch, tone } from "../lib/match";
import { daysUntil, deadlineLabel, formatMoney } from "../lib/dates";
import type { Profile } from "../types";

interface Props {
  s: Scholarship;
  profile: Profile;
  saved: boolean;
  onToggleSave: (id: string) => void;
  onOpen: (id: string) => void;
  compared?: boolean;
  compareDisabled?: boolean;
  onToggleCompare?: (id: string) => void;
  now?: number;
}

function Card({ s, profile, saved, onToggleSave, onOpen, compared = false, compareDisabled = false, onToggleCompare, now = Date.now() }: Props) {
  const { score } = computeMatch(s, profile);
  const days = daysUntil(s.deadline, now);
  const urgency = days < 0 ? "closed" : days <= 14 ? "urgent" : "open";

  return (
    <article className="card" aria-labelledby={`t-${s.id}`}>
      <div className="card-top">
        <span className={`match match-${tone(score)}`} role="img" aria-label={`${score} percent match`}>
          {score}%
        </span>
        <button
          className="icon-btn"
          aria-pressed={saved}
          aria-label={saved ? `Remove ${s.name} from tracker` : `Save ${s.name} to tracker`}
          onClick={() => onToggleSave(s.id)}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" fill={saved ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
            <path d="M6 3h12v18l-6-4-6 4z" />
          </svg>
        </button>
      </div>
      <h3 id={`t-${s.id}`}>
        <button className="link-btn" onClick={() => onOpen(s.id)}>{s.name}</button>
      </h3>
      <p className="provider">{s.provider} &middot; {s.category}</p>
      <p className="summary">{s.summary}</p>
      {onToggleCompare && (
        <label className="check compare-check">
          <input type="checkbox" checked={compared} disabled={compareDisabled && !compared} onChange={() => onToggleCompare(s.id)} />
          Compare<span className="sr-only"> {s.name}</span>
        </label>
      )}
      <div className="card-foot">
        <strong className="amount">{formatMoney(s.amount)}</strong>
        <span className={`deadline deadline-${urgency}`}>{deadlineLabel(s.deadline, now)}</span>
      </div>
    </article>
  );
}

export const ScholarshipCard = memo(Card);
