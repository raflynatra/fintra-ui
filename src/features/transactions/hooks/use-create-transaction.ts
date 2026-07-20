import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { toWritePayload } from "@/features/transactions/utils";
import type {
  Transaction,
  TransactionFormValues,
} from "@/features/transactions/types";

export function useCreateTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: TransactionFormValues) =>
      apiClient.post<Transaction>("/api/transactions", toWritePayload(values)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
    },
  });
}
