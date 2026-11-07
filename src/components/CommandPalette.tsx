import { useEffect, useMemo, useRef, useState } from "react";
import type { Scholarship } from "../types";

export interface Command { id: string; label: string; run: () => void }
interface Props { open: boolean; onClose: () => void; commands: Command[]; scholarships: Scholarship[]; onOpenScholarship: (id: string) => void }

export function CommandPalette({ open, onClose, commands, scholarships, onOpenScholarship }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const [q, setQ] = useState("");
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) { setQ(""); setIdx(0); d.showModal(); }
    if (!open && d.open) d.close();
  }, [open]);

  const items = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const cmds = commands.filter((c) => c.label.toLowerCase().includes(needle)).map((c) => ({ id: `c-${c.id}`, label: c.label, group: "Actions", run: c.run }));
    const sch = scholarships
      .filter((s) => needle && `${s.name} ${s.provider}`.toLowerCase().includes(needle))
      .slice(0, 6)
      .map((s) => ({ id: `s-${s.id}`, label: s.name, group: "Scholarships", run: () => onOpenScholarship(s.id) }));
    return [...cmds, ...sch];
  }, [q, commands, scholarships, onOpenScholarship]);

  const choose = (i: number) => { const it = items[i]; if (it) { onClose(); it.run(); } };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setIdx((i) => Math.min(items.length - 1, i + 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setIdx((i) => Math.max(0, i - 1)); }
    else if (e.key === "Enter") { e.preventDefault(); choose(idx); }
  };

  return (
    <dialog ref={ref} className="dialog palette" aria-label="Command palette" onClose={onClose}
      onClick={(e) => { if (e.target === ref.current) onClose(); }}>
      <div className="dialog-body" onKeyDown={onKey}>
        <input role="combobox" aria-expanded="true" aria-controls="cmd-list" aria-activedescendant={items[idx]?.id}
          aria-label="Search actions and scholarships" placeholder="Type a command or scholarship…" value={q} maxLength={60}
          onChange={(e) => { setQ(e.target.value); setIdx(0); }} className="palette-input" />
        <ul id="cmd-list" role="listbox" className="palette-list">
          {items.map((it, i) => (
            <li key={it.id} id={it.id} role="option" aria-selected={i === idx} className={i === idx ? "active" : undefined}
              onMouseEnter={() => setIdx(i)} onClick={() => choose(i)}>
              <span>{it.label}</span><span className="muted small">{it.group}</span>
            </li>
          ))}
          {items.length === 0 && <li className="muted" role="presentation">No results</li>}
        </ul>
      </div>
    </dialog>
  );
}
