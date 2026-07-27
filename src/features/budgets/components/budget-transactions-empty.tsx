import { ReceiptTextIcon } from "lucide-react";

import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

/**
 * Shown when a budget's month holds no matching expenses. Deliberately not
 * `TransactionEmpty`, whose filtered branch offers to clear the transactions
 * page's filters — a control that does nothing here.
 */
export function BudgetTransactionsEmpty() {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <ReceiptTextIcon />
        </EmptyMedia>
        <EmptyTitle>Nothing spent yet</EmptyTitle>
        <EmptyDescription>
          No expenses have counted toward this budget this month. Anything you
          record in it will show up here.
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}
