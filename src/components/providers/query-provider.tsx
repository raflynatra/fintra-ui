"use client";

import {
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState } from "react";
import { toast } from "sonner";
import { ApiClientError } from "@/lib/api-client";

// Only surface *system* failures (connectivity / server errors) as a toast.
// Domain errors (4xx like invalid credentials) are shown inline by the
// components that own them, so toasting them too would double-report.
function isSystemError(error: unknown): boolean {
  if (error instanceof ApiClientError) {
    return (
      error.status === 0 ||
      error.code === "SERVICE_UNAVAILABLE" ||
      error.status >= 500
    );
  }
  // Non-ApiClientError (e.g. a raw network TypeError) is treated as a system
  // failure since it isn't a structured domain response.
  return true;
}

function notifyError(error: unknown) {
  if (!isSystemError(error)) return;

  const unreachable =
    error instanceof ApiClientError &&
    (error.status === 0 || error.code === "SERVICE_UNAVAILABLE");

  if (unreachable) {
    toast.error("Can't reach the server", {
      description: "Check your connection and try again.",
    });
    return;
  }

  toast.error("Something went wrong", {
    description: error instanceof Error ? error.message : undefined,
  });
}

export default function QueryProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // Create the client once per browser session (lazy state initializer) so it
  // isn't recreated on re-render and cache is preserved.
  const [queryClient] = useState(
    () =>
      new QueryClient({
        // Queries have no natural place to report a system failure, so they get
        // the global toast. Mutations deliberately don't: each one reports its
        // own error with action-specific copy ("Couldn't add transaction", …),
        // and toasting here as well double-reported the same failure.
        queryCache: new QueryCache({ onError: notifyError }),
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV === "development" && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  );
}
