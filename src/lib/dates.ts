const DAY = 86_400_000;

export function daysUntil(iso: string, now = Date.now()): number {
  const end = new Date(`${iso}T23:59:59`).getTime();
  return Math.ceil((end - now) / DAY);
}

export function deadlineLabel(iso: string, now = Date.now()): string {
  const d = daysUntil(iso, now);
  if (d < 0) return "Closed";
  if (d === 0) return "Closes today";
  if (d === 1) return "1 day left";
  return `${d} days left`;
}

export const formatDate = (iso: string) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });

export const formatMoney = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
