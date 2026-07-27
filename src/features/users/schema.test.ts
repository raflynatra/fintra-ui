import { describe, it, expect } from "vitest";
import { profileSchema } from "./schema";

describe("profileSchema", () => {
  it("accepts a name", () => {
    expect(profileSchema.safeParse({ name: "Rafly" }).success).toBe(true);
  });

  it("trims surrounding whitespace", () => {
    const result = profileSchema.safeParse({ name: "  Rafly  " });
    expect(result.success && result.data.name).toBe("Rafly");
  });

  it("rejects an empty name", () => {
    expect(profileSchema.safeParse({ name: "" }).success).toBe(false);
  });

  it("rejects a name that is only whitespace", () => {
    expect(profileSchema.safeParse({ name: "   " }).success).toBe(false);
  });

  it("rejects a name over 100 characters", () => {
    expect(profileSchema.safeParse({ name: "a".repeat(101) }).success).toBe(
      false,
    );
  });

  it("ignores an email — the backend won't accept one", () => {
    const result = profileSchema.safeParse({
      name: "Rafly",
      email: "new@example.com",
    });
    expect(result.success && "email" in result.data).toBe(false);
  });
});
