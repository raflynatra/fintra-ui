import type { Transaction } from "@/features/transactions/types";
import type {
  CategoryBreakdown,
  CategoryBreakdownOptions,
  CategorySlice,
} from "./types";

/** Shown for spending that was never given a category. */
const UNCATEGORIZED = "Uncategorized";

/** Shown for everything folded past the slice limit. */
export const REMAINDER_LABEL = "Other";

/** Past this, slices are too thin to read and the palette runs out of hues. */
const DEFAULT_MAX_SLICES = 7;

/**
 * Aggregates a month's transactions into a per-category breakdown.
 *
 * Runs client-side because the backend's category summary has no date filter —
 * it answers all-time only, so it cannot serve a monthly view. Transfers never
 * contribute: moving money between your own accounts is not spending.
 */
export function toCategoryBreakdown(
  transactions: Transaction[],
  { type = "expense", maxSlices = DEFAULT_MAX_SLICES }: CategoryBreakdownOptions = {},
): CategoryBreakdown {
  const totals = new Map<string, { label: string; total: number }>();
  let total = 0;

  for (const transaction of transactions) {
    if (transaction.type !== type) continue;

    const key = transaction.categoryId ?? UNCATEGORIZED;
    const entry = totals.get(key) ?? {
      label: transaction.category ?? UNCATEGORIZED,
      total: 0,
    };

    entry.total += transaction.amount;
    totals.set(key, entry);
    total += transaction.amount;
  }

  if (total === 0) return { slices: [], total: 0 };

  const ranked = [...totals.entries()]
    .map(([key, entry]) => ({ key, ...entry }))
    .sort((a, b) => b.total - a.total);

  const kept = ranked.slice(0, maxSlices);
  const folded = ranked.slice(maxSlices);

  const slices: CategorySlice[] = kept.map((entry) => ({
    key: entry.key,
    label: entry.label,
    total: entry.total,
    share: toShare(entry.total, total),
  }));

  if (folded.length > 0) {
    const foldedTotal = folded.reduce((sum, entry) => sum + entry.total, 0);

    slices.push({
      key: REMAINDER_LABEL,
      label: REMAINDER_LABEL,
      total: foldedTotal,
      share: toShare(foldedTotal, total),
    });
  }

  return { slices, total };
}

/** Percentage of the month, to one decimal place. */
function toShare(value: number, total: number): number {
  return Math.round((value / total) * 1000) / 10;
}
