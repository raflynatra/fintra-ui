"use client";

import type * as React from "react";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useArchiveAccount } from "@/features/accounts/hooks/use-archive-account";
import { useAccountStore } from "@/features/accounts/store";

/** Confirms archiving whatever `archiving` holds in the store. */
export function ArchiveAccountDialog() {
  const account = useAccountStore((state) => state.archiving);
  const setArchiving = useAccountStore((state) => state.setArchiving);
  const archiveAccount = useArchiveAccount();

  if (!account) return null;

  const handleConfirm = (event: React.MouseEvent) => {
    // Radix closes on click by default; keep it open so the pending state shows
    // until the mutation settles.
    event.preventDefault();
    archiveAccount.mutate(account.id, {
      onSuccess: () => {
        toast.success(`${account.name} has been archived`);
        setArchiving(null);
      },
      onError: (error) =>
        toast.error("Couldn't archive account", { description: error.message }),
    });
  };

  return (
    <AlertDialog open onOpenChange={(next) => !next && setArchiving(null)}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Archive {account.name}?</AlertDialogTitle>
          <AlertDialogDescription>
            It will be hidden from your accounts and can&apos;t be used for new
            transactions. Its history is kept, and you can restore it at any
            time.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={archiveAccount.isPending}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={archiveAccount.isPending}
          >
            Archive
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
