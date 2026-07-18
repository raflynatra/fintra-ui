import * as z from "zod";
import type { accountSchema, accountUpdateSchema } from "./schema";

export type AccountType = "cash" | "bank" | "ewallet" | "credit_card";

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  initialBalance: number;
  /** initialBalance plus every movement in or out; derived server-side. */
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
  sheetOpen: boolean;
  /**
   * The account the sheet is editing, or null for create mode. `sheetOpen` is
   * separate because null is a meaningful *open* state, not a closed one.
   */
  editing: Account | null;
  /** The account pending archive confirmation. */
  archiving: Account | null;
  openCreate: () => void;
  openEdit: (account: Account) => void;
  setSheetOpen: (open: boolean) => void;
  setArchiving: (account: Account | null) => void;
}
