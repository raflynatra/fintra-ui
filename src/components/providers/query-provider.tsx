"use client";

import {
  MutationCache,
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
  if (isSystemError(error)) {
    const message =
      error instanceof Error ? error.message : "Something went wrong.";
    toast.error(message);
  }
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
        queryCache: new QueryCache({ onError: notifyError }),
        mutationCache: new MutationCache({ onError: notifyError }),
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
