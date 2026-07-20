import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";

import { APP_ROUTES } from "@/lib/constants";

/**
 * Frame for dashboard detail pages (drill-downs from an overview card). Renders a
 * back link to the overview above the page content; the overview itself sits
 * outside this route group and stays back-button-free.
 */
export default function DashboardDetailsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-4">
      <Link
        href={APP_ROUTES.dashboard}
        className="inline-flex w-fit items-center gap-1.5 py-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeftIcon className="size-4" />
        Overview
      </Link>

      {children}
    </div>
  );
}
