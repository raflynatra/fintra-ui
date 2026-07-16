import * as z from "zod";
import type { transactionSchema, transactionUpdateSchema } from "./schema";

export type TransactionType = "income" | "expense";

export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  amount: number;
  categoryId: string | null;
  category: string | null;
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
  dateFrom?: string;
  dateTo?: string;
  amountMin?: number;
  amountMax?: number;
}

export interface TransactionListResult {
  transactions: Transaction[];
  pagination: PaginationMetadata;
}

export interface TransactionSummary {
  balance: number;
  totalIncome: number;
  totalExpense: number;
}

export type TransactionPayload = z.infer<typeof transactionSchema>;
export type TransactionUpdatePayload = z.infer<typeof transactionUpdateSchema>;
