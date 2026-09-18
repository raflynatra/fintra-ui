import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { MonthRange } from "@/lib/date";
import type { TransactionSummary } from "@/features/transactions/types";

/** Fetches the income, expense and net totals for the given date range. */
export function useTransactionSummary(range: MonthRange) {
  return useQuery({
    queryKey: ["transactions", "summary", range],
    queryFn: () =>
      apiClient.get<TransactionSummary>(
        "/api/transactions/summary/date-range",
        { params: range },
      ),
  });
}
