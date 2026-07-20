"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/features/auth/store";

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
