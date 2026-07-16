import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { toStringParams } from "@/features/transactions/utils";
import type {
  TransactionListParams,
  TransactionSummary,
} from "@/features/transactions/types";

export function useTransactionSummary(params: TransactionListParams) {
  return useQuery({
    queryKey: ["transactions", "summary", params],
    queryFn: () =>
      apiClient.get<TransactionSummary>("/api/transactions/summary", {
        params: toStringParams(params),
      }),
  });
}
