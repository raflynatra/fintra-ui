import { describe, it, expect } from "vitest";
import { barWidth, budgetTotals, sortBudgets, toPeriodStart } from "./utils";
import type { BudgetProgress } from "./types";

function budget(overrides: Partial<BudgetProgress>): BudgetProgress {
  return {
    id: "b1",
    categoryId: "33333333-3333-4333-8333-333333333333",
    category: "Food",
    amount: 100000,
    periodType: "monthly",
    periodStart: "2026-07-01",
    createdAt: "2026-07-01T00:00:00.000Z",
    updatedAt: "2026-07-01T00:00:00.000Z",
    spent: 0,
    remaining: 100000,
    percentUsed: 0,
    isOverBudget: false,
    ...overrides,
  };
}

describe("toPeriodStart", () => {
  it("expands a period to the first of the month the backend normalizes to", () => {
    expect(toPeriodStart("2026-07")).toBe("2026-07-01");
  });
});

describe("barWidth", () => {
  it("passes through a percentage within range", () => {
    expect(barWidth(42)).toBe(42);
  });

  it("clamps an overspent budget at 100", () => {
    expect(barWidth(137)).toBe(100);
  });

  it("clamps a negative percentage at 0", () => {
    expect(barWidth(-5)).toBe(0);
  });
});

describe("sortBudgets", () => {
  it("pins the overall budget first, then orders by percent used", () => {
    const sorted = sortBudgets([
      budget({ id: "food", percentUsed: 20 }),
      budget({ id: "overall", categoryId: null, category: null }),
      budget({ id: "transport", percentUsed: 80 }),
    ]);

    expect(sorted.map((item) => item.id)).toEqual([
      "overall",
      "transport",
      "food",
    ]);
  });

  it("does not mutate its input", () => {
    const input = [
      budget({ id: "food", percentUsed: 20 }),
      budget({ id: "overall", categoryId: null }),
    ];
    sortBudgets(input);
    expect(input.map((item) => item.id)).toEqual(["food", "overall"]);
  });
});

describe("budgetTotals", () => {
  it("sums the category budgets", () => {
    const totals = budgetTotals([
      budget({ amount: 100000, spent: 40000 }),
      budget({ amount: 50000, spent: 10000 }),
    ]);
    expect(totals).toEqual({ budgeted: 150000, spent: 50000 });
  });

  it("excludes the overall budget, which would double-count every expense", () => {
    const totals = budgetTotals([
      budget({ categoryId: null, amount: 999999, spent: 50000 }),
      budget({ amount: 100000, spent: 40000 }),
    ]);
    expect(totals).toEqual({ budgeted: 100000, spent: 40000 });
  });

  it("returns zeroes when there are no budgets", () => {
    expect(budgetTotals([])).toEqual({ budgeted: 0, spent: 0 });
  });
});
