"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { NAV_ITEMS } from "@/lib/constants";
import { useSidebarStore } from "@/stores/sidebar-store";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export function Sidebar() {
  const pathname = usePathname();
  const { isCollapsed, toggleSidebar } = useSidebarStore();

  return (
    <aside
      className={cn(
        "hidden shrink-0 overflow-y-auto border-r border-border bg-muted/30 transition-all duration-300 md:block",
        isCollapsed ? "w-20" : "w-64",
      )}
    >
      <div className="flex h-full flex-col">
        <nav className="flex-1 space-y-2 px-4 py-6">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-foreground hover:bg-muted",
                )}
                title={isCollapsed ? item.label : undefined}
              >
                <Icon className="size-6 shrink-0" />
                {!isCollapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        <Separator />

        <div className="flex items-center justify-center border-b border-border p-4">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={toggleSidebar}
            title={isCollapsed ? "Expand" : "Collapse"}
          >
            <ChevronLeft
              className={cn(
                "size-4 transition-transform",
                isCollapsed && "rotate-180",
              )}
            />
          </Button>
        </div>
      </div>
    </aside>
  );
}
