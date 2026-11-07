export const LEVELS = ["High School", "Undergraduate", "Postgraduate", "PhD"] as const;
export type Level = (typeof LEVELS)[number];
export const CATEGORIES = ["Merit", "Need-based", "STEM", "Arts", "Community", "Research"] as const;
export type Category = (typeof CATEGORIES)[number];
export const FIELDS = ["Computer Science", "Engineering", "Medicine", "Business", "Arts", "Education", "Any"] as const;
export const REGIONS = ["North America", "Europe", "Asia", "Africa", "Latin America", "Oceania"] as const;

export interface Scholarship {
  id: string;
  name: string;
  provider: string;
  amount: number;
  deadline: string; // ISO date
  levels: Level[];
  fields: string[]; // includes "Any"
  category: Category;
  minGpa: number;
  regions: string[]; // includes "Global"
  summary: string;
  eligibility: string[];
  documents: string[];
}

export interface Profile {
  level: Level;
  field: string;
  gpa: number;
  region: string;
}

export type Status = "saved" | "applying" | "submitted" | "awarded";
export const STATUSES: Status[] = ["saved", "applying", "submitted", "awarded"];

export interface TrackedItem {
  status: Status;
  notes: string;
  done: string[]; // completed document names
  updatedAt: number;
}

export type SortKey = "match" | "deadline" | "amount";
