import type { TransactionType } from "./types";

export const TRANSACTION_TYPE_COLOR: Record<TransactionType, string> = {
  income: "text-primary",
  expense: "text-destructive",
};
