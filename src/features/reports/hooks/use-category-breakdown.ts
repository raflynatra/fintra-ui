import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { monthRange } from "@/lib/date";
import { toStringParams } from "@/features/transactions/utils";
import type { TransactionListResult } from "@/features/transactions/types";
import { toCategoryBreakdown } from "@/features/reports/utils";
import type { CategoryBreakdown } from "@/features/reports/types";

/**
 * One page big enough to hold a personal month. The list endpoint paginates and
 * the aggregate would silently undercount past this — the fix is a date-filtered
 * category endpoint backend-side, not a larger number here.
 */
const MONTH_PAGE_SIZE = 500;

/**
 * The month's spending split by category.
 *
 * Aggregated client-side from the month's transactions: the backend's
 * `/summary/categories` takes only a user id and is all-time, so it cannot
 * answer "this month".
 */
export function useCategoryBreakdown(month: string) {
  return useQuery<CategoryBreakdown>({
    queryKey: ["transactions", "category-breakdown", month],
    queryFn: async () => {
      const result = await apiClient.get<TransactionListResult>(
        "/api/transactions",
        {
          params: toStringParams({
            ...monthRange(month),
            size: MONTH_PAGE_SIZE,
          }),
        },
      );

      return toCategoryBreakdown(result.transactions);
    },
  });
}
