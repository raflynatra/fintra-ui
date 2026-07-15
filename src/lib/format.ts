const rupiahFormatter = new Intl.NumberFormat("id-ID");

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

/** Formats a "YYYY-MM-DD" transaction date for display, e.g. "14 Jul 2026". */
export function formatTransactionDate(value: string): string {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
