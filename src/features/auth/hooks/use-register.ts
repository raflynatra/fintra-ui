import { useMutation } from "@tanstack/react-query";
import { apiClient, ApiClientError } from "@/lib/api-client";
import { useAuthStore } from "@/features/auth/store";
import type {
  LoginData,
  RegisterPayload,
} from "@/features/auth/types";

/**
 * Thrown when the account was created but the follow-up sign-in failed. The
 * caller must route to login with a success message rather than reporting a
 * failed signup — the account exists.
 */
export class RegisteredButSignInFailedError extends Error {
  constructor() {
    super("Your account was created. Please sign in.");
    this.name = "RegisteredButSignInFailedError";
  }
}

/**
 * Registers, then signs in with the same credentials. The chain lives here so no
 * call site can ship a half-signed-in user: `POST /api/auth/register` answers 204
 * and issues no token.
 */
export function useRegister() {
  const setUser = useAuthStore((s) => s.setUser);

  return useMutation({
    mutationFn: async ({ name, email, password }: RegisterPayload) => {
      await apiClient.post<null>("/api/auth/register", {
        name,
        email,
        password,
      });

      try {
        return await apiClient.post<LoginData>("/api/auth/login", {
          email,
          password,
        });
      } catch (error) {
        if (error instanceof ApiClientError) {
          throw new RegisteredButSignInFailedError();
        }
        throw error;
      }
    },
    onSuccess: (data) => setUser(data.user, data.token),
  });
}
