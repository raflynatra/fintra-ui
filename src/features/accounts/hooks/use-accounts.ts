import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { Account, AccountListParams } from "@/features/accounts/types";

export function useAccounts({
  includeArchived = false,
}: AccountListParams = {}) {
  return useQuery({
    queryKey: ["accounts", { includeArchived }],
    queryFn: () =>
      apiClient.get<Account[]>("/api/accounts", {
        // The backend's enum is the strings "true" | "false", not a boolean.
        params: { includeArchived: String(includeArchived) },
      }),
  });
}
