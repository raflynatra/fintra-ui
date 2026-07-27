"use client";

import { LogOutIcon, ShapesIcon, WalletIcon } from "lucide-react";

import { APP_ROUTES } from "@/lib/constants";
import { SettingsGroup, SettingsRow } from "@/components/settings";
import { Button } from "@/components/ui/button";
import { LogoutButton } from "@/features/auth/components";
import { useAccounts } from "@/features/accounts";
import { useMe } from "@/features/users";
import { ProfileCard } from "@/features/users/components";

export default function SettingsPage() {
  const { data: user, isLoading } = useMe();
  const { data: accounts } = useAccounts({ includeArchived: true });

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <h2 className="text-2xl font-bold">Settings</h2>

      <ProfileCard user={user} isLoading={isLoading} />

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
