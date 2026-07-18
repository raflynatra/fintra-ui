import * as z from "zod";

export const TRANSACTION_TYPES = ["income", "expense", "transfer"] as const;

/**
 * The form's field set, flat and unconditional.
 *
 * Kept as a plain ZodObject and exported separately for two reasons:
 *  - `transactionUpdateSchema` needs `.partial()`, which only exists here —
 *    attaching a refinement below produces a schema without it.
 *  - react-hook-form needs ONE stable field set. Modelling the create body's
 *    `oneOf` as a `z.discriminatedUnion` would make `useForm<T>` generic over a
 *    union, so `name="categoryId"` stops being a valid path on the transfer arm
 *    and `errors`/`setValue`/`useWatch` all degrade into unions. The conditional
 *    rules live in `.superRefine` instead, and the arm-specific wire shape is
 *    built at the mutation boundary by `toWritePayload`.
 */
export const transactionFields = z.object({
  type: z.enum(TRANSACTION_TYPES),
  amount: z
    .number()
    .gt(0, "Enter an amount greater than 0")
    .max(999999999.99, "Amount is too large"),
  // Required by the backend on every create — a transaction always moves money
  // in or out of a specific account.
  accountId: z.uuid("Pick an account"),
  // Conditionally required; see the superRefine below. Income and expense need
  // a category and no destination; a transfer is the exact inverse.
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
        // Mirrors the backend's TRANSFER_SAME_ACCOUNT (422) so it never has to
        // round-trip to find out.
        ctx.addIssue({
          code: "custom",
          path: ["toAccountId"],
          message: "Pick a different destination account",
        });
      }
      return;
    }

    // Required client-side for UX (the sheet always shows a category picker),
    // even though the backend itself allows omitting it (uncategorized).
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
