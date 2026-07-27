import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { currentMonth } from "@/lib/date";
import type { BudgetUIState } from "./types";

export const useBudgetStore = create<BudgetUIState>()(
  devtools(
    (set) => ({
      month: currentMonth(),
      formPayload: null,
      deleting: null,

      setMonth: (month) => set({ month }),
      setFormPayload: (budget) => set({ formPayload: budget }),
      resetFormPayload: () => set({ formPayload: null }),
      setDeleting: (budget) => set({ deleting: budget }),
    }),
    { name: "BudgetStore" },
  ),
);
