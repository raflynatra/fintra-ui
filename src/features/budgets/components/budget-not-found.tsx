import Link from "next/link";
import { SearchXIcon } from "lucide-react";

import { APP_ROUTES } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

/** Shown for a budget that has been deleted, or an id that never existed. */
export function BudgetNotFound() {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <SearchXIcon />
        </EmptyMedia>
        <EmptyTitle>Budget not found</EmptyTitle>
        <EmptyDescription>
          This budget may have been deleted. Head back to see the ones you still
          have.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button asChild variant="outline" size="sm">
          <Link href={APP_ROUTES.budgets}>Back to budgets</Link>
        </Button>
      </EmptyContent>
    </Empty>
  );
}
