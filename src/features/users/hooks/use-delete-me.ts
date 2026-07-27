import { useMutation } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

/**
 * Deletes the signed-in user. Terminal — nothing is left to invalidate, and the
 * caller signs out rather than returning to a shell with no account behind it.
 */
export function useDeleteMe() {
  return useMutation({
    mutationFn: () => apiClient.delete<void>("/api/users/me"),
  });
}
