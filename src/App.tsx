import { useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { SCHOLARSHIPS } from "./data/scholarships";
import { CATEGORIES, type Category, type SortKey } from "./types";
import { useAppDispatch, useAppState } from "./state/store";
import { computeMatch } from "./lib/match";
import { sanitizeQuery } from "./lib/sanitize";
import { parseFilters, serializeFilters } from "./lib/urlState";
import { ScholarshipCard } from "./components/ScholarshipCard";
import { DetailDialog } from "./components/DetailDialog";
import { Tracker } from "./components/Tracker";
import { ProfilePanel } from "./components/ProfilePanel";
import { Dashboard } from "./components/Dashboard";
import { CompareDialog } from "./components/CompareDialog";
import { CommandPalette, type Command } from "./components/CommandPalette";
import { Toast, type ToastData } from "./components/Toast";

type View = "discover" | "plan" | "tracker";
const MAX_COMPARE = 3;

export default function App() {
  const { profile, tracked, theme } = useAppState();
  const dispatch = useAppDispatch();
  const initial = useMemo(() => parseFilters(window.location.search), []);
  const [view, setView] = useState<View>("discover");
  const [query, setQuery] = useState(initial.q);
  const [category, setCategory] = useState<Category | "All">(initial.cat);
  const [sort, setSort] = useState<SortKey>(initial.sort);
  const [eligibleOnly, setEligibleOnly] = useState(initial.strong);
  const [openId, setOpenId] = useState<string | null>(null);
  const [compare, setCompare] = useState<string[]>([]);
  const [compareOpen, setCompareOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [toast, setToast] = useState<ToastData | null>(null);
  const search = useRef<HTMLInputElement>(null);
  const trackedRef = useRef(tracked);
  trackedRef.current = tracked;
  const deferred = useDeferredValue(query);

  // Keep filters in the URL so a search can be shared or bookmarked.
  useEffect(() => {
    try {
      const qs = serializeFilters({ q: sanitizeQuery(query), cat: category, sort, strong: eligibleOnly });
      window.history.replaceState(null, "", `${window.location.pathname}${qs}`);
    } catch { /* ignore */ }
  }, [query, category, sort, eligibleOnly]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setPaletteOpen(true); return; }
      const el = e.target as HTMLElement;
      if (e.key === "/" && !["INPUT", "TEXTAREA", "SELECT"].includes(el.tagName)) {
        e.preventDefault(); setView("discover"); search.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const results = useMemo(() => {
    const q = sanitizeQuery(deferred);
    return SCHOLARSHIPS.map((s) => ({ s, m: computeMatch(s, profile) }))
      .filter(({ s, m }) =>
        (category === "All" || s.category === category) &&
        (!eligibleOnly || m.score >= 80) &&
        (!q || `${s.name} ${s.provider} ${s.summary}`.toLowerCase().includes(q)))
      .sort((a, b) =>
        sort === "match" ? b.m.score - a.m.score || a.s.deadline.localeCompare(b.s.deadline)
        : sort === "deadline" ? a.s.deadline.localeCompare(b.s.deadline)
        : b.s.amount - a.s.amount);
  }, [deferred, category, sort, eligibleOnly, profile]);

  const toggleSave = useCallback((id: string) => {
    const name = SCHOLARSHIPS.find((s) => s.id === id)?.name ?? "Scholarship";
    const item = trackedRef.current[id];
    dispatch({ type: "toggleSave", id });
    setToast(item
      ? { msg: `Removed ${name}`, undo: () => dispatch({ type: "restore", id, item }) }
      : { msg: `Saved ${name} to your tracker` });
  }, [dispatch]);
  const open = useCallback((id: string) => setOpenId(id), []);
  const toggleCompare = useCallback((id: string) => {
    setCompare((c) => (c.includes(id) ? c.filter((x) => x !== id) : c.length < MAX_COMPARE ? [...c, id] : c));
  }, []);
  const closeToast = useCallback(() => setToast(null), []);
  const showToast = useCallback((msg: string) => setToast({ msg }), []);

  const commands: Command[] = useMemo(() => [
    { id: "d", label: "Go to Discover", run: () => setView("discover") },
    { id: "p", label: "Go to Funding plan", run: () => setView("plan") },
    { id: "t", label: "Go to Tracker", run: () => setView("tracker") },
    { id: "s", label: "Search scholarships", run: () => { setView("discover"); setTimeout(() => search.current?.focus(), 50); } },
    { id: "m", label: "Toggle dark mode", run: () => dispatch({ type: "theme" }) },
    { id: "r", label: "Reset filters", run: () => { setQuery(""); setCategory("All"); setSort("match"); setEligibleOnly(false); } },
  ], [dispatch]);

  const savedCount = Object.keys(tracked).length;
  const compareItems = compare.map((id) => SCHOLARSHIPS.find((s) => s.id === id)!).filter(Boolean);

  return (
    <>
      <a className="skip" href="#main">Skip to content</a>
      <header className="top">
        <div className="brand"><span className="logo" aria-hidden="true">G</span> Grantly</div>
        <nav aria-label="Primary">
          <button className="tab" aria-current={view === "discover" ? "page" : undefined} onClick={() => setView("discover")}>Discover</button>
          <button className="tab" aria-current={view === "plan" ? "page" : undefined} onClick={() => setView("plan")}>Plan</button>
          <button className="tab" aria-current={view === "tracker" ? "page" : undefined} onClick={() => setView("tracker")}>
            Tracker{savedCount > 0 && <span className="count">{savedCount}</span>}
          </button>
        </nav>
        <button className="btn btn-quiet" onClick={() => setPaletteOpen(true)} aria-keyshortcuts="Control+K">Quick actions <kbd>Ctrl K</kbd></button>
        <button className="btn btn-quiet" onClick={() => dispatch({ type: "theme" })} aria-pressed={theme === "dark"}>
          {theme === "dark" ? "Light mode" : "Dark mode"}
        </button>
      </header>

      <main id="main">
        {view === "discover" && (
          <>
            <section className="hero">
              <h1>Find money for school that actually fits you.</h1>
              <p className="muted">Tell us about yourself once. Every scholarship is scored against your profile.</p>
              <ProfilePanel />
            </section>

            <section aria-label="Search and filters" className="filters">
              <label className="field grow">
                <span>Search <kbd>/</kbd></span>
                <input ref={search} type="search" value={query} maxLength={80} placeholder="Name, provider or keyword"
                  onChange={(e) => setQuery(e.target.value)} />
              </label>
              <label className="field">
                <span>Category</span>
                <select value={category} onChange={(e) => setCategory(e.target.value as Category | "All")}>
                  <option>All</option>
                  {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </label>
              <label className="field">
                <span>Sort by</span>
                <select value={sort} onChange={(e) => setSort(e.target.value as SortKey)}>
                  <option value="match">Best match</option>
                  <option value="deadline">Soonest deadline</option>
                  <option value="amount">Highest amount</option>
                </select>
              </label>
              <label className="check">
                <input type="checkbox" checked={eligibleOnly} onChange={(e) => setEligibleOnly(e.target.checked)} />
                Strong matches only
              </label>
            </section>

            <p className="muted" role="status" aria-live="polite">{results.length} scholarship{results.length === 1 ? "" : "s"} found</p>

            {results.length === 0 ? (
              <section className="empty">
                <h2>No scholarships match</h2>
                <p>Clear the search, switch the category, or turn off “Strong matches only”.</p>
                <button className="btn" onClick={() => { setQuery(""); setCategory("All"); setEligibleOnly(false); }}>Reset filters</button>
              </section>
            ) : (
              <div className="grid">
                {results.map(({ s }) => (
                  <ScholarshipCard key={s.id} s={s} profile={profile} saved={!!tracked[s.id]} onToggleSave={toggleSave} onOpen={open}
                    compared={compare.includes(s.id)} compareDisabled={compare.length >= MAX_COMPARE} onToggleCompare={toggleCompare} />
                ))}
              </div>
            )}
          </>
        )}
        {view === "plan" && <Dashboard onOpen={open} onToast={showToast} />}
        {view === "tracker" && <Tracker onOpen={open} />}
      </main>

      {compare.length > 0 && (
        <div className="compare-tray" role="region" aria-label="Comparison tray">
          <span>{compare.length} of {MAX_COMPARE} selected</span>
          <button className="btn" disabled={compare.length < 2} onClick={() => setCompareOpen(true)}>Compare</button>
          <button className="btn btn-quiet" onClick={() => setCompare([])}>Clear</button>
        </div>
      )}

      <DetailDialog s={SCHOLARSHIPS.find((x) => x.id === openId) ?? null} onClose={() => setOpenId(null)} />
      <CompareDialog items={compareItems} open={compareOpen} profile={profile} onClose={() => setCompareOpen(false)} />
      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} commands={commands} scholarships={SCHOLARSHIPS}
        onOpenScholarship={(id) => setOpenId(id)} />
      <Toast toast={toast} onClose={closeToast} />
    </>
  );
}
