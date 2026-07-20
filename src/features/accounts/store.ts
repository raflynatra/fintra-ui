import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type { AccountUIState } from "./types";

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
