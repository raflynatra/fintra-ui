import { useMutation } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { useAuthStore } from "@/features/auth/store";

export function useLogout() {
  return useMutation({
    mutationFn: () => apiClient.post("/api/auth/logout", {}),
    onSettled: () => useAuthStore.getState().logout(),
  });
}
