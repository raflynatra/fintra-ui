import { describe, it, expect } from "vitest";
import { transactionFormSchema } from "./schema";

const ACCOUNT = "11111111-1111-4111-8111-111111111111";
const OTHER_ACCOUNT = "22222222-2222-4222-8222-222222222222";
const CATEGORY = "33333333-3333-4333-8333-333333333333";

const base = { amount: 50000, date: "2026-07-17" };

/** Reports the paths every issue was raised against. */
function errorPaths(result: { success: boolean; error?: { issues: unknown[] } }) {
  if (result.success) return [];
  return (result.error!.issues as { path: (string | number)[] }[]).map((i) =>
    i.path.join("."),
  );
}

describe("transactionFormSchema", () => {
  describe("income and expense", () => {
    it("accepts a fully specified expense", () => {
      const result = transactionFormSchema.safeParse({
        ...base,
        type: "expense",
        accountId: ACCOUNT,
        categoryId: CATEGORY,
      });
      expect(result.success).toBe(true);
    });

    it("rejects one without a category, reporting it on that field", () => {
      const result = transactionFormSchema.safeParse({
        ...base,
        type: "income",
        accountId: ACCOUNT,
      });
      expect(result.success).toBe(false);
      expect(errorPaths(result)).toContain("categoryId");
    });

    it("rejects one without an account", () => {
      const result = transactionFormSchema.safeParse({
        ...base,
        type: "expense",
        categoryId: CATEGORY,
      });
      expect(result.success).toBe(false);
      expect(errorPaths(result)).toContain("accountId");
    });
  });

  describe("transfer", () => {
    it("accepts one between two different accounts", () => {
      const result = transactionFormSchema.safeParse({
        ...base,
        type: "transfer",
        accountId: ACCOUNT,
        toAccountId: OTHER_ACCOUNT,
      });
      expect(result.success).toBe(true);
    });

    it("passes without a category — transfers carry none", () => {
      const result = transactionFormSchema.safeParse({
        ...base,
        type: "transfer",
        accountId: ACCOUNT,
        toAccountId: OTHER_ACCOUNT,
        categoryId: "",
      });
      expect(result.success).toBe(true);
    });

    it("rejects one without a destination, reporting it on that field", () => {
      const result = transactionFormSchema.safeParse({
        ...base,
        type: "transfer",
        accountId: ACCOUNT,
      });
      expect(result.success).toBe(false);
      expect(errorPaths(result)).toContain("toAccountId");
    });

    it("rejects a destination equal to the source (TRANSFER_SAME_ACCOUNT)", () => {
      const result = transactionFormSchema.safeParse({
        ...base,
        type: "transfer",
        accountId: ACCOUNT,
        toAccountId: ACCOUNT,
      });
      expect(result.success).toBe(false);
      expect(errorPaths(result)).toContain("toAccountId");
    });
  });

  it("rejects a type the backend doesn't define", () => {
    const result = transactionFormSchema.safeParse({
      ...base,
      type: "refund",
      accountId: ACCOUNT,
      categoryId: CATEGORY,
    });
    expect(result.success).toBe(false);
  });

  it("rejects a non-positive amount", () => {
    const result = transactionFormSchema.safeParse({
      ...base,
      amount: 0,
      type: "expense",
      accountId: ACCOUNT,
      categoryId: CATEGORY,
    });
    expect(result.success).toBe(false);
  });
});
