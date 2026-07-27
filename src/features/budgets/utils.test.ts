import { describe, it, expect } from "vitest";
import {
  barWidth,
  budgetTotals,
  hasOverallBudget,
  sortBudgets,
  toPeriodStart,
  toTransactionFilters,
} from "./utils";
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

describe("toTransactionFilters", () => {
  it("mirrors the backend's spend query for a category budget", () => {
    expect(toTransactionFilters(budget({}))).toEqual({
      type: "expense",
      categoryId: "33333333-3333-4333-8333-333333333333",
      dateFrom: "2026-07-01",
      dateTo: "2026-07-31",
    });
  });

  it("omits categoryId for the overall budget — every expense counts", () => {
    const filters = toTransactionFilters(budget({ categoryId: null }));

    expect(filters).toEqual({
      type: "expense",
      dateFrom: "2026-07-01",
      dateTo: "2026-07-31",
    });
    expect(filters).not.toHaveProperty("categoryId");
  });

  it.each([
    ["2026-04-01", "2026-04-01", "2026-04-30"],
    ["2026-02-01", "2026-02-01", "2026-02-28"],
    ["2024-02-01", "2024-02-01", "2024-02-29"],
  ])("spans the whole month of %s", (periodStart, dateFrom, dateTo) => {
    const filters = toTransactionFilters(budget({ periodStart }));
    expect(filters.dateFrom).toBe(dateFrom);
    expect(filters.dateTo).toBe(dateTo);
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

describe("hasOverallBudget", () => {
  it("is true when the overall budget stands alone", () => {
    expect(hasOverallBudget([budget({ categoryId: null })])).toBe(true);
  });

  it("is true when it sits alongside category budgets", () => {
    expect(
      hasOverallBudget([budget({}), budget({ categoryId: null }), budget({})]),
    ).toBe(true);
  });

  it("is false for category budgets only", () => {
    expect(hasOverallBudget([budget({}), budget({})])).toBe(false);
  });

  it("is false for an empty period", () => {
    expect(hasOverallBudget([])).toBe(false);
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
