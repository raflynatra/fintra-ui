import { describe, it, expect } from "vitest";
import { budgetSchema, budgetUpdateSchema } from "./schema";

const CATEGORY = "33333333-3333-4333-8333-333333333333";

const valid = {
  categoryId: CATEGORY,
  amount: 500000,
  periodStart: "2026-07-01",
};

describe("budgetSchema", () => {
  it("accepts a category budget", () => {
    expect(budgetSchema.safeParse(valid).success).toBe(true);
  });

  it("accepts a null categoryId — that is the overall budget", () => {
    const result = budgetSchema.safeParse({ ...valid, categoryId: null });
    expect(result.success).toBe(true);
  });

  it("rejects a missing categoryId — null must be explicit", () => {
    expect(
      budgetSchema.safeParse({
        amount: valid.amount,
        periodStart: valid.periodStart,
      }).success,
    ).toBe(false);
  });

  it("rejects a non-uuid categoryId", () => {
    const result = budgetSchema.safeParse({ ...valid, categoryId: "cash" });
    expect(result.success).toBe(false);
  });

  it.each([
    ["zero", 0],
    ["negative", -1],
    ["above the maximum", 1000000000],
  ])("rejects an amount that is %s", (_label, amount) => {
    expect(budgetSchema.safeParse({ ...valid, amount }).success).toBe(false);
  });

  it("accepts the maximum amount", () => {
    const result = budgetSchema.safeParse({ ...valid, amount: 999999999.99 });
    expect(result.success).toBe(true);
  });

  it.each(["2026-07", "07-2026", "2026/07/01", ""])(
    "rejects the periodStart %s",
    (periodStart) => {
      expect(budgetSchema.safeParse({ ...valid, periodStart }).success).toBe(
        false,
      );
    },
  );
});

describe("budgetUpdateSchema", () => {
  it("accepts an amount alone", () => {
    expect(budgetUpdateSchema.safeParse({ amount: 250000 }).success).toBe(true);
  });

  it("applies the same amount bounds", () => {
    expect(budgetUpdateSchema.safeParse({ amount: 0 }).success).toBe(false);
  });
});
