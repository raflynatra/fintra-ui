import { CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export function LoginHeader() {
  return (
    <CardHeader className="text-center">
      <CardTitle>Welcome Back</CardTitle>
      <CardDescription>Sign in to your account to continue</CardDescription>
    </CardHeader>
  );
}
