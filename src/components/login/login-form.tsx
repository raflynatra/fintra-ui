"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, Loader } from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoginError } from "./login-error";
import { CardContent } from "../ui/card";
import { loginSchema } from "@/validations/login.schema";
import { LoginData, LoginPayload } from "@/types/auth";
import { apiClient } from "@/lib/api-client";

export function LoginForm() {
  const router = useRouter();
  const setUser = useAuthStore((s) => s.setUser);
  const [apiError, setApiError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginPayload>({
    resolver: zodResolver(loginSchema),
    mode: "onBlur",
  });

  const onSubmit = async (values: LoginPayload) => {
    setApiError("");
    try {
      setIsLoading(true);
      const data = await apiClient.post<LoginData>("/api/auth/login", values);

      setUser(data.user, data.token);
      router.push("/dashboard");
    } catch (err) {
      setApiError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-col gap-6">
          {apiError && <LoginError message={apiError} />}

          <div className="grid gap-3">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              aria-invalid={!!errors.email}
              {...register("email")}
            />
            {errors.email && (
              <p className="flex items-center gap-1 text-xs text-destructive">
                <AlertCircle className="h-3 w-3" />
                {errors.email.message}
              </p>
            )}
          </div>

          <div className="grid gap-3">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              aria-invalid={!!errors.password}
              {...register("password")}
            />
            {errors.password && (
              <p className="flex items-center gap-1 text-xs text-destructive">
                <AlertCircle className="h-3 w-3" />
                {errors.password.message}
              </p>
            )}
          </div>
        </div>

        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? <Loader className="animate-spin" /> : "Sign In"}
        </Button>
      </CardContent>
    </form>
  );
}
