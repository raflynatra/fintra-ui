import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { BudgetProgress } from "@/features/budgets/types";

/**
 * Budgets for a period, each with its spend. `BudgetProgress` is a superset of
 * the plain budget, so this is the list's only source of truth.
 */
export function useBudgetProgress(periodStart: string) {
  return useQuery({
    queryKey: ["budgets", { periodStart }],
    queryFn: () =>
      apiClient.get<BudgetProgress[]>("/api/budgets/progress", {
        params: { periodStart },
      }),
  });
}
