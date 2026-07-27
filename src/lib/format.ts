const rupiahFormatter = new Intl.NumberFormat("id-ID");

const rupiahCompactFormatter = new Intl.NumberFormat("id-ID", {
  notation: "compact",
  maximumFractionDigits: 1,
});

/** Formats a number for display inside an editable amount input (no currency prefix). */
export function formatAmountInput(value: number | undefined): string {
  return value === undefined || !Number.isFinite(value)
    ? ""
    : rupiahFormatter.format(value);
}

/** Formats a number as a rupiah amount for read-only display, e.g. "Rp100.000". */
export function formatCurrency(value: number): string {
  return `Rp${rupiahFormatter.format(value)}`;
}

/** Formats a number as an abbreviated (lossy) rupiah amount, e.g. "Rp255,1 rb" / "Rp15 jt". */
export function formatCurrencyCompact(value: number): string {
  return `Rp${rupiahCompactFormatter.format(value)}`;
}

/** Formats a "YYYY-MM-DD" transaction date for display, e.g. "14 Jul 2026". */
export function formatTransactionDate(value: string): string {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/** Formats a "YYYY-MM" period for display, e.g. "July 2026". */
export function formatMonth(value: string): string {
  const [year, month] = value.split("-").map(Number);
  return new Date(year, month - 1, 1).toLocaleDateString("en-GB", {
    month: "long",
    year: "numeric",
  });
}

/** Formats an ISO timestamp as its month and year, e.g. "July 2026". */
export function formatMonthYear(value: string): string {
  return new Date(value).toLocaleDateString("en-GB", {
    month: "long",
    year: "numeric",
  });
}

/** Formats a "YYYY-MM-DD" transaction date's weekday, e.g. "Tue". */
export function formatTransactionWeekday(value: string): string {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("en-GB", {
    weekday: "short",
  });
}
