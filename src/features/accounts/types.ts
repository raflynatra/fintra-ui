import * as z from "zod";
import type { accountSchema, accountUpdateSchema } from "./schema";

export type AccountType = "cash" | "bank" | "ewallet" | "credit_card";

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  initialBalance: number;
  balance: number;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AccountListParams {
  includeArchived?: boolean;
}

export type AccountPayload = z.infer<typeof accountSchema>;
export type AccountUpdatePayload = z.infer<typeof accountUpdateSchema>;

export interface AccountUIState {
  formPayload: Account | null;
  archiving: Account | null;
  setFormPayload: (account: Account) => void;
  resetFormPayload: () => void;
  setArchiving: (account: Account | null) => void;
}
