import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { currentMonth } from "./utils";
import type { TransactionQueryParams, TransactionUIState } from "./types";

const DEFAULT_PARAMS: TransactionQueryParams = { size: 10 };

export const useTransactionStore = create<TransactionUIState>()(
  devtools(
    (set) => ({
      params: DEFAULT_PARAMS,
      month: currentMonth(),
      formPayload: null,

      setFilters: (next) =>
        set((state) => ({ params: { ...state.params, ...next } })),
      setMonth: (month) => set({ month }),
      clearFilters: () =>
        set((state) => ({ params: { size: state.params.size } })),

      setFormPayload: (transaction) => set({ formPayload: transaction }),
      resetFormPayload: () => set({ formPayload: null }),
    }),
    { name: "TransactionStore" },
  ),
);
