import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type { AccountUIState } from "./types";

export const useAccountStore = create<AccountUIState>()(
  devtools(
    (set) => ({
      formPayload: null,
      archiving: null,

      setFormPayload: (account) => set({ formPayload: account }),
      resetFormPayload: () => set({ formPayload: null }),
      setArchiving: (account) => set({ archiving: account }),
    }),
    { name: "AccountStore" },
  ),
);
