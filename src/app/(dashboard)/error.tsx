"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function DashboardError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
      <h2 className="text-xl font-semibold">Something went wrong</h2>
      <p className="max-w-md text-sm text-muted-foreground">
        {error.message ||
          "An unexpected error occurred while loading this page."}
      </p>
      <Button onClick={() => unstable_retry()}>Try again</Button>
    </div>
  );
}
