import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type { TransactionQueryParams, TransactionUIState } from "./types";

const DEFAULT_PARAMS: TransactionQueryParams = { size: 10 };

/**
 * Client-side UI state for the transactions screen: the active filters and the
 * transaction currently open for editing.
 *
 * Not persisted — filters reset on reload, matching the useState behaviour this
 * replaces. Server data lives in TanStack Query; only what the *user* is doing
 * lives here.
 */
export const useTransactionStore = create<TransactionUIState>()(
  devtools(
    (set) => ({
      params: DEFAULT_PARAMS,
      editing: null,

      setFilters: (next) =>
        set((state) => ({ params: { ...state.params, ...next } })),

      // Drops every filter but keeps the page size — that's a display
      // preference, not a filter.
      clearFilters: () =>
        set((state) => ({ params: { size: state.params.size } })),

      openEdit: (transaction) => set({ editing: transaction }),
      closeEdit: () => set({ editing: null }),
    }),
    { name: "TransactionStore" },
  ),
);
