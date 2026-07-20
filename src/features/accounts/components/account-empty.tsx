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
import { AddAccountSheet } from "@/features/accounts/components/add-account-sheet";

export function AccountEmpty() {
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
        <AddAccountSheet
          trigger={
            <Button type="button" size="sm">
              <PlusIcon className="size-4" />
              Add account
            </Button>
          }
        />
      </EmptyContent>
    </Empty>
  );
}
