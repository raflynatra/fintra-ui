import { BottomNav, Header, Sidebar } from "@/components/dashboard";
import AuthProvider from "@/components/providers/auth-provider";
import { headers } from "next/headers";

const ACCESS_TOKEN_HEADER = "x-access-token";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const token = (await headers()).get(ACCESS_TOKEN_HEADER);

  return (
    <AuthProvider initialToken={token}>
      <div className="flex h-dvh flex-col overflow-hidden">
        <Header />
        <div className="flex min-h-0 flex-1">
          <Sidebar />
          <main className="min-h-0 flex-1 overflow-y-auto bg-background p-4 pb-24 sm:p-6 md:pb-6">
            {children}
          </main>
        </div>
        <BottomNav />
      </div>
    </AuthProvider>
  );
}
