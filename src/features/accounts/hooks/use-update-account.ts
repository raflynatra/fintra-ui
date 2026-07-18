import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { Account, AccountUpdatePayload } from "@/features/accounts/types";

export function useUpdateAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: AccountUpdatePayload;
    }) => apiClient.put<Account>(`/api/accounts/${id}`, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      // A rename changes the account name resolved onto every transaction row,
      // and an initialBalance edit shifts the balance.
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    },
  });
}
