import type { TransactionType } from "@/features/transactions/types";

export type CategoryType = "income" | "expense";

/** Narrows a transaction type to its category type, or `undefined` for a transfer. */
export function toCategoryType(
  type: TransactionType | undefined,
): CategoryType | undefined {
  return type === "income" || type === "expense" ? type : undefined;
}

export interface Category {
  id: string;
  name: string;
  type: CategoryType;
  isSystem: boolean;
  createdAt: string;
}
