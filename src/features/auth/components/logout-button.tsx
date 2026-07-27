"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { APP_ROUTES } from "@/lib/constants";
import { useLogout } from "@/features/auth/hooks/use-logout";
import { useRouter } from "next/navigation";

interface LogoutButtonProps {
  /** Replaces the default header button, e.g. with a settings row. */
  trigger?: React.ReactNode;
}

export function LogoutButton({ trigger }: LogoutButtonProps = {}) {
  const router = useRouter();
  const logout = useLogout();

  const handleLogout = () => {
    logout.mutate(undefined, {
      onSettled: () => router.push(APP_ROUTES.login),
    });
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        {trigger ?? (
          <Button variant="outline" size="sm">
            Logout
          </Button>
        )}
      </AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Log out?</AlertDialogTitle>
          <AlertDialogDescription>
            You&apos;ll need to sign in again to access your account.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={logout.isPending}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction onClick={handleLogout} disabled={logout.isPending}>
            Log out
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
