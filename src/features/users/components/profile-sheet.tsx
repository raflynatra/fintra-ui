"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader } from "lucide-react";
import { toast } from "sonner";
import { VisuallyHidden } from "radix-ui";

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
import { SHEET_CONTENT_CLASS } from "@/lib/constants";
import { useAuthStore } from "@/features/auth/store";
import { useUpdateMe } from "@/features/users/hooks/use-update-me";
import { profileSchema } from "@/features/users/schema";
import type { ProfilePayload, User } from "@/features/users/types";

interface ProfileSheetProps {
  user: User | undefined;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProfileSheet({ user, open, onOpenChange }: ProfileSheetProps) {
  const updateMe = useUpdateMe();
  const setUser = useAuthStore((state) => state.setUser);
  const token = useAuthStore((state) => state.token);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProfilePayload>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: user?.name ?? "" },
  });

  React.useEffect(() => {
    if (open) reset({ name: user?.name ?? "" });
  }, [open, user?.name, reset]);

  const onSubmit = (values: ProfilePayload) => {
    updateMe.mutate(values, {
      onSuccess: (updated) => {
        toast.success("Profile has been successfully updated");
        // The header greeting reads the session store, not the profile query.
        if (token) setUser({ ...updated }, token);
        onOpenChange(false);
      },
      onError: (error) =>
        toast.error("Couldn't update profile", { description: error.message }),
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
            <DialogTitle>Your name</DialogTitle>
            <VisuallyHidden.Root asChild>
              <DialogDescription>
                Change the name shown across the app.
              </DialogDescription>
            </VisuallyHidden.Root>
          </DialogHeader>

          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              type="text"
              autoFocus
              aria-invalid={!!errors.name}
              {...register("name")}
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={user?.email ?? ""} disabled />
            <p className="text-xs text-muted-foreground">
              Your email can&apos;t be changed.
            </p>
          </div>

          <Button
            type="submit"
            size="lg"
            className="w-full"
            disabled={updateMe.isPending}
          >
            {updateMe.isPending ? (
              <Loader className="animate-spin" />
            ) : (
              "Save changes"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
