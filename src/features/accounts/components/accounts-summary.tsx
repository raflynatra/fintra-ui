import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/format";
import { Card, CardContent } from "@/components/ui/card";
import {
  ACCOUNT_TYPE_COLOR,
  ACCOUNT_TYPE_LABEL,
} from "@/features/accounts/constants";
import {
  getBalanceByType,
  getBalanceSummary,
  type AccountTypeBreakdown,
} from "@/features/accounts/utils";
import type { Account } from "@/features/accounts/types";

interface AccountsSummaryProps {
  accounts: Account[];
}

/**
 * Summary strip for the accounts page: total active balance, account counts,
 * and a balance distribution across account types.
 */
export function AccountsSummary({ accounts }: AccountsSummaryProps) {
  const { total, activeCount, archivedCount } = getBalanceSummary(accounts);
  const breakdown = getBalanceByType(accounts);

  return (
    <Card size="sm">
      <CardContent className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex flex-col gap-0.5">
            <p className="text-xs text-muted-foreground">Total balance</p>
            <p
              className={cn(
                "text-xl font-bold",
                total < 0 && "text-destructive",
              )}
            >
              {formatCurrency(total)}
            </p>
          </div>

          <p className="shrink-0 text-right text-xs text-muted-foreground">
            {activeCount} active
            {archivedCount > 0 && ` · ${archivedCount} archived`}
          </p>
        </div>

        {breakdown.length > 0 && (
          <div className="flex flex-col gap-3 border-t pt-4">
            <BalanceDistributionBar breakdown={breakdown} />

            <ul className="flex flex-col gap-2">
              {breakdown.map((entry) => (
                <BalanceLegendRow key={entry.type} entry={entry} />
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface BalanceDistributionProps {
  breakdown: AccountTypeBreakdown[];
}

function BalanceDistributionBar({ breakdown }: BalanceDistributionProps) {
  return (
    <div className="flex h-4 overflow-hidden rounded-sm bg-muted">
      {breakdown.map((entry) => (
        <div
          key={entry.type}
          className={ACCOUNT_TYPE_COLOR[entry.type]}
          style={{ width: `${entry.share * 100}%` }}
        />
      ))}
    </div>
  );
}

interface BalanceLegendRowProps {
  entry: AccountTypeBreakdown;
}

function BalanceLegendRow({ entry }: BalanceLegendRowProps) {
  return (
    <li className="flex items-center gap-2 text-sm">
      <span
        className={cn(
          "size-2.5 shrink-0 rounded-full",
          ACCOUNT_TYPE_COLOR[entry.type],
        )}
      />
      <span className="flex-1">{ACCOUNT_TYPE_LABEL[entry.type]}</span>
      <span
        className={cn("font-medium", entry.total < 0 && "text-destructive")}
      >
        {formatCurrency(entry.total)}
      </span>
      <span className="w-9 shrink-0 text-right text-xs text-muted-foreground tabular-nums">
        {Math.round(entry.share * 100)}%
      </span>
    </li>
  );
}
