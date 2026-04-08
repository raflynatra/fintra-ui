import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import AuthProvider from "@/components/providers/auth-provider";
import { cookies } from "next/headers";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Fintra",
  description: "Your AI Powered Financial Tracker",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const hasRefreshToken = cookieStore.has("refresh_token");

  let initialToken = null;

  if (hasRefreshToken) {
    const res = await fetch("/api/auth/refresh", {
      method: "POST",
      headers: { Cookie: cookieStore.toString() },
    });
    if (res.ok) {
      const data = await res.json();
      initialToken = data.access_token;
    }
  }

  return (
    <html
      lang="en"
      className={cn(
        geistSans.variable,
        geistMono.variable,
        "font-sans",
        geist.variable,
      )}
    >
      <body>
        <AuthProvider initialToken={initialToken}>{children}</AuthProvider>
      </body>
    </html>
  );
}
