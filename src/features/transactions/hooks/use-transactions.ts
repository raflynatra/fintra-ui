import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type {
  TransactionListParams,
  TransactionListResult,
} from "@/features/transactions/types";

function toStringParams(
  params: TransactionListParams,
): Record<string, string> {
  const result: Record<string, string> = {};

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) result[key] = String(value);
  }

  return result;
}

export function useTransactions(params: TransactionListParams) {
  return useQuery({
    queryKey: ["transactions", params],
    queryFn: () =>
      apiClient.get<TransactionListResult>("/api/transactions", {
        params: toStringParams(params),
      }),
  });
}
