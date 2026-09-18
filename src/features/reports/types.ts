import type { TransactionType } from "@/features/transactions/types";

/** One arc of the category breakdown. */
export interface CategorySlice {
  /** Category id, or the label itself for the uncategorized and remainder buckets. */
  key: string;
  label: string;
  total: number;
  /** Percentage of the period's total, to one decimal place. */
  share: number;
}

export interface CategoryBreakdown {
  slices: CategorySlice[];
  total: number;
}

export interface CategoryBreakdownOptions {
  /** Defaults to `expense`; transfers are never counted. */
  type?: Exclude<TransactionType, "transfer">;
  /** Categories past this rank fold into a single remainder slice. */
  maxSlices?: number;
}

/**
 * Client state for the reports page. Server data belongs to TanStack Query, so
 * only the selected period lives here.
 */
export interface ReportsUIState {
  /** The selected period as "YYYY-MM". */
  month: string;
  setMonth: (month: string) => void;
}
