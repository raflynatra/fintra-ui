import * as z from "zod";
import type { transactionFormSchema, transactionUpdateSchema } from "./schema";

/** The kind of money movement a transaction represents. */
export type TransactionType = "income" | "expense" | "transfer";

export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  amount: number;
  categoryId: string | null;
  category: string | null;
  accountId: string;
  account: string | null;
  toAccountId: string | null;
  toAccount: string | null;
  description: string | null;
  date: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaginationMetadata {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface TransactionListParams {
  page?: number;
  size?: number;
  type?: TransactionType;
  categoryId?: string;
  accountId?: string;
  dateFrom?: string;
  dateTo?: string;
  amountMin?: number;
  amountMax?: number;
}

export interface TransactionListResult {
  transactions: Transaction[];
  pagination: PaginationMetadata;
}

export type TransactionFilterValues = Pick<
  TransactionListParams,
  "type" | "categoryId" | "accountId"
>;

export type TransactionQueryParams = Omit<TransactionListParams, "page">;

export interface TransactionUIState {
  params: TransactionQueryParams;
  /** The selected period as "YYYY-MM". */
  month: string;
  formPayload: Transaction | null;
  setFilters: (next: TransactionFilterValues) => void;
  setMonth: (month: string) => void;
  clearFilters: () => void;
  setFormPayload: (transaction: Transaction) => void;
  resetFormPayload: () => void;
}

export interface TransactionSummary {
  balance: number;
  totalIncome: number;
  totalExpense: number;
}

export type TransactionFormValues = z.infer<typeof transactionFormSchema>;

export type TransactionUpdatePayload = z.infer<typeof transactionUpdateSchema>;

interface TransactionWriteBase {
  amount: number;
  accountId: string;
  description?: string;
  date?: string;
}

/** The request body sent when creating or updating a transaction. */
export type TransactionWritePayload =
  | (TransactionWriteBase & {
      type: "income" | "expense";
      categoryId?: string;
    })
  | (TransactionWriteBase & {
      type: "transfer";
      toAccountId: string;
    });
