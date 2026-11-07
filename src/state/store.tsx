import { createContext, useContext, useEffect, useReducer, type Dispatch, type ReactNode } from "react";
import { LEVELS, STATUSES, type Profile, type Status, type TrackedItem } from "../types";
import { sanitize } from "../lib/sanitize";

export interface State {
  profile: Profile;
  tracked: Record<string, TrackedItem>;
  theme: "light" | "dark";
  goal: number; // funding goal in USD
}

export type Action =
  | { type: "profile"; patch: Partial<Profile> }
  | { type: "toggleSave"; id: string }
  | { type: "restore"; id: string; item: TrackedItem }
  | { type: "status"; id: string; status: Status }
  | { type: "notes"; id: string; notes: string }
  | { type: "toggleDoc"; id: string; doc: string }
  | { type: "goal"; goal: number }
  | { type: "import"; state: State }
  | { type: "theme" };

const KEY = "grantly:v2";
export const initialState: State = {
  profile: { level: "Undergraduate", field: "Computer Science", gpa: 3.5, region: "Asia" },
  tracked: {},
  theme: "light",
  goal: 20000,
};

export const clampGoal = (n: number) => Math.min(500_000, Math.max(0, Math.round(Number(n) || 0)));

export function reducer(state: State, a: Action): State {
  const touch = (id: string, fn: (t: TrackedItem) => TrackedItem): State => {
    const cur = state.tracked[id];
    return cur ? { ...state, tracked: { ...state.tracked, [id]: { ...fn(cur), updatedAt: Date.now() } } } : state;
  };
  switch (a.type) {
    case "profile":
      return { ...state, profile: { ...state.profile, ...a.patch } };
    case "toggleSave": {
      const next = { ...state.tracked };
      if (next[a.id]) delete next[a.id];
      else next[a.id] = { status: "saved", notes: "", done: [], updatedAt: Date.now() };
      return { ...state, tracked: next };
    }
    case "restore":
      return { ...state, tracked: { ...state.tracked, [a.id]: a.item } };
    case "status":
      return touch(a.id, (t) => ({ ...t, status: a.status }));
    case "notes":
      return touch(a.id, (t) => ({ ...t, notes: sanitize(a.notes, 600) }));
    case "toggleDoc":
      return touch(a.id, (t) => ({ ...t, done: t.done.includes(a.doc) ? t.done.filter((d) => d !== a.doc) : [...t.done, a.doc] }));
    case "goal":
      return { ...state, goal: clampGoal(a.goal) };
    case "import":
      return a.state;
    case "theme":
      return { ...state, theme: state.theme === "light" ? "dark" : "light" };
  }
}

/** Validates any untrusted data (localStorage or an imported file) into a safe State, or null. */
export function parseState(raw: any): State | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const p = raw.profile ?? {};
  const profile: Profile = {
    level: LEVELS.includes(p.level) ? p.level : initialState.profile.level,
    field: typeof p.field === "string" ? sanitize(p.field, 40) : initialState.profile.field,
    gpa: typeof p.gpa === "number" && p.gpa >= 0 && p.gpa <= 4 ? p.gpa : initialState.profile.gpa,
    region: typeof p.region === "string" ? sanitize(p.region, 40) : initialState.profile.region,
  };
  const tracked: State["tracked"] = {};
  for (const [id, t] of Object.entries<any>(raw.tracked ?? {}).slice(0, 200)) {
    if (t && STATUSES.includes(t.status)) {
      tracked[sanitize(id, 20)] = {
        status: t.status,
        notes: sanitize(String(t.notes ?? ""), 600),
        done: Array.isArray(t.done) ? t.done.slice(0, 20).map((d: unknown) => sanitize(String(d), 60)) : [],
        updatedAt: Number(t.updatedAt) || 0,
      };
    }
  }
  return {
    profile, tracked,
    theme: raw.theme === "dark" ? "dark" : "light",
    goal: raw.goal === undefined ? initialState.goal : clampGoal(raw.goal),
  };
}

function load(): State {
  try { return parseState(JSON.parse(localStorage.getItem(KEY) ?? "null")) ?? initialState; }
  catch { return initialState; }
}

const StateCtx = createContext<State>(initialState);
const DispatchCtx = createContext<Dispatch<Action>>(() => {});

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, load);
  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* storage blocked or full */ }
    document.documentElement.dataset.theme = state.theme;
  }, [state]);
  return (
    <StateCtx.Provider value={state}>
      <DispatchCtx.Provider value={dispatch}>{children}</DispatchCtx.Provider>
    </StateCtx.Provider>
  );
}

export const useAppState = () => useContext(StateCtx);
export const useAppDispatch = () => useContext(DispatchCtx);
