import type { Account } from "./types";

export interface BalanceSummary {
  /** Sum of `balance` across non-archived accounts. */
  total: number;
  activeCount: number;
  archivedCount: number;
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
