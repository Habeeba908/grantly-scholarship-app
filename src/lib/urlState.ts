import { CATEGORIES, type Category, type SortKey } from "../types";
import { sanitizeQuery } from "./sanitize";

export interface Filters { q: string; cat: Category | "All"; sort: SortKey; strong: boolean }
export const defaultFilters: Filters = { q: "", cat: "All", sort: "match", strong: false };

/** Reads filters from a query string with strict validation, so shared links are safe. */
export function parseFilters(search: string): Filters {
  const p = new URLSearchParams(search);
  const cat = p.get("cat") as Category;
  const sort = p.get("sort") as SortKey;
  return {
    q: sanitizeQuery(p.get("q") ?? ""),
    cat: CATEGORIES.includes(cat) ? cat : "All",
    sort: ["match", "deadline", "amount"].includes(sort) ? sort : "match",
    strong: p.get("strong") === "1",
  };
}

export function serializeFilters(f: Filters): string {
  const p = new URLSearchParams();
  if (f.q) p.set("q", f.q);
  if (f.cat !== "All") p.set("cat", f.cat);
  if (f.sort !== "match") p.set("sort", f.sort);
  if (f.strong) p.set("strong", "1");
  const s = p.toString();
  return s ? `?${s}` : "";
}
