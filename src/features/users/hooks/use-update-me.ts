import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { ProfilePayload, User } from "@/features/users/types";

export function useUpdateMe() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ProfilePayload) =>
      apiClient.put<User>("/api/users/me", payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["users"] }),
  });
}
