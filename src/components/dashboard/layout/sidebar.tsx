"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronLeft, PlusIcon } from "lucide-react";
import { cn, isNavActive } from "@/lib/utils";
import { NAV_ITEMS } from "@/lib/constants";
import { useSidebarStore } from "@/stores/sidebar-store";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { AddTransactionSheet } from "@/features/transactions/components";

interface SidebarTooltipProps {
  label: string;
  show: boolean;
  children: React.ReactNode;
}

function SidebarTooltip({ label, show, children }: SidebarTooltipProps) {
  if (!show) return children;

  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent side="right">{label}</TooltipContent>
    </Tooltip>
  );
}

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
        <div className="p-4">
          <Tooltip>
            <AddTransactionSheet
              trigger={
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    aria-label="Add transaction"
                    className={cn(
                      "h-auto w-full justify-start gap-3 border-primary px-3 py-2 text-primary hover:text-primary focus:text-primary aria-expanded:text-primary",
                      isCollapsed && "justify-center gap-0 px-0",
                    )}
                  >
                    <PlusIcon className="size-6 shrink-0" />
                    {!isCollapsed && <span>Add transaction</span>}
                  </Button>
                </TooltipTrigger>
              }
            />
            {isCollapsed && (
              <TooltipContent side="right">Add transaction</TooltipContent>
            )}
          </Tooltip>
        </div>

        <Separator />

        <nav className="flex-1 space-y-2 px-4 py-4">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = isNavActive(pathname, item.href);

            return (
              <SidebarTooltip
                key={item.href}
                label={item.label}
                show={isCollapsed}
              >
                <Link
                  href={item.href}
                  aria-label={isCollapsed ? item.label : undefined}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    isCollapsed && "justify-center gap-0 px-0",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-foreground hover:bg-muted",
                  )}
                >
                  <Icon className="size-6 shrink-0" />
                  {!isCollapsed && <span>{item.label}</span>}
                </Link>
              </SidebarTooltip>
            );
          })}
        </nav>

        <Separator />

        <div className="flex items-center justify-center border-b border-border p-4">
          <SidebarTooltip label={isCollapsed ? "Expand" : "Collapse"} show>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={toggleSidebar}
              aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              <ChevronLeft
                className={cn(
                  "size-4 transition-transform",
                  isCollapsed && "rotate-180",
                )}
              />
            </Button>
          </SidebarTooltip>
        </div>
      </div>
    </aside>
  );
}
