import { useMutation } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { useAuthStore } from "@/stores/auth-store";
import type { LoginData, LoginPayload } from "@/types/auth";

export function useLogin() {
  const setUser = useAuthStore((s) => s.setUser);

  return useMutation({
    mutationFn: (values: LoginPayload) =>
      apiClient.post<LoginData>("/api/auth/login", values),
    onSuccess: (data) => setUser(data.user, data.token),
  });
}
