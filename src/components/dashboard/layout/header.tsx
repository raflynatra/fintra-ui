"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Avatar } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { APP_ROUTES } from "@/lib/constants";
import { isNavActive } from "@/lib/utils";
import { useMe } from "@/features/users";

export function Header() {
  const { data: user, isLoading } = useMe();
  const pathname = usePathname();

  const isOnProfile = isNavActive(pathname, APP_ROUTES.profile);
  const href = isOnProfile
    ? APP_ROUTES.profile
    : `${APP_ROUTES.profile}?from=${encodeURIComponent(pathname)}`;

  return (
    <header
      className="shrink-0 border-b border-border bg-card px-4 py-4 shadow-sm sm:px-6"
      style={{ paddingTop: "max(1rem, env(safe-area-inset-top))" }}
    >
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Fintra</h1>

        {isLoading ? (
          <Skeleton className="size-9 rounded-full" />
        ) : (
          <Link
            href={href}
            aria-label="Your profile"
            className="rounded-full transition-opacity hover:opacity-80"
          >
            <Avatar name={user?.name} size="sm" />
          </Link>
        )}
      </div>
    </header>
  );
}
