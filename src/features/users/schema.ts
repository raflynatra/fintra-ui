import * as z from "zod";

/**
 * `PUT /api/users/me` accepts a name and nothing else — the backend's
 * `updateMeSchema` has no email field and `updateById` only ever builds a
 * `name` clause, so email is read-only by contract.
 */
export const profileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Name can't be empty")
    .max(100, "Keep it under 100 characters"),
});
