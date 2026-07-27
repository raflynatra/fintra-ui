import * as z from "zod";
import type { TransactionType } from "@/features/transactions/types";
import type { categorySchema } from "./schema";

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
  /** Seeded defaults, shared across users and not deletable. */
  isSystem: boolean;
  createdAt: string;
}

export type CategoryPayload = z.infer<typeof categorySchema>;
