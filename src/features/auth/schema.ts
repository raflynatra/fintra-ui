import * as z from "zod";

/**
 * The backend's rules for a password being *set*, one entry each so the form can
 * tick them off as they're met. `passwordSchema` is built from this array, so
 * the checklist and the validation can never disagree.
 */
export const PASSWORD_RULES = [
  {
    id: "length",
    label: "At least 8 characters",
    test: (value: string) => value.length >= 8,
  },
  {
    id: "lowercase",
    label: "A lowercase letter",
    test: (value: string) => /[a-z]/.test(value),
  },
  {
    id: "uppercase",
    label: "An uppercase letter",
    test: (value: string) => /[A-Z]/.test(value),
  },
  {
    id: "number",
    label: "A number",
    test: (value: string) => /\d/.test(value),
  },
] as const;

/** Used by change-password, and by register once that ships. */
export const passwordSchema = z
  .string()
  .max(100, "Keep it under 100 characters")
  .superRefine((value, ctx) => {
    for (const rule of PASSWORD_RULES) {
      if (!rule.test(value)) {
        ctx.addIssue({ code: "custom", message: rule.label });
      }
    }
  });

/**
 * Login deliberately enforces the full `passwordSchema` rules, not the backend's
 * laxer `min(1)`. The trade-off: an account whose password predates those rules
 * can no longer submit this form and must be reset out of band. Chosen so the
 * app states one password standard rather than two.
 */
export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: passwordSchema,
});

/** Mirrors the backend's register rules so the common mistakes never round-trip. */
export const registerSchema = z.object({
  name: z
    .string()
    .min(1, "Enter your name")
    .max(100, "Keep it under 100 characters"),
  email: z
    .string()
    .email("Invalid email address")
    .max(255, "Keep it under 255 characters"),
  password: passwordSchema,
});

export const changePasswordFormSchema = z
  .object({
    currentPassword: z.string().min(1, "Enter your current password"),
    newPassword: passwordSchema,
    confirmPassword: z.string().min(1, "Re-enter your new password"),
  })
  .superRefine((values, ctx) => {
    if (
      values.confirmPassword &&
      values.newPassword !== values.confirmPassword
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["confirmPassword"],
        message: "Passwords don't match",
      });
    }
  });
