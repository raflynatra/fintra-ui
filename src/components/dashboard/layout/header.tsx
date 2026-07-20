"use client";

import { PlusIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { AddTransactionSheet } from "@/features/transactions/components";
import { LogoutButton } from "@/features/auth/components";

export function Header() {
  return (
    <header
      className="shrink-0 border-b border-border bg-card px-4 py-4 shadow-sm sm:px-6"
      style={{ paddingTop: "max(1rem, env(safe-area-inset-top))" }}
    >
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Fintra</h1>

        <div className="flex items-center gap-2">
          <AddTransactionSheet
            trigger={
              <Button type="button" size="sm" className="hidden md:inline-flex">
                <PlusIcon className="size-4" />
                Add transaction
              </Button>
            }
          />

          <LogoutButton />
        </div>
      </div>
    </header>
  );
}
