import {
  LayoutDashboard,
  TrendingUp,
  Wallet,
  FileBarChart,
  Settings,
  type LucideIcon,
} from "lucide-react";
import { APP_ROUTES } from "./routes";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export const NAV_ITEMS: NavItem[] = [
  {
    href: APP_ROUTES.dashboard,
    label: "Overview",
    icon: LayoutDashboard,
  },
  {
    href: APP_ROUTES.transactions,
    label: "Transactions",
    icon: TrendingUp,
  },
  {
    href: APP_ROUTES.accounts,
    label: "Accounts",
    icon: Wallet,
  },
  {
    href: APP_ROUTES.reports,
    label: "Reports",
    icon: FileBarChart,
  },
  {
    href: APP_ROUTES.settings,
    label: "Settings",
    icon: Settings,
  },
];
