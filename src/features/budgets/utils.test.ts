import { describe, it, expect } from "vitest";
import {
  barWidth,
  budgetTotals,
  budgetsNeedingAttention,
  hasOverallBudget,
  monthElapsedPercent,
  sortBudgets,
  spendBreakdown,
  spendingPace,
  toPeriodStart,
  toTransactionFilters,
  unbudgetedSpend,
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

describe("unbudgetedSpend", () => {
  it("is the overall spend minus what the category budgets account for", () => {
    expect(
      unbudgetedSpend([
        budget({ categoryId: null, spent: 800000 }),
        budget({ spent: 400000 }),
        budget({ id: "b2", spent: 100000 }),
      ]),
    ).toBe(300000);
  });

  it("is null without an overall budget — the month total is unknowable", () => {
    expect(unbudgetedSpend([budget({ spent: 400000 })])).toBeNull();
  });

  it("is zero when every expense sits inside a category budget", () => {
    expect(
      unbudgetedSpend([
        budget({ categoryId: null, spent: 400000 }),
        budget({ spent: 400000 }),
      ]),
    ).toBe(0);
  });

  it("absorbs floating-point drift in either direction", () => {
    // 0.1 + 0.2 sums to 0.30000000000000004, so the categories overshoot.
    expect(
      unbudgetedSpend([
        budget({ categoryId: null, spent: 0.3 }),
        budget({ id: "a", spent: 0.1 }),
        budget({ id: "b", spent: 0.2 }),
      ]),
    ).toBe(0);

    // ...and undershoot, which would otherwise leave a truthy Rp0 remainder.
    expect(
      unbudgetedSpend([
        budget({ categoryId: null, spent: 0.1 + 0.2 }),
        budget({ spent: 0.3 }),
      ]),
    ).toBe(0);
  });
});

describe("spendBreakdown", () => {
  it("orders categories by spend and appends the remainder last", () => {
    const segments = spendBreakdown([
      budget({ categoryId: null, spent: 1000000 }),
      budget({ id: "food", category: "Food", spent: 250000 }),
      budget({ id: "transport", category: "Transport", spent: 500000 }),
    ]);

    expect(segments.map((segment) => segment.label)).toEqual([
      "Transport",
      "Food",
      "Everything else",
    ]);
    expect(segments.map((segment) => segment.amount)).toEqual([
      500000, 250000, 250000,
    ]);
  });

  it("gives shares that sum to one", () => {
    const segments = spendBreakdown([
      budget({ categoryId: null, spent: 1000000 }),
      budget({ spent: 250000 }),
    ]);

    const total = segments.reduce((sum, segment) => sum + segment.share, 0);
    expect(total).toBeCloseTo(1);
  });

  it("marks only the remainder segment", () => {
    const segments = spendBreakdown([
      budget({ categoryId: null, spent: 1000000 }),
      budget({ spent: 250000 }),
    ]);

    expect(segments.filter((segment) => segment.isRemainder)).toHaveLength(1);
    expect(segments.at(-1)?.isRemainder).toBe(true);
  });

  it("omits the remainder without an overall budget", () => {
    const segments = spendBreakdown([
      budget({ id: "food", category: "Food", spent: 250000 }),
    ]);

    expect(segments).toHaveLength(1);
    expect(segments[0].share).toBe(1);
  });

  it("drops categories with no spend", () => {
    const segments = spendBreakdown([
      budget({ id: "food", category: "Food", spent: 250000 }),
      budget({ id: "idle", category: "Idle", spent: 0 }),
    ]);

    expect(segments.map((segment) => segment.label)).toEqual(["Food"]);
  });

  it("folds the tail once the palette runs out rather than reusing a hue", () => {
    const many = Array.from({ length: 9 }, (_, index) =>
      budget({
        id: `c${index}`,
        category: `Category ${index}`,
        spent: (9 - index) * 10000,
      }),
    );

    const segments = spendBreakdown(many);

    expect(segments).toHaveLength(7);
    expect(segments.at(-1)?.label).toBe("Other categories");
    // The three smallest: 3 + 2 + 1 tens of thousands.
    expect(segments.at(-1)?.amount).toBe(60000);
  });

  it("does not fold when the categories fit", () => {
    const six = Array.from({ length: 6 }, (_, index) =>
      budget({ id: `c${index}`, category: `Category ${index}`, spent: 10000 }),
    );

    const segments = spendBreakdown(six);

    expect(segments).toHaveLength(6);
    expect(
      segments.some((segment) => segment.label === "Other categories"),
    ).toBe(false);
  });

  it("is empty when nothing has been spent", () => {
    expect(spendBreakdown([budget({ spent: 0 })])).toEqual([]);
    expect(spendBreakdown([])).toEqual([]);
  });
});

describe("budgetsNeedingAttention", () => {
  it("splits over from near, worst first in each", () => {
    const { over, near } = budgetsNeedingAttention([
      budget({ id: "ok", percentUsed: 20 }),
      budget({ id: "near", percentUsed: 88 }),
      budget({ id: "worst", percentUsed: 137 }),
      budget({ id: "over", percentUsed: 104 }),
    ]);

    expect(over.map((item) => item.id)).toEqual(["worst", "over"]);
    expect(near.map((item) => item.id)).toEqual(["near"]);
  });

  it("treats exactly 100% as over, not near", () => {
    const { over, near } = budgetsNeedingAttention([
      budget({ percentUsed: 100 }),
    ]);

    expect(over).toHaveLength(1);
    expect(near).toHaveLength(0);
  });

  it("honours a custom warn threshold", () => {
    const budgets = [budget({ percentUsed: 60 })];

    expect(budgetsNeedingAttention(budgets).near).toHaveLength(0);
    expect(budgetsNeedingAttention(budgets, 50).near).toHaveLength(1);
  });

  it("returns empty lists when nothing is at risk", () => {
    expect(budgetsNeedingAttention([budget({ percentUsed: 10 })])).toEqual({
      over: [],
      near: [],
    });
  });
});

describe("monthElapsedPercent", () => {
  it("is the day's share of a 31-day month", () => {
    expect(
      monthElapsedPercent("2026-07-01", new Date(2026, 6, 17)),
    ).toBeCloseTo(54.84, 2);
  });

  it("is a small slice on the first day", () => {
    expect(monthElapsedPercent("2026-07-01", new Date(2026, 6, 1))).toBeCloseTo(
      3.23,
      2,
    );
  });

  it("is exactly 100 on the last day", () => {
    expect(monthElapsedPercent("2026-07-01", new Date(2026, 6, 31))).toBe(100);
  });

  it("accounts for a shorter month", () => {
    expect(monthElapsedPercent("2026-02-01", new Date(2026, 1, 14))).toBe(50);
  });

  it("is null for a period that is not the current month", () => {
    const today = new Date(2026, 6, 17);
    expect(monthElapsedPercent("2026-06-01", today)).toBeNull();
    expect(monthElapsedPercent("2026-08-01", today)).toBeNull();
  });

  it("survives an overspent budget, unlike spendingPace", () => {
    const today = new Date(2026, 6, 17);
    const overspent = budget({
      isOverBudget: true,
      remaining: -5000,
      percentUsed: 137,
    });

    expect(spendingPace(overspent, today)).toBeNull();
    expect(monthElapsedPercent(overspent.periodStart, today)).toBeCloseTo(
      54.84,
      2,
    );
  });
});

describe("spendingPace", () => {
  /** 17 July 2026 — 15 days left of a 31-day month, today included. */
  const today = new Date(2026, 6, 17);

  it("divides what is left across the remaining days", () => {
    const pace = spendingPace(
      budget({ amount: 310000, spent: 160000, remaining: 150000 }),
      today,
    );

    expect(pace?.daysRemaining).toBe(15);
    expect(pace?.perDay).toBe(10000);
  });

  it("compares spend against an even burn rate", () => {
    const evenBurn = 310000 * (17 / 31);

    expect(
      spendingPace(
        budget({ amount: 310000, spent: evenBurn - 1, remaining: 1 }),
        today,
      )?.isOnTrack,
    ).toBe(true);

    expect(
      spendingPace(
        budget({ amount: 310000, spent: evenBurn + 1, remaining: 1 }),
        today,
      )?.isOnTrack,
    ).toBe(false);
  });

  it("is null for a period that is not the current month", () => {
    expect(
      spendingPace(budget({ periodStart: "2026-06-01" }), today),
    ).toBeNull();
    expect(
      spendingPace(budget({ periodStart: "2026-08-01" }), today),
    ).toBeNull();
  });

  it("is null once the budget is spent — there is no allowance to pace", () => {
    expect(
      spendingPace(
        budget({ isOverBudget: true, remaining: -5000, percentUsed: 137 }),
        today,
      ),
    ).toBeNull();
    expect(spendingPace(budget({ remaining: 0 }), today)).toBeNull();
  });

  it("counts today, so the last day of the month leaves one", () => {
    const lastDay = new Date(2026, 6, 31);
    expect(spendingPace(budget({ remaining: 50000 }), lastDay)).toMatchObject({
      daysRemaining: 1,
      perDay: 50000,
    });
  });
});
