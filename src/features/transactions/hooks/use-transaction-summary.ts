import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { toStringParams } from "@/features/transactions/utils";
import type {
  TransactionListParams,
  TransactionSummary,
} from "@/features/transactions/types";

/**
 * Fetches the summary totals. The backend currently scopes `getSummary` to the
 * user alone, so the returned totals are all-time and ignore every param sent.
 */
export function useTransactionSummary(params: TransactionListParams) {
  return useQuery({
    queryKey: ["transactions", "summary", params],
    queryFn: () =>
      apiClient.get<TransactionSummary>("/api/transactions/summary", {
        params: toStringParams(params),
      }),
  });
}
