import Image from "next/image";

import { Card } from "@/components/ui/card";
import { RegisterForm, RegisterHeader } from "@/features/auth/components";

export default function RegisterPage() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <div className="flex justify-center">
          <Image
            src="/fintra-logo.png"
            alt="app's logo"
            width={585}
            height={180}
            priority
            className="h-auto w-[150px]"
          />
        </div>
        <RegisterHeader />
        <RegisterForm />
      </Card>
    </div>
  );
}
