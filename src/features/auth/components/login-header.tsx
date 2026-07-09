"use client";

import React from "react";
import { CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export const LoginHeader = React.memo(() => {
  return (
    <CardHeader className="text-center">
      <CardTitle>Welcome Back</CardTitle>
      <CardDescription>Sign in to your account to continue</CardDescription>
    </CardHeader>
  );
});

LoginHeader.displayName = "LoginHeader";
