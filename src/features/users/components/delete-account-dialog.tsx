"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { APP_ROUTES } from "@/lib/constants";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/features/auth/store";
import { useDeleteMe } from "@/features/users/hooks/use-delete-me";
import type { User } from "@/features/users/types";

interface DeleteAccountDialogProps {
  user: User | undefined;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteAccountDialog({
  user,
  open,
  onOpenChange,
}: DeleteAccountDialogProps) {
  const router = useRouter();
  const deleteMe = useDeleteMe();
  const logout = useAuthStore((state) => state.logout);
  const [confirmation, setConfirmation] = React.useState("");

  React.useEffect(() => {
    if (open) setConfirmation("");
  }, [open]);

  const canDelete =
    !!user?.email &&
    confirmation.trim().toLowerCase() === user.email.toLowerCase();

  const handleConfirm = (event: React.MouseEvent) => {
    event.preventDefault();
    if (!canDelete) return;

    deleteMe.mutate(undefined, {
      onSuccess: () => {
        logout();
        // Hard replace: nothing behind this route survives the account.
        router.replace(APP_ROUTES.login);
      },
      onError: (error) =>
        toast.error("Couldn't delete account", { description: error.message }),
    });
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete your account?</AlertDialogTitle>
          <AlertDialogDescription>
            Your accounts, transactions and budgets go with it, and there is no
            way to get them back. Type <strong>{user?.email}</strong> to
            confirm.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="grid gap-2">
          <Label htmlFor="confirm-email" className="sr-only">
            Confirm your email
          </Label>
          <Input
            id="confirm-email"
            type="email"
            autoComplete="off"
            placeholder={user?.email}
            value={confirmation}
            onChange={(event) => setConfirmation(event.target.value)}
          />
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleteMe.isPending}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={!canDelete || deleteMe.isPending}
          >
            Delete forever
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
