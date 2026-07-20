import { describe, it, expect } from "vitest";
import { accountSchema, accountUpdateSchema } from "./schema";

describe("accountSchema", () => {
  it("accepts a valid account", () => {
    const result = accountSchema.safeParse({
      name: "Cash",
      type: "cash",
      initialBalance: 100000,
    });
    expect(result.success).toBe(true);
  });

  it("accepts an account without a starting balance", () => {
    const result = accountSchema.safeParse({ name: "Cash", type: "cash" });
    expect(result.success).toBe(true);
  });

  it("accepts a negative starting balance", () => {
    const result = accountSchema.safeParse({
      name: "Visa",
      type: "credit_card",
      initialBalance: -500000,
    });
    expect(result.success).toBe(true);
  });

  it("rejects an empty name", () => {
    const result = accountSchema.safeParse({ name: "", type: "cash" });
    expect(result.success).toBe(false);
  });

  it("rejects a name longer than 100 characters", () => {
    const result = accountSchema.safeParse({
      name: "a".repeat(101),
      type: "cash",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a type the backend doesn't define", () => {
    const result = accountSchema.safeParse({ name: "Crypto", type: "bitcoin" });
    expect(result.success).toBe(false);
  });

  it("rejects a starting balance beyond the backend's bounds", () => {
    const result = accountSchema.safeParse({
      name: "Cash",
      type: "cash",
      initialBalance: 1000000000,
    });
    expect(result.success).toBe(false);
  });
});

describe("accountUpdateSchema", () => {
  it("accepts a partial update", () => {
    const result = accountUpdateSchema.safeParse({ name: "Petty cash" });
    expect(result.success).toBe(true);
  });

  it("accepts un-archiving on its own", () => {
    const result = accountUpdateSchema.safeParse({ isArchived: false });
    expect(result.success).toBe(true);
  });

  it("still enforces field rules when a field is present", () => {
    const result = accountUpdateSchema.safeParse({ name: "" });
    expect(result.success).toBe(false);
  });
});
