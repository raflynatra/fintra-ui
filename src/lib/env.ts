import * as z from "zod";

/**
 * Server-only environment validation. Throws at import time if variables are
 * missing or malformed. Do not import from Client Components.
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
