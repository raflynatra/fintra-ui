import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type { AccountUIState } from "./types";

/**
 * Client-side UI state for the accounts screen. Not persisted: which sheet is
 * open is a momentary thing, and surviving a reload would be a bug, not a
 * feature. Account data itself lives in TanStack Query.
 */
export const useAccountStore = create<AccountUIState>()(
  devtools(
    (set) => ({
      sheetOpen: false,
      editing: null,
      archiving: null,

      openCreate: () => set({ editing: null, sheetOpen: true }),
      openEdit: (account) => set({ editing: account, sheetOpen: true }),
      setSheetOpen: (open) => set({ sheetOpen: open }),
      setArchiving: (account) => set({ archiving: account }),
    }),
    { name: "AccountStore" },
  ),
);
