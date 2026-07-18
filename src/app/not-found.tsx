import Link from "next/link";
import { cookies } from "next/headers";
import { Button } from "@/components/ui/button";

export default async function NotFound() {
  const isAuthenticated = (await cookies()).has("refresh_token");
  const href = isAuthenticated ? "/dashboard" : "/login";
  const label = isAuthenticated ? "Back to dashboard" : "Go to sign in";

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 px-4 text-center">
      <p className="text-sm font-medium text-muted-foreground">404</p>
      <h1 className="text-2xl font-bold">Page not found</h1>
      <p className="max-w-md text-sm text-muted-foreground">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Button asChild>
        <Link href={href}>{label}</Link>
      </Button>
    </div>
  );
}
