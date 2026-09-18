"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, Eye, EyeOff, Loader } from "lucide-react";

import { Button } from "@/components/ui/button";
import { CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { APP_ROUTES } from "@/lib/constants";
import { ApiClientError } from "@/lib/api-client";
import { registerSchema } from "@/features/auth/schema";
import type { RegisterPayload } from "@/features/auth/types";
import {
  useRegister,
  RegisteredButSignInFailedError,
} from "@/features/auth/hooks/use-register";
import { LoginError } from "./login-error";
import { PasswordRequirements } from "./password-requirements";

export function RegisterForm() {
  const router = useRouter();
  const signUp = useRegister();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    control,
    formState: { errors },
  } = useForm<RegisterPayload>({
    resolver: zodResolver(registerSchema),
    mode: "onBlur",
  });

  const password = useWatch({ control, name: "password" });

  const onSubmit = (values: RegisterPayload) => {
    signUp.mutate(values, {
      onSuccess: () => router.push(APP_ROUTES.dashboard),
      onError: (error) => {
        /** The account exists; only the follow-up sign-in failed. */
        if (error instanceof RegisteredButSignInFailedError) {
          router.push(`${APP_ROUTES.login}?registered=1`);
          return;
        }

        if (!(error instanceof ApiClientError)) return;

        if (error.code === "USER_ALREADY_EXISTS") {
          setError("email", {
            message: "That email is already registered. Sign in instead.",
          });
        }

        if (error.code === "OAUTH_PROVIDER_MISMATCH") {
          setError("email", {
            message: "That email signs in with Google. Use Google to continue.",
          });
        }
      },
    });
  };

  /** Field errors are rendered inline; anything else needs the banner. */
  const bannerMessage =
    signUp.isError &&
    signUp.error instanceof ApiClientError &&
    !errors.email &&
    signUp.error.message
      ? signUp.error.message
      : null;

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-col gap-6">
          {bannerMessage && <LoginError message={bannerMessage} />}

          <div className="grid gap-3">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              autoComplete="name"
              placeholder="Ada Lovelace"
              aria-invalid={!!errors.name}
              {...register("name")}
            />
            {errors.name && (
              <p className="flex items-center gap-1 text-xs text-destructive">
                <AlertCircle className="h-3 w-3" />
                {errors.name.message}
              </p>
            )}
          </div>

          <div className="grid gap-3">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
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
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder="••••••••"
                aria-invalid={!!errors.password}
                className="pr-11"
                {...register("password")}
              />
              <button
                type="button"
                onClick={() => setShowPassword((shown) => !shown)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-muted-foreground"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            <PasswordRequirements value={password} />
          </div>
        </div>

        <Button type="submit" disabled={signUp.isPending} className="w-full">
          {signUp.isPending ? (
            <Loader className="animate-spin" />
          ) : (
            "Create Account"
          )}
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href={APP_ROUTES.login} className="text-primary underline">
            Sign in
          </Link>
        </p>
      </CardContent>
    </form>
  );
}
