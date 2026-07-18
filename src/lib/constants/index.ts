export { NAV_ITEMS } from "./dashboard";
export type { NavItem } from "./dashboard";
// Note: `src/proxy.ts` imports from "./routes" directly rather than through
// this barrel — re-exporting NAV_ITEMS here drags lucide into the middleware.
export { APP_ROUTES, PROTECTED_ROUTES, AUTH_ROUTES } from "./routes";
