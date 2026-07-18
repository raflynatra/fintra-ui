"use client";

import { PlusIcon, WalletIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

interface AccountEmptyProps {
  onAdd: () => void;
}

export function AccountEmpty({ onAdd }: AccountEmptyProps) {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <WalletIcon />
        </EmptyMedia>
        <EmptyTitle>No accounts yet</EmptyTitle>
        <EmptyDescription>
          Every transaction is recorded against an account. Add one to get
          started — cash, a bank account, or an e-wallet.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button type="button" size="sm" onClick={onAdd}>
          <PlusIcon className="size-4" />
          Add account
        </Button>
      </EmptyContent>
    </Empty>
  );
}
