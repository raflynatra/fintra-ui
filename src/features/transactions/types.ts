import * as z from "zod";
import type { transactionFormSchema, transactionUpdateSchema } from "./schema";

/**
 * A `transfer` moves money between two of the user's own accounts. It is
 * neither income nor spend, so aggregate queries exclude it — see `groupTotals`.
 *
 * Note CategoryType stays "income" | "expense": transfers carry no category,
 * so the two unions legitimately diverge — don't collapse them into one.
 */
export type TransactionType = "income" | "expense" | "transfer";

export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  amount: number;
  categoryId: string | null;
  /** Resolved category name. */
  category: string | null;
  accountId: string;
  /** Resolved account name. */
  account: string | null;
  /** Set only when type is "transfer". */
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

/** The subset of list params the filter bar owns. */
export type TransactionFilterValues = Pick<
  TransactionListParams,
  "type" | "categoryId" | "accountId" | "dateFrom" | "dateTo"
>;

/** Filters plus page size. `page` belongs to the infinite query, not here. */
export type TransactionQueryParams = Omit<TransactionListParams, "page">;

export interface TransactionUIState {
  params: TransactionQueryParams;
  /**
   * The transaction open in the edit sheet. Delete is confirmed from inside
   * that sheet and acts on this same record, so there is deliberately no
   * separate `deleting` — one selection, one source of truth.
   */
  editing: Transaction | null;
  setFilters: (next: TransactionFilterValues) => void;
  clearFilters: () => void;
  openEdit: (transaction: Transaction) => void;
  closeEdit: () => void;
}

export interface TransactionSummary {
  balance: number;
  totalIncome: number;
  totalExpense: number;
}

/** The flat field set the form edits. Not what goes on the wire. */
export type TransactionFormValues = z.infer<typeof transactionFormSchema>;

export type TransactionUpdatePayload = z.infer<typeof transactionUpdateSchema>;

interface TransactionWriteBase {
  amount: number;
  accountId: string;
  description?: string;
  date?: string;
}

/**
 * What actually goes on the wire, mirroring the backend's `oneOf` on `type`:
 * income/expense carry a category and no destination, a transfer the inverse.
 * Built from `TransactionFormValues` by `toWritePayload`.
 */
export type TransactionWritePayload =
  | (TransactionWriteBase & {
      type: "income" | "expense";
      categoryId?: string;
    })
  | (TransactionWriteBase & {
      type: "transfer";
      toAccountId: string;
    });
