import { describe, it, expect } from "vitest";
import { categorySchema } from "./schema";

describe("categorySchema", () => {
  it.each(["income", "expense"])("accepts the %s type", (type) => {
    const result = categorySchema.safeParse({ name: "Coffee", type });
    expect(result.success).toBe(true);
  });

  it("trims surrounding whitespace", () => {
    const result = categorySchema.safeParse({
      name: "  Coffee  ",
      type: "expense",
    });
    expect(result.success && result.data.name).toBe("Coffee");
  });

  it("rejects an empty name", () => {
    expect(
      categorySchema.safeParse({ name: "", type: "expense" }).success,
    ).toBe(false);
  });

  it("rejects a name over 100 characters", () => {
    const result = categorySchema.safeParse({
      name: "a".repeat(101),
      type: "expense",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a type outside the enum — transfers carry no category", () => {
    const result = categorySchema.safeParse({
      name: "Coffee",
      type: "transfer",
    });
    expect(result.success).toBe(false);
  });
});
