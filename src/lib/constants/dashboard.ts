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
    href: "/transactions",
    label: "Transactions",
    icon: TrendingUp,
  },
  {
    href: "/reports",
    label: "Reports",
    icon: FileBarChart,
  },
  {
    href: "/settings",
    label: "Settings",
    icon: Settings,
  },
];
