import { useMutation } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { toChangePasswordPayload } from "@/features/auth/utils";
import type { ChangePasswordFormValues } from "@/features/auth/types";

/**
 * Changes the password. The backend revokes every refresh token and clears the
 * cookie before returning 204, so the session is dead on success — the caller
 * signs out rather than carrying on with a token that can no longer refresh.
 *
 * The form→wire narrowing happens here so no call site can post the
 * confirmation field by accident.
 */
export function useChangePassword() {
  return useMutation({
    mutationFn: (values: ChangePasswordFormValues) =>
      apiClient.patch<void>(
        "/api/auth/password",
        toChangePasswordPayload(values),
      ),
  });
}
