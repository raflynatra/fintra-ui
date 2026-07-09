import * as z from "zod";

/**
 * Server-only environment validation.
 *
 * Do NOT import this module from Client Components: it reads server-only
 * variables and throws at import time when they are missing or malformed,
 * which fails the build fast instead of surfacing as `undefined/api/...`
 * fetch errors at runtime. Client-safe values belong in `@/lib/constants`.
 */
const serverEnvSchema = z.object({
  BACKEND_API_URL: z.url(),
});

const parsed = serverEnvSchema.safeParse({
  BACKEND_API_URL: process.env.BACKEND_API_URL,
});

if (!parsed.success) {
  const issues = parsed.error.issues
    .map((issue) => `  - ${issue.path.join(".") || "(root)"}: ${issue.message}`)
    .join("\n");
  throw new Error(`Invalid server environment variables:\n${issues}`);
}

export const env = parsed.data;
export const API_URL = env.BACKEND_API_URL;
