import { Header, Sidebar } from "@/components/dashboard";
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
      <div className="flex min-h-screen flex-col">
        <Header />
        <div className="flex flex-1">
          <Sidebar />
          <main className="flex-1 overflow-auto bg-background p-6">
            {children}
          </main>
        </div>
      </div>
    </AuthProvider>
  );
}
