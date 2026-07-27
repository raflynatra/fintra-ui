import * as z from "zod";
import type { budgetSchema, budgetUpdateSchema } from "./schema";

export type BudgetPeriodType = "monthly";

export interface Budget {
  id: string;
  /** `null` marks the overall budget — every expense counts toward it. */
  categoryId: string | null;
  /** Resolved category name, `null` for the overall budget. */
  category: string | null;
  amount: number;
  periodType: BudgetPeriodType;
  /** Always the first of the month; the backend normalizes what it is sent. */
  periodStart: string;
  createdAt: string;
  updatedAt: string;
}

export interface BudgetProgress extends Budget {
  spent: number;
  remaining: number;
  /** Uncapped — an overspent budget reports more than 100. */
  percentUsed: number;
  isOverBudget: boolean;
}

export interface BudgetListParams {
  periodStart?: string;
}

export type BudgetPayload = z.infer<typeof budgetSchema>;
export type BudgetUpdatePayload = z.infer<typeof budgetUpdateSchema>;

export interface BudgetUIState {
  /** The selected period as "YYYY-MM". */
  month: string;
  formPayload: BudgetProgress | null;
  deleting: BudgetProgress | null;
  setMonth: (month: string) => void;
  setFormPayload: (budget: BudgetProgress) => void;
  resetFormPayload: () => void;
  setDeleting: (budget: BudgetProgress | null) => void;
}
