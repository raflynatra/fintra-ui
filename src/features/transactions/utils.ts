import { isToday, isYesterday, parseISO } from "date-fns";

import { formatTransactionDate, formatTransactionWeekday } from "@/lib/format";
import type {
  Transaction,
  TransactionFormValues,
  TransactionListParams,
  TransactionQueryParams,
  TransactionWritePayload,
} from "@/features/transactions/types";

/**
 * Whether any filter is narrowing the list. `size` is excluded — it's a display
 * preference, so an untouched list with a page size still counts as unfiltered.
 */
export function hasActiveFilters(params: TransactionQueryParams): boolean {
  return !!(
    params.type ||
    params.categoryId ||
    params.accountId ||
    params.dateFrom ||
    params.dateTo
  );
}

/**
 * Narrows the form's flat values to the arm-specific body the backend's `oneOf`
 * expects, dropping the field that doesn't belong: a transfer must not carry a
 * `categoryId`, and income/expense must not carry a `toAccountId`.
 *
 * Called inside the create/update hooks rather than by their callers, so no
 * caller can forget and post a stale field from a type they toggled away from.
 */
export function toWritePayload(
  values: TransactionFormValues,
): TransactionWritePayload {
  const base = {
    amount: values.amount,
    accountId: values.accountId,
    description: values.description || undefined,
    date: values.date,
  };

  if (values.type === "transfer") {
    // The schema guarantees toAccountId is set when type is "transfer";
    // TypeScript can't see across the superRefine, hence the assertion.
    return { ...base, type: "transfer", toAccountId: values.toAccountId! };
  }

  return { ...base, type: values.type, categoryId: values.categoryId };
}

export function toStringParams(
  params: TransactionListParams,
): Record<string, string> {
  const result: Record<string, string> = {};

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) result[key] = String(value);
  }

  return result;
}

export function groupLabel(date: string) {
  const parsed = parseISO(date);
  const weekday = isToday(parsed)
    ? "Today"
    : isYesterday(parsed)
      ? "Yesterday"
      : formatTransactionWeekday(date);

  return { weekday, date: formatTransactionDate(date) };
}

export function groupTotals(items: Transaction[]) {
  let totalIncome = 0;
  let totalExpense = 0;

  for (const item of items) {
    // Transfers move money between the user's own accounts — neither income nor
    // spend. The backend excludes them from its aggregates, so an `else` here
    // would silently bill every transfer as an expense and make the day header
    // disagree with the summary card.
    if (item.type === "income") totalIncome += item.amount;
    else if (item.type === "expense") totalExpense += item.amount;
  }

  return { totalIncome, totalExpense };
}

export function groupByDate(transactions: Transaction[]) {
  const groups = new Map<string, Transaction[]>();

  for (const transaction of transactions) {
    const existing = groups.get(transaction.date);
    if (existing) {
      existing.push(transaction);
    } else {
      groups.set(transaction.date, [transaction]);
    }
  }

  return Array.from(groups.entries()).map(([date, items]) => ({
    date,
    label: groupLabel(date),
    items,
    totals: groupTotals(items),
  }));
}
