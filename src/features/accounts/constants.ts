import {
  BanknoteIcon,
  CreditCardIcon,
  LandmarkIcon,
  WalletIcon,
  type LucideIcon,
} from "lucide-react";
import type { AccountType } from "./types";

export const ACCOUNT_TYPE_LABEL: Record<AccountType, string> = {
  cash: "Cash",
  bank: "Bank",
  ewallet: "E-wallet",
  credit_card: "Credit card",
};

export const ACCOUNT_TYPE_ICON: Record<AccountType, LucideIcon> = {
  cash: BanknoteIcon,
  bank: LandmarkIcon,
  ewallet: WalletIcon,
  credit_card: CreditCardIcon,
};

/** Background color class per account type, used for distribution segments and legend swatches. */
export const ACCOUNT_TYPE_COLOR: Record<AccountType, string> = {
  cash: "bg-chart-1",
  bank: "bg-chart-2",
  ewallet: "bg-chart-3",
  credit_card: "bg-chart-4",
};
