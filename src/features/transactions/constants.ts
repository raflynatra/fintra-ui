import type { TransactionType } from "./types";

// These are Records rather than ternaries on purpose: a `type === "expense" ? …
// : …` silently lumps every future type into the else branch, which is exactly
// how transfers came to render as income. Keyed by TransactionType, a new
// member fails the build here instead.

export const TRANSACTION_TYPE_COLOR: Record<TransactionType, string> = {
  income: "text-primary",
  expense: "text-destructive",
  // A transfer nets to zero across the user's own accounts — no gain, no loss.
  transfer: "text-muted-foreground",
};

export const TRANSACTION_TYPE_SIGN: Record<TransactionType, string> = {
  income: "+",
  expense: "-",
  transfer: "→",
};

export const TRANSACTION_TYPE_LABEL: Record<TransactionType, string> = {
  income: "Income",
  expense: "Expense",
  transfer: "Transfer",
};
