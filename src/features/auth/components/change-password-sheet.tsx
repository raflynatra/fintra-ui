"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, CircleCheck, Loader } from "lucide-react";
import { toast } from "sonner";
import { VisuallyHidden } from "radix-ui";

import { cn } from "@/lib/utils";
import { APP_ROUTES, SHEET_CONTENT_CLASS } from "@/lib/constants";
import { ApiClientError } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useChangePassword } from "@/features/auth/hooks/use-change-password";
import { changePasswordFormSchema } from "@/features/auth/schema";
import { useAuthStore } from "@/features/auth/store";
import { PasswordRequirements } from "@/features/auth/components/password-requirements";
import type { ChangePasswordFormValues } from "@/features/auth/types";

interface ChangePasswordSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ChangePasswordSheet({
  open,
  onOpenChange,
}: ChangePasswordSheetProps) {
  const router = useRouter();
  const changePassword = useChangePassword();
  const logout = useAuthStore((state) => state.logout);

  /** Set when the backend reports the account has no password to change. */
  const [oauthOnly, setOauthOnly] = React.useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setError,
    control,
    formState: { errors },
  } = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordFormSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const newPassword = useWatch({ control, name: "newPassword" });
  const confirmPassword = useWatch({ control, name: "confirmPassword" });

  /**
   * Live feedback only — the resolver still guards submit. Stays `null` until
   * something has been typed, so the field doesn't open on a failure state.
   */
  const confirmationMatches = confirmPassword
    ? newPassword === confirmPassword
    : null;

  React.useEffect(() => {
    if (open) {
      reset({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setOauthOnly(false);
    }
  }, [open, reset]);

  const onSubmit = (values: ChangePasswordFormValues) => {
    changePassword.mutate(values, {
      onSuccess: () => {
        // The backend revoked every session; carry that through honestly.
        toast.success("Password changed. Sign in again to continue.");
        logout();
        router.replace(APP_ROUTES.login);
      },
      onError: (error) => {
        if (error instanceof ApiClientError) {
          if (error.code === "AUTH_PASSWORD_NOT_SET") {
            setOauthOnly(true);
            return;
          }
          setError("currentPassword", { message: error.message });
          return;
        }
        toast.error("Couldn't change password", { description: error.message });
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showClose={false} className={SHEET_CONTENT_CLASS}>
        <div className="mx-auto mt-3 h-1.5 w-10 shrink-0 rounded-full bg-border sm:hidden" />

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-5 px-5 pt-3 pb-6"
        >
          <DialogHeader>
            <DialogTitle>Change password</DialogTitle>
            <VisuallyHidden.Root asChild>
              <DialogDescription>
                Set a new password for your account.
              </DialogDescription>
            </VisuallyHidden.Root>
          </DialogHeader>

          {oauthOnly ? (
            <p className="text-sm text-muted-foreground">
              This account signs in with Google, so there&apos;s no password to
              change. Manage it from your Google account instead.
            </p>
          ) : (
            <>
              <p className="text-xs text-muted-foreground">
                Changing your password signs you out everywhere, including here.
              </p>

              <div className="grid gap-2">
                <Label htmlFor="currentPassword">Current password</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  autoComplete="current-password"
                  autoFocus
                  aria-invalid={!!errors.currentPassword}
                  {...register("currentPassword")}
                />
                {errors.currentPassword && (
                  <p className="text-xs text-destructive">
                    {errors.currentPassword.message}
                  </p>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="newPassword">New password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  autoComplete="new-password"
                  aria-invalid={!!errors.newPassword}
                  {...register("newPassword")}
                />
                <PasswordRequirements value={newPassword} />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="confirmPassword">Confirm new password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  aria-invalid={!!errors.confirmPassword}
                  {...register("confirmPassword")}
                />
                {errors.confirmPassword ? (
                  <p className="text-xs text-destructive">
                    {errors.confirmPassword.message}
                  </p>
                ) : (
                  /* Height is reserved so the row appearing doesn't nudge the
                     submit button as they type. */
                  <p
                    aria-live="polite"
                    className={cn(
                      "flex min-h-4 items-center gap-1 text-xs",
                      confirmationMatches ? "text-primary" : "text-destructive",
                    )}
                  >
                    {confirmationMatches !== null &&
                      (confirmationMatches ? (
                        <>
                          <CircleCheck className="h-3 w-3" />
                          Confirm password matches
                        </>
                      ) : (
                        <>
                          <AlertCircle className="h-3 w-3" />
                          Confirm password doesn&apos;t match
                        </>
                      ))}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full"
                disabled={changePassword.isPending}
              >
                {changePassword.isPending ? (
                  <Loader className="animate-spin" />
                ) : (
                  "Change password"
                )}
              </Button>
            </>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
}
