import { describe, it, expect } from "vitest";
import { groupTotals, hasActiveFilters, toWritePayload } from "./utils";
import type { Transaction, TransactionFormValues } from "./types";

const ACCOUNT = "11111111-1111-4111-8111-111111111111";
const OTHER_ACCOUNT = "22222222-2222-4222-8222-222222222222";
const CATEGORY = "33333333-3333-4333-8333-333333333333";

function transaction(overrides: Partial<Transaction>): Transaction {
  return {
    id: "t1",
    userId: "u1",
    type: "expense",
    amount: 1000,
    categoryId: null,
    category: null,
    accountId: ACCOUNT,
    account: "Cash",
    toAccountId: null,
    toAccount: null,
    description: null,
    date: "2026-07-17",
    createdAt: "2026-07-17T00:00:00.000Z",
    updatedAt: "2026-07-17T00:00:00.000Z",
    ...overrides,
  };
}

describe("groupTotals", () => {
  it("sums income and expense separately", () => {
    const totals = groupTotals([
      transaction({ type: "income", amount: 5000 }),
      transaction({ type: "expense", amount: 2000 }),
    ]);
    expect(totals).toEqual({ totalIncome: 5000, totalExpense: 2000 });
  });

  it("excludes transfers from both totals", () => {
    const totals = groupTotals([
      transaction({ type: "income", amount: 5000 }),
      transaction({
        type: "transfer",
        amount: 999999,
        toAccountId: OTHER_ACCOUNT,
        toAccount: "Bank",
      }),
    ]);
    expect(totals).toEqual({ totalIncome: 5000, totalExpense: 0 });
  });

  it("returns zeroes for an empty group", () => {
    expect(groupTotals([])).toEqual({ totalIncome: 0, totalExpense: 0 });
  });
});

describe("hasActiveFilters", () => {
  it("is false for the default params", () => {
    expect(hasActiveFilters({ size: 10 })).toBe(false);
  });

  it("ignores size — a page size is a display preference, not a filter", () => {
    expect(hasActiveFilters({ size: 50 })).toBe(false);
  });

  it.each([
    ["type", { type: "expense" as const }],
    ["categoryId", { categoryId: "c1" }],
    ["accountId", { accountId: "a1" }],
    ["dateFrom", { dateFrom: "2026-07-01" }],
    ["dateTo", { dateTo: "2026-07-31" }],
  ])("is true when %s is set", (_label, filter) => {
    expect(hasActiveFilters({ size: 10, ...filter })).toBe(true);
  });
});

describe("toWritePayload", () => {
  const base: TransactionFormValues = {
    type: "expense",
    amount: 50000,
    accountId: ACCOUNT,
    categoryId: CATEGORY,
    toAccountId: "",
    description: "Lunch",
    date: "2026-07-17",
  };

  it("keeps categoryId and drops toAccountId for an expense", () => {
    const payload = toWritePayload(base);
    expect(payload).toEqual({
      type: "expense",
      amount: 50000,
      accountId: ACCOUNT,
      categoryId: CATEGORY,
      description: "Lunch",
      date: "2026-07-17",
    });
    expect(payload).not.toHaveProperty("toAccountId");
  });

  it("keeps toAccountId and drops categoryId for a transfer", () => {
    const payload = toWritePayload({
      ...base,
      type: "transfer",
      toAccountId: OTHER_ACCOUNT,
    });
    expect(payload).toEqual({
      type: "transfer",
      amount: 50000,
      accountId: ACCOUNT,
      toAccountId: OTHER_ACCOUNT,
      description: "Lunch",
      date: "2026-07-17",
    });
    expect(payload).not.toHaveProperty("categoryId");
  });

  it("normalizes an empty description to undefined", () => {
    const payload = toWritePayload({ ...base, description: "" });
    expect(payload.description).toBeUndefined();
  });
});
