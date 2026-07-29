"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeftIcon } from "lucide-react";

import { NAV_ITEMS } from "@/lib/constants";
import { isNavActive } from "@/lib/utils";

interface BackLinkProps {
  href: string;
  label: string;
}

function toOrigin(from: string | null) {
  if (!from || !from.startsWith("/") || from.startsWith("//")) return null;

  const label = NAV_ITEMS.find((item) => isNavActive(from, item.href))?.label;

  return { href: from, label: label ?? "Back" };
}

export function BackLink({ href, label }: BackLinkProps) {
  const origin = toOrigin(useSearchParams().get("from"));

  return (
    <Link
      href={origin?.href ?? href}
      className="inline-flex w-fit items-center gap-1.5 py-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
    >
      <ArrowLeftIcon className="size-4" />
      {origin?.label ?? label}
    </Link>
  );
}
