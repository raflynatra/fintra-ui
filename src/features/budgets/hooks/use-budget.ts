import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { BudgetProgress } from "@/features/budgets/types";

/**
 * A single budget with its spend. Keyed under `["budgets"]`, so every budget and
 * transaction mutation already invalidates it.
 */
export function useBudget(id: string) {
  return useQuery({
    queryKey: ["budgets", id],
    queryFn: () => apiClient.get<BudgetProgress>(`/api/budgets/${id}/progress`),
  });
}
