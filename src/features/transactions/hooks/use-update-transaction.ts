import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { toWritePayload } from "@/features/transactions/utils";
import type {
  Transaction,
  TransactionFormValues,
} from "@/features/transactions/types";

export function useUpdateTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      values,
    }: {
      id: string;
      values: TransactionFormValues;
    }) =>
      apiClient.put<Transaction>(
        `/api/transactions/${id}`,
        toWritePayload(values),
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
    },
  });
}
