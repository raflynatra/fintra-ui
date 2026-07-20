import { Button } from "@/components/ui/button";
import {
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { WalletIcon } from "lucide-react";
import Link from "next/link";
import { VisuallyHidden } from "radix-ui";

interface TransactionEmptyAccountProps {
  title: string;
  description: string;
}

export function TransactionEmptyAccount({
  title,
  description,
}: TransactionEmptyAccountProps) {
  return (
    <div className="flex flex-col gap-5 px-5 pt-3 pb-6">
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
        <VisuallyHidden.Root asChild>
          <DialogDescription>{description}</DialogDescription>
        </VisuallyHidden.Root>
      </DialogHeader>

      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <WalletIcon />
          </EmptyMedia>
          <EmptyTitle>Create an account first</EmptyTitle>
          <EmptyDescription>
            Transactions are recorded against an account — cash, a bank account,
            or an e-wallet. Add one to start tracking.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button asChild size="sm">
            <Link href="/accounts">Go to accounts</Link>
          </Button>
        </EmptyContent>
      </Empty>
    </div>
  );
}
