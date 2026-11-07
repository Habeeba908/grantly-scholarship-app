/** Strips tags and control characters, caps length. React escapes output; this keeps stored data clean. */
export function sanitize(input: string, max = 500): string {
  return input
    .replace(/<[^>]*>/g, "")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .slice(0, max);
}

export const sanitizeQuery = (q: string) => sanitize(q, 80).replace(/\s+/g, " ").trim().toLowerCase();
