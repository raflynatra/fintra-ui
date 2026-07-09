import { Card } from "@/components/ui/card";
import { LoginForm, LoginHeader } from "@/features/auth/components";
import Image from "next/image";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <div className="flex justify-center">
          <Image
            src="/fintra-logo.png"
            alt="app's logo"
            width={150}
            height={50}
          />
        </div>
        <LoginHeader />
        <LoginForm />
      </Card>
    </div>
  );
}
