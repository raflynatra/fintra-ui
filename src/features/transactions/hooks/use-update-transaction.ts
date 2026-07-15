import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type {
  Transaction,
  TransactionUpdatePayload,
} from "@/features/transactions/types";

export function useUpdateTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: TransactionUpdatePayload;
    }) => apiClient.put<Transaction>(`/api/transactions/${id}`, payload),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["transactions"] }),
  });
}
