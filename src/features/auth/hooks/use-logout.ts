import { useMutation } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { useAuthStore } from "@/features/auth/store";

export function useLogout() {
  return useMutation({
    mutationFn: () => apiClient.post("/api/auth/logout", {}),
    // Clear client auth state whether or not the network call succeeds.
    onSettled: () => useAuthStore.getState().logout(),
  });
}
