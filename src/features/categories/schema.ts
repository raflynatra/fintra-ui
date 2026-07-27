import * as z from "zod";

export const CATEGORY_TYPES = ["income", "expense"] as const;

export const categorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Name your category")
    .max(100, "Keep it under 100 characters"),
  type: z.enum(CATEGORY_TYPES),
});
