import { isToday, isYesterday, parseISO } from "date-fns";

import { formatTransactionDate, formatTransactionWeekday } from "@/lib/format";
import type {
  Transaction,
  TransactionFormValues,
  TransactionListParams,
  TransactionQueryParams,
  TransactionWritePayload,
} from "@/features/transactions/types";

/** Whether any narrowing filter (excluding page size) is active. */
export function hasActiveFilters(params: TransactionQueryParams): boolean {
  return !!(
    params.type ||
    params.categoryId ||
    params.accountId ||
    params.dateFrom ||
    params.dateTo
  );
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
