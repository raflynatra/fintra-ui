"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/stores/auth-store";

export default function AuthProvider({
  initialToken,
  children,
}: {
  initialToken: string;
  children: React.ReactNode;
}) {
  const setToken = useAuthStore((s) => s.setToken);

  useEffect(() => {
    if (initialToken) setToken(initialToken);
  }, []);

  return <>{children}</>;
}
