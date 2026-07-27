import * as z from "zod";
import type { profileSchema } from "./schema";

/**
 * The profile shape from `GET /api/users/me`. Deliberately separate from the
 * `User` in `@/features/auth/types`, which is the *session* shape — that one
 * comes from `AuthResponse.user`, a `Pick` of email and name with no id.
 */
export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

export type ProfilePayload = z.infer<typeof profileSchema>;
