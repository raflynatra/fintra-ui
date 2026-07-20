import * as z from "zod";

export const ACCOUNT_TYPES = ["cash", "bank", "ewallet", "credit_card"] as const;

export const accountSchema = z.object({
  name: z.string().min(1, "Name your account").max(100, "Keep it under 100 characters"),
  type: z.enum(ACCOUNT_TYPES),
  initialBalance: z
    .number()
    .min(-999999999.99, "Amount is too large")
    .max(999999999.99, "Amount is too large")
    .optional(),
});

export const accountUpdateSchema = accountSchema.partial().extend({
  isArchived: z.boolean().optional(),
});
