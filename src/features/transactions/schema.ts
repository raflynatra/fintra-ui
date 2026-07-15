import * as z from "zod";

export const transactionSchema = z.object({
  type: z.enum(["income", "expense"]),
  amount: z
    .number()
    .gt(0, "Enter an amount greater than 0")
    .max(999999999.99, "Amount is too large"),
  // Required client-side for UX (the sheet always shows a category picker),
  // even though the backend itself allows omitting it (uncategorized).
  categoryId: z.uuid("Pick a category"),
  description: z.string().max(500, "Keep it under 500 characters").optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Pick a date"),
});

export const transactionUpdateSchema = transactionSchema.partial().extend({
  categoryId: z.uuid().nullable().optional(),
});
