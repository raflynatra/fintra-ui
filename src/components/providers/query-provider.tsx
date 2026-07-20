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

function isSystemError(error: unknown): boolean {
  if (error instanceof ApiClientError) {
    return (
      error.status === 0 ||
      error.code === "SERVICE_UNAVAILABLE" ||
      error.status >= 500
    );
  }
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
  const [queryClient] = useState(
    () =>
      new QueryClient({
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
