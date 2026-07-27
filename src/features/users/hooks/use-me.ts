import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type { User } from "@/features/users/types";

/** The signed-in user's profile. */
export function useMe() {
  return useQuery({
    queryKey: ["users", "me"],
    queryFn: () => apiClient.get<User>("/api/users/me"),
  });
}
