import {
  LayoutDashboard,
  TrendingUp,
  FileBarChart,
  Settings,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export const NAV_ITEMS: NavItem[] = [
  {
    href: "/dashboard",
    label: "Overview",
    icon: LayoutDashboard,
  },
  {
    href: "/dashboard/transactions",
    label: "Transactions",
    icon: TrendingUp,
  },
  {
    href: "/dashboard/reports",
    label: "Reports",
    icon: FileBarChart,
  },
  {
    href: "/dashboard/settings",
    label: "Settings",
    icon: Settings,
  },
];
