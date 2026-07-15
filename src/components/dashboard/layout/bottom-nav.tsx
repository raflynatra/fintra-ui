"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { NAV_ITEMS, type NavItem } from "@/lib/constants";
import { AddTransactionSheet } from "@/features/transactions/components";

// Mobile-only primary navigation. Hidden at md+ where the Sidebar takes over.
// Pinned to the bottom for thumb reach, with safe-area padding so it clears the
// home indicator on notched devices. Nav items are split around a raised
// center "add transaction" action.
export function BottomNav() {
  const pathname = usePathname();
  const mid = Math.ceil(NAV_ITEMS.length / 2);
  const leftItems = NAV_ITEMS.slice(0, mid);
  const rightItems = NAV_ITEMS.slice(mid);

  const renderItem = (item: NavItem) => {
    const Icon = item.icon;
    // "/dashboard" is a prefix of every other route, so match it exactly;
    // nested routes match themselves or a deeper path.
    const isActive =
      item.href === "/dashboard"
        ? pathname === "/dashboard"
        : pathname === item.href || pathname.startsWith(`${item.href}/`);

    return (
      <li key={item.href} className="flex-1">
        <Link
          href={item.href}
          aria-current={isActive ? "page" : undefined}
          title={item.label}
          className={cn(
            "flex min-h-14 flex-col items-center justify-center gap-1 px-1 py-2 text-xs font-medium transition-colors",
            isActive
              ? "text-primary"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          <Icon className="size-5 shrink-0" />
          <span className="max-w-full truncate">{item.label}</span>
        </Link>
      </li>
    );
  };

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="flex items-stretch justify-around">
        {leftItems.map(renderItem)}
        <li className="flex flex-1 items-start justify-center">
          <AddTransactionSheet />
        </li>
        {rightItems.map(renderItem)}
      </ul>
    </nav>
  );
}
