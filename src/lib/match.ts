import type { Profile, Scholarship } from "../types";

export interface Match {
  score: number; // 0-100
  reasons: { label: string; ok: boolean }[];
}

/** Weighted fit: level 30, field 30, GPA 20, region 20. */
export function computeMatch(s: Scholarship, p: Profile): Match {
  const level = s.levels.includes(p.level);
  const field = s.fields.includes("Any") || s.fields.includes(p.field) || p.field === "Any";
  const gpa = p.gpa >= s.minGpa;
  const region = s.regions.includes("Global") || s.regions.includes(p.region);
  const score = (level ? 30 : 0) + (field ? 30 : 0) + (gpa ? 20 : 0) + (region ? 20 : 0);
  return {
    score,
    reasons: [
      { label: level ? `Open to ${p.level} students` : `Not open to ${p.level}`, ok: level },
      { label: field ? "Matches your field" : "Different field of study", ok: field },
      { label: gpa ? `GPA ${s.minGpa.toFixed(1)}+ met` : `Needs GPA ${s.minGpa.toFixed(1)}+`, ok: gpa },
      { label: region ? "Available in your region" : "Not offered in your region", ok: region },
    ],
  };
}

export const tone = (score: number) => (score >= 80 ? "strong" : score >= 50 ? "fair" : "low");
