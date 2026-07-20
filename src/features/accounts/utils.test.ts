import { describe, it, expect } from "vitest";
import { getBalanceSummary } from "./utils";
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
