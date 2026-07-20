import type { Account, AccountType } from "./types";

export interface BalanceSummary {
  total: number;
  activeCount: number;
  archivedCount: number;
}

export interface AccountTypeBreakdown {
  type: AccountType;
  total: number;
  count: number;
  share: number;
}

/** Derives the total active balance and active/archived counts from a list of accounts. */
export function getBalanceSummary(accounts: Account[]): BalanceSummary {
  return accounts.reduce<BalanceSummary>(
    (summary, account) => {
      if (account.isArchived) {
        summary.archivedCount += 1;
      } else {
        summary.activeCount += 1;
        summary.total += account.balance;
      }
      return summary;
    },
    { total: 0, activeCount: 0, archivedCount: 0 },
  );
}

/**
 * Groups active accounts by type into per-type balance subtotals, sorted by
 * `total` descending. `share` is each type's fraction of net worth by absolute
 * balance, so the allocation stays valid even with negative (e.g. credit-card)
 * totals; an all-zero set yields `share: 0`.
 */
export function getBalanceByType(accounts: Account[]): AccountTypeBreakdown[] {
  const totals = new Map<AccountType, { total: number; count: number }>();

  for (const account of accounts) {
    if (account.isArchived) continue;
    const entry = totals.get(account.type) ?? { total: 0, count: 0 };
    entry.total += account.balance;
    entry.count += 1;
    totals.set(account.type, entry);
  }

  const absSum = [...totals.values()].reduce(
    (sum, entry) => sum + Math.abs(entry.total),
    0,
  );

  return [...totals.entries()]
    .map(([type, { total, count }]) => ({
      type,
      total,
      count,
      share: absSum === 0 ? 0 : Math.abs(total) / absSum,
    }))
    .sort((a, b) => b.total - a.total);
}
