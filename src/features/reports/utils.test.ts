import { describe, it, expect } from "vitest";
import type { Transaction } from "@/features/transactions/types";
import { toCategoryBreakdown } from "./utils";

function tx(overrides: Partial<Transaction>): Transaction {
  return {
    id: "t1",
    userId: "u1",
    type: "expense",
    amount: 1000,
    categoryId: "c1",
    category: "Food",
    accountId: "a1",
    account: "Cash",
    toAccountId: null,
    toAccount: null,
    description: null,
    date: "2026-09-04",
    createdAt: "2026-09-04",
    updatedAt: "2026-09-04",
    ...overrides,
  };
}

describe("toCategoryBreakdown", () => {
  it("totals each category and sorts largest first", () => {
    const { slices, total } = toCategoryBreakdown([
      tx({ categoryId: "c1", category: "Food", amount: 1000 }),
      tx({ categoryId: "c2", category: "Rent", amount: 5000 }),
      tx({ categoryId: "c1", category: "Food", amount: 500 }),
    ]);

    expect(slices.map((slice) => [slice.label, slice.total])).toEqual([
      ["Rent", 5000],
      ["Food", 1500],
    ]);
    expect(total).toBe(6500);
  });

  it("excludes transfers — money moved between your own accounts is not spending", () => {
    const { slices, total } = toCategoryBreakdown([
      tx({ amount: 1000 }),
      tx({ type: "transfer", amount: 9000, categoryId: null, category: null }),
    ]);

    expect(slices).toHaveLength(1);
    expect(total).toBe(1000);
  });

  it("keeps income out of the expense breakdown", () => {
    const { slices } = toCategoryBreakdown([
      tx({ amount: 1000 }),
      tx({ type: "income", amount: 8000, categoryId: "c9", category: "Salary" }),
    ]);

    expect(slices.map((slice) => slice.label)).toEqual(["Food"]);
  });

  it("reads income when asked for it", () => {
    const { slices } = toCategoryBreakdown(
      [
        tx({ amount: 1000 }),
        tx({
          type: "income",
          amount: 8000,
          categoryId: "c9",
          category: "Salary",
        }),
      ],
      { type: "income" },
    );

    expect(slices.map((slice) => slice.label)).toEqual(["Salary"]);
  });

  it("collapses uncategorised spending into one labelled bucket", () => {
    const { slices } = toCategoryBreakdown([
      tx({ categoryId: null, category: null, amount: 300 }),
      tx({ categoryId: null, category: null, amount: 200 }),
    ]);

    expect(slices).toEqual([
      expect.objectContaining({ label: "Uncategorized", total: 500 }),
    ]);
  });

  it("gives every slice a share, and the shares sum to 100", () => {
    const { slices } = toCategoryBreakdown([
      tx({ categoryId: "c1", category: "Food", amount: 750 }),
      tx({ categoryId: "c2", category: "Rent", amount: 250 }),
    ]);

    expect(slices.map((slice) => slice.share)).toEqual([75, 25]);
    expect(slices.reduce((sum, slice) => sum + slice.share, 0)).toBe(100);
  });

  it("folds everything past the slice limit into one remainder", () => {
    const { slices } = toCategoryBreakdown(
      [
        tx({ categoryId: "c1", category: "A", amount: 500 }),
        tx({ categoryId: "c2", category: "B", amount: 400 }),
        tx({ categoryId: "c3", category: "C", amount: 30 }),
        tx({ categoryId: "c4", category: "D", amount: 20 }),
      ],
      { maxSlices: 2 },
    );

    expect(slices.map((slice) => [slice.label, slice.total])).toEqual([
      ["A", 500],
      ["B", 400],
      ["Other", 50],
    ]);
  });

  it("does not fold when the categories fit exactly", () => {
    const { slices } = toCategoryBreakdown(
      [
        tx({ categoryId: "c1", category: "A", amount: 500 }),
        tx({ categoryId: "c2", category: "B", amount: 400 }),
      ],
      { maxSlices: 2 },
    );

    expect(slices.map((slice) => slice.label)).toEqual(["A", "B"]);
  });

  it("returns nothing for an empty month, without dividing by zero", () => {
    const { slices, total } = toCategoryBreakdown([]);

    expect(slices).toEqual([]);
    expect(total).toBe(0);
  });

  it("returns nothing when the month holds only transfers", () => {
    const { slices, total } = toCategoryBreakdown([
      tx({ type: "transfer", amount: 9000, categoryId: null, category: null }),
    ]);

    expect(slices).toEqual([]);
    expect(total).toBe(0);
  });
});
