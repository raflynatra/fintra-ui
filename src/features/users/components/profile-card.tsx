import Link from "next/link";
import { ChevronRightIcon } from "lucide-react";

import { APP_ROUTES } from "@/lib/constants";
import { Avatar } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { User } from "@/features/users/types";

interface ProfileCardProps {
  user: User | undefined;
  isLoading?: boolean;
}

/** Who's signed in, and the way into the profile page. */
export function ProfileCard({ user, isLoading = false }: ProfileCardProps) {
  if (isLoading) {
    return (
      <Card className="flex-row items-center gap-3 px-4">
        <Skeleton className="size-12 shrink-0 rounded-full" />
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-44" />
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-0">
      <Link
        href={APP_ROUTES.profile}
        className="flex items-center gap-3 rounded-xl px-4 py-4 transition-colors hover:bg-muted"
      >
        <Avatar name={user?.name} />

        <div className="min-w-0 flex-1">
          <p className="truncate font-medium">{user?.name}</p>
          <p className="truncate text-sm text-muted-foreground">
            {user?.email}
          </p>
        </div>

        <ChevronRightIcon className="size-4 shrink-0 text-muted-foreground" />
      </Link>
    </Card>
  );
}
