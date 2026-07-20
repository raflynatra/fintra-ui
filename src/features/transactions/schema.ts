import * as z from "zod";

export const TRANSACTION_TYPES = ["income", "expense", "transfer"] as const;

export const transactionFields = z.object({
  type: z.enum(TRANSACTION_TYPES),
  amount: z
    .number()
    .gt(0, "Enter an amount greater than 0")
    .max(999999999.99, "Amount is too large"),
  accountId: z.uuid("Pick an account"),
  categoryId: z.string().optional(),
  toAccountId: z.string().optional(),
  description: z.string().max(500, "Keep it under 500 characters").optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Pick a date"),
});

export const transactionFormSchema = transactionFields.superRefine(
  (values, ctx) => {
    if (values.type === "transfer") {
      if (!values.toAccountId) {
        ctx.addIssue({
          code: "custom",
          path: ["toAccountId"],
          message: "Pick a destination account",
        });
      } else if (values.toAccountId === values.accountId) {
        ctx.addIssue({
          code: "custom",
          path: ["toAccountId"],
          message: "Pick a different destination account",
        });
      }
      return;
    }

    if (!values.categoryId) {
      ctx.addIssue({
        code: "custom",
        path: ["categoryId"],
        message: "Pick a category",
      });
    }
  },
);

export const transactionUpdateSchema = transactionFields.partial().extend({
  categoryId: z.uuid().nullable().optional(),
});
