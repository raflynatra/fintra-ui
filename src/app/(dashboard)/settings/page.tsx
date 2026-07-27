"use client";

import {
  LogOutIcon,
  LockIcon,
  ShapesIcon,
  UserIcon,
  WalletIcon,
} from "lucide-react";

import { APP_ROUTES } from "@/lib/constants";
import { SettingsGroup, SettingsRow } from "@/components/settings";
import { Button } from "@/components/ui/button";
import { LogoutButton } from "@/features/auth/components";
import { useAuthStore } from "@/features/auth/store";
import { useAccounts } from "@/features/accounts";

export default function SettingsPage() {
  const user = useAuthStore((state) => state.user);
  const { data: accounts } = useAccounts({ includeArchived: true });

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <h2 className="text-2xl font-bold">Settings</h2>

      <SettingsGroup label="Profile">
        <SettingsRow
          icon={UserIcon}
          label="Name & email"
          value={user?.email}
          disabled
        />
        <SettingsRow icon={LockIcon} label="Password" disabled />
      </SettingsGroup>

      <SettingsGroup label="App">
        <SettingsRow
          icon={WalletIcon}
          label="Accounts"
          value={accounts?.length ? String(accounts.length) : undefined}
          href={APP_ROUTES.accounts}
        />
        <SettingsRow
          icon={ShapesIcon}
          label="Categories"
          href={APP_ROUTES.categories}
        />
      </SettingsGroup>

      <LogoutButton
        trigger={
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="w-full justify-center text-destructive hover:text-destructive"
          >
            <LogOutIcon className="size-4" />
            Sign out
          </Button>
        }
      />
    </div>
  );
}
