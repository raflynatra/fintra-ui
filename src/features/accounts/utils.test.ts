import { describe, it, expect } from "vitest";
import { getBalanceSummary, getBalanceByType } from "./utils";
import type { Account } from "./types";

function account(overrides: Partial<Account>): Account {
  return {
    id: "a1",
    name: "Cash",
    type: "cash",
    initialBalance: 0,
    balance: 0,
    isArchived: false,
    createdAt: "2026-07-17T00:00:00.000Z",
    updatedAt: "2026-07-17T00:00:00.000Z",
    ...overrides,
  };
}

describe("getBalanceSummary", () => {
  it("returns zeros for an empty list", () => {
    expect(getBalanceSummary([])).toEqual({
      total: 0,
      activeCount: 0,
      archivedCount: 0,
    });
  });

  it("sums the balance of active accounts only", () => {
    const summary = getBalanceSummary([
      account({ id: "a1", balance: 1000 }),
      account({ id: "a2", balance: 3000 }),
    ]);
    expect(summary).toEqual({ total: 4000, activeCount: 2, archivedCount: 0 });
  });

  it("excludes archived accounts from the total but counts them", () => {
    const summary = getBalanceSummary([
      account({ id: "a1", balance: 1000 }),
      account({ id: "a2", balance: 5000, isArchived: true }),
    ]);
    expect(summary).toEqual({ total: 1000, activeCount: 1, archivedCount: 1 });
  });

  it("handles negative balances", () => {
    const summary = getBalanceSummary([
      account({ id: "a1", balance: 2000 }),
      account({ id: "a2", balance: -500 }),
    ]);
    expect(summary).toEqual({ total: 1500, activeCount: 2, archivedCount: 0 });
  });
});

describe("getBalanceByType", () => {
  it("returns an empty list for no accounts", () => {
    expect(getBalanceByType([])).toEqual([]);
  });

  it("groups and sums active accounts by type, sorted by total desc", () => {
    const breakdown = getBalanceByType([
      account({ id: "a1", type: "cash", balance: 1000 }),
      account({ id: "a2", type: "bank", balance: 3000 }),
      account({ id: "a3", type: "cash", balance: 500 }),
    ]);

    expect(
      breakdown.map(({ type, total, count }) => ({ type, total, count })),
    ).toEqual([
      { type: "bank", total: 3000, count: 1 },
      { type: "cash", total: 1500, count: 2 },
    ]);
    expect(breakdown.reduce((sum, entry) => sum + entry.share, 0)).toBeCloseTo(
      1,
    );
  });

  it("excludes archived accounts", () => {
    const breakdown = getBalanceByType([
      account({ id: "a1", type: "cash", balance: 1000 }),
      account({ id: "a2", type: "bank", balance: 5000, isArchived: true }),
    ]);

    expect(breakdown).toEqual([
      { type: "cash", total: 1000, count: 1, share: 1 },
    ]);
  });

  it("keeps share valid with a negative balance", () => {
    const breakdown = getBalanceByType([
      account({ id: "a1", type: "bank", balance: 3000 }),
      account({ id: "a2", type: "credit_card", balance: -1000 }),
    ]);

    const bank = breakdown.find((entry) => entry.type === "bank");
    const credit = breakdown.find((entry) => entry.type === "credit_card");
    expect(bank?.share).toBeCloseTo(0.75);
    expect(credit?.share).toBeCloseTo(0.25);
    expect(
      breakdown.every((entry) => entry.share >= 0 && entry.share <= 1),
    ).toBe(true);
  });

  it("yields share 0 when every active total is zero", () => {
    const breakdown = getBalanceByType([
      account({ id: "a1", type: "cash", balance: 0 }),
    ]);
    expect(breakdown).toEqual([{ type: "cash", total: 0, count: 1, share: 0 }]);
  });
});
