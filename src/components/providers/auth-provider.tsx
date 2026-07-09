"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/features/auth/store";

// NOTE: `useAuthStore` is a module singleton, so this seeds a client-side
// store. Hydration runs in an effect (client only) to avoid mutating shared
// state during server render. Follow-up: move to a per-request store factory
// + context provider to fully isolate state across requests.
export default function AuthProvider({
  initialToken,
  children,
}: {
  initialToken: string | null;
  children: React.ReactNode;
}) {
  const setToken = useAuthStore((state) => state.setToken);

  useEffect(() => {
    if (initialToken) {
      setToken(initialToken);
    }
  }, [initialToken, setToken]);

  return <>{children}</>;
}
