import {
  BanknoteIcon,
  CreditCardIcon,
  LandmarkIcon,
  WalletIcon,
  type LucideIcon,
} from "lucide-react";
import type { AccountType } from "./types";

// Keyed by AccountType so a new backend account type fails the build here
// rather than rendering a blank label or a missing icon.
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
