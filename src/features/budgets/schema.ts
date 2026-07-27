import * as z from "zod";

/** Mirrors the backend's `amountFieldSchema` so common errors don't round-trip. */
const amountSchema = z
  .number()
  .positive("Amount must be greater than 0")
  .max(999999999.99, "Amount is too large");

export const budgetSchema = z.object({
  /** `null` is the overall budget, not an absent value. */
  categoryId: z.uuid("Pick a category").nullable(),
  amount: amountSchema,
  periodStart: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Period must be a YYYY-MM-DD date"),
});

/** `PUT /api/budgets/{id}` accepts an amount and nothing else. */
export const budgetUpdateSchema = budgetSchema.pick({ amount: true });
