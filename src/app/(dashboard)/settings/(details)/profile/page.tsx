"use client";

import * as React from "react";
import { LockIcon, Trash2Icon, UserIcon } from "lucide-react";

import { formatMonthYear } from "@/lib/format";
import { Avatar } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { SettingsGroup, SettingsRow } from "@/components/settings";
import { ChangePasswordSheet } from "@/features/auth/components";
import { useMe } from "@/features/users";
import { DeleteAccountDialog, ProfileSheet } from "@/features/users/components";

type OpenPanel = "profile" | "password" | "delete" | null;

export default function ProfilePage() {
  const { data: user, isLoading } = useMe();
  const [open, setOpen] = React.useState<OpenPanel>(null);

  const close = () => setOpen(null);

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <div className="flex flex-col items-center gap-2 py-2 text-center">
        {isLoading ? (
          <>
            <Skeleton className="size-20 rounded-full" />
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-52" />
          </>
        ) : (
          <>
            <Avatar name={user?.name} size="lg" />
            <div className="max-w-full min-w-0">
              <h2 className="truncate text-xl font-bold">{user?.name}</h2>
              <p className="truncate text-sm text-muted-foreground">
                {user?.email}
              </p>
            </div>
            {user?.createdAt && (
              <p className="text-xs text-muted-foreground">
                Member since {formatMonthYear(user.createdAt)}
              </p>
            )}
          </>
        )}
      </div>

      <SettingsGroup label="Account">
        <SettingsRow
          icon={UserIcon}
          label="Name"
          value={user?.name}
          onClick={() => setOpen("profile")}
        />
        <SettingsRow
          icon={LockIcon}
          label="Password"
          onClick={() => setOpen("password")}
        />
      </SettingsGroup>

      {/* Kept in its own group so an irreversible action isn't one row
          below a routine one. */}
      <SettingsGroup label="Danger zone">
        <SettingsRow
          icon={Trash2Icon}
          label="Delete account"
          destructive
          onClick={() => setOpen("delete")}
        />
      </SettingsGroup>

      <ProfileSheet
        user={user}
        open={open === "profile"}
        onOpenChange={(next) => (next ? setOpen("profile") : close())}
      />
      <ChangePasswordSheet
        open={open === "password"}
        onOpenChange={(next) => (next ? setOpen("password") : close())}
      />
      <DeleteAccountDialog
        user={user}
        open={open === "delete"}
        onOpenChange={(next) => (next ? setOpen("delete") : close())}
      />
    </div>
  );
}
