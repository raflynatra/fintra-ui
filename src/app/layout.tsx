import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import QueryProvider from "@/components/providers/query-provider";

const geistSans = Geist({ subsets: ["latin"], variable: "--font-sans" });

const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: "Fintra",
  description: "Your AI Powered Financial Tracker",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn(geistSans.variable, geistMono.variable, "font-sans")}
    >
      <body>
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
