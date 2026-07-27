import type {
  ChangePasswordFormValues,
  ChangePasswordPayload,
} from "@/features/auth/types";

/**
 * Narrows the form values to the wire shape. The confirmation is a client-side
 * concern and the backend's schema has no field for it.
 */
export function toChangePasswordPayload({
  currentPassword,
  newPassword,
}: ChangePasswordFormValues): ChangePasswordPayload {
  return { currentPassword, newPassword };
}
