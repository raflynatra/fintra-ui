import type { TransactionType } from "@/features/transactions/types";

/**
 * Deliberately narrower than `TransactionType`: transfers carry no category, so
 * the two unions diverge rather than one being reused for both.
 */
export type CategoryType = "income" | "expense";

/**
 * Narrows a transaction type to the category type it implies, or `undefined`
 * for a transfer (which has no categories to fetch).
 */
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
