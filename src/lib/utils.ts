import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Whether a nav link is active for the current path. Matches the link's route
 * and any descendant of it, so detail pages (e.g. `/dashboard/accounts`) keep
 * their parent menu (`/dashboard`) highlighted.
 */
export function isNavActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}
