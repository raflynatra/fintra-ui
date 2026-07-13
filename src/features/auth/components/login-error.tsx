"use client";

import React from "react";
import { AlertCircle } from "lucide-react";
import { Card } from "@/components/ui/card";

interface LoginErrorProps {
  message: string;
}

export const LoginError = React.memo(({ message }: LoginErrorProps) => {
  return (
    <Card className="border-destructive/50 bg-destructive/5">
      <div className="flex items-center gap-3 px-4 text-destructive">
        <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
        <p className="text-sm font-medium">{message}</p>
      </div>
    </Card>
  );
});

LoginError.displayName = "LoginError";
