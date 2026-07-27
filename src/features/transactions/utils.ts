import { isToday, isYesterday, parseISO } from "date-fns";

import { monthRange } from "@/lib/date";
import { formatTransactionDate, formatTransactionWeekday } from "@/lib/format";
import type {
  Transaction,
  TransactionFormValues,
  TransactionListParams,
  TransactionQueryParams,
  TransactionWritePayload,
} from "@/features/transactions/types";

/**
 * How many narrowing filters are active. Page size is a display preference and
 * the period is always set, so neither counts as a filter.
 */
export function activeFilterCount(params: TransactionQueryParams): number {
  return [params.type, params.categoryId, params.accountId].filter(Boolean)
    .length;
}

/** Whether the list is narrowed by anything the user can clear. */
export function hasActiveFilters(params: TransactionQueryParams): boolean {
  return activeFilterCount(params) > 0;
}

/** Combines the active filters with the selected period into wire params. */
export function toQueryParams(
  params: TransactionQueryParams,
  month: string,
): TransactionQueryParams {
  return { ...params, ...monthRange(month) };
}

/** Builds the arm-specific write payload from form values. */
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
    return { ...base, type: "transfer", toAccountId: values.toAccountId! };
  }

  return { ...base, type: values.type, categoryId: values.categoryId };
}

/** Serializes params for the query string, dropping keys that are unset. */
export function toStringParams(
  params: TransactionListParams,
): Record<string, string> {
  const result: Record<string, string> = {};

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) result[key] = String(value);
  }

  return result;
}

/** Builds a day heading, preferring "Today"/"Yesterday" over the weekday. */
export function groupLabel(date: string) {
  const parsed = parseISO(date);
  const weekday = isToday(parsed)
    ? "Today"
    : isYesterday(parsed)
      ? "Yesterday"
      : formatTransactionWeekday(date);

  return { weekday, date: formatTransactionDate(date) };
}

/** Sums income and expense. Transfers move money without changing net worth. */
export function groupTotals(items: Transaction[]) {
  let totalIncome = 0;
  let totalExpense = 0;

  for (const item of items) {
    if (item.type === "income") totalIncome += item.amount;
    else if (item.type === "expense") totalExpense += item.amount;
  }

  return { totalIncome, totalExpense };
}

/** Groups transactions into day sections, preserving the server's ordering. */
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
