import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type { TransactionQueryParams, TransactionUIState } from "./types";

const DEFAULT_PARAMS: TransactionQueryParams = { size: 10 };

export const useTransactionStore = create<TransactionUIState>()(
  devtools(
    (set) => ({
      params: DEFAULT_PARAMS,
      formPayload: null,

      setFilters: (next) =>
        set((state) => ({ params: { ...state.params, ...next } })),
      clearFilters: () =>
        set((state) => ({ params: { size: state.params.size } })),

      setFormPayload: (transaction) => set({ formPayload: transaction }),
      resetFormPayload: () => set({ formPayload: null }),
    }),
    { name: "TransactionStore" },
  ),
);
