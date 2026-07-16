import { useInfiniteQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { toStringParams } from "@/features/transactions/utils";
import type {
  TransactionListParams,
  TransactionListResult,
} from "@/features/transactions/types";

export function useTransactions(params: Omit<TransactionListParams, "page">) {
  return useInfiniteQuery({
    queryKey: ["transactions", params],
    queryFn: ({ pageParam }) =>
      apiClient.get<TransactionListResult>("/api/transactions", {
        params: toStringParams({ ...params, page: pageParam }),
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.pagination.hasNextPage
        ? lastPage.pagination.page + 1
        : undefined,
  });
}
