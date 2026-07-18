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
    // Takes the form's flat values and narrows them here, so a field left over
    // from a type the user toggled away from can't reach the backend.
    mutationFn: (values: TransactionFormValues) =>
      apiClient.post<Transaction>("/api/transactions", toWritePayload(values)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      // Balances are derived server-side, so any write moves them.
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
    },
  });
}
