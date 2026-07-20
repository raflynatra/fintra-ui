import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/format";
import { Card, CardContent } from "@/components/ui/card";
import { getBalanceSummary } from "@/features/accounts/utils";
import type { Account } from "@/features/accounts/types";

interface AccountsSummaryProps {
  accounts: Account[];
}

/** Summary strip for the accounts page: total active balance and account counts. */
export function AccountsSummary({ accounts }: AccountsSummaryProps) {
  const { total, activeCount, archivedCount } = getBalanceSummary(accounts);

  return (
    <Card size="sm">
      <CardContent className="flex items-center justify-between gap-4">
        <div className="flex flex-col gap-0.5">
          <p className="text-xs text-muted-foreground">Total balance</p>
          <p
            className={cn("text-xl font-bold", total < 0 && "text-destructive")}
          >
            {formatCurrency(total)}
          </p>
        </div>

        <p className="shrink-0 text-right text-xs text-muted-foreground">
          {activeCount} active
          {archivedCount > 0 && ` · ${archivedCount} archived`}
        </p>
      </CardContent>
    </Card>
  );
}
