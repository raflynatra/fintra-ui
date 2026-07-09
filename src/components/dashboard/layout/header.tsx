"use client";

import { Button } from "@/components/ui/button";
import { useLogout } from "@/features/auth/hooks/use-logout";
import { useRouter } from "next/navigation";

export function Header() {
  const router = useRouter();
  const logout = useLogout();

  const handleLogout = () => {
    logout.mutate(undefined, {
      onSettled: () => router.push("/login"),
    });
  };

  return (
    <header className="border-b border-border bg-card px-6 py-4 shadow-sm">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Fintra</h1>
        <Button
          variant="outline"
          size="sm"
          onClick={handleLogout}
          disabled={logout.isPending}
        >
          Logout
        </Button>
      </div>
    </header>
  );
}
