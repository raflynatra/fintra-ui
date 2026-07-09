"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, Loader } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoginError } from "./login-error";
import { CardContent } from "@/components/ui/card";
import { loginSchema } from "@/features/auth/schema";
import { LoginPayload } from "@/features/auth/types";
import { useLogin } from "@/features/auth/hooks/use-login";

export function LoginForm() {
  const router = useRouter();
  const login = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginPayload>({
    resolver: zodResolver(loginSchema),
    mode: "onBlur",
  });

  const onSubmit = (values: LoginPayload) => {
    login.mutate(values, {
      onSuccess: () => router.push("/dashboard"),
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-col gap-6">
          {login.isError && (
            <LoginError
              message={login.error.message || "An error occurred"}
            />
          )}

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

        <Button type="submit" disabled={login.isPending} className="w-full">
          {login.isPending ? <Loader className="animate-spin" /> : "Sign In"}
        </Button>
      </CardContent>
    </form>
  );
}
