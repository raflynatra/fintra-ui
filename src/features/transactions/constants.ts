import type { TransactionType } from "./types";

export const TRANSACTION_TYPE_COLOR: Record<TransactionType, string> = {
  income: "text-primary",
  expense: "text-destructive",
  transfer: "text-muted-foreground",
};

export const TRANSACTION_TYPE_SIGN: Record<TransactionType, string> = {
  income: "+",
  expense: "-",
  transfer: "",
};

export const TRANSACTION_TYPE_LABEL: Record<TransactionType, string> = {
  income: "Income",
  expense: "Expense",
  transfer: "Transfer",
};
