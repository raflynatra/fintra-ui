import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { currentMonth } from "@/lib/date";
import type { ReportsUIState } from "./types";

/**
 * Reports keeps its own month, matching how transactions and budgets each keep
 * theirs. The switcher component and the period helpers are what they share.
 */
export const useReportsStore = create<ReportsUIState>()(
  devtools(
    (set) => ({
      month: currentMonth(),

      setMonth: (month) => set({ month }),
    }),
    { name: "ReportsStore" },
  ),
);
