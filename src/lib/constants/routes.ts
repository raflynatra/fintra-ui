/**
 * Application route paths.
 *
 * Deliberately icon-free and dependency-free: `src/proxy.ts` runs in the
 * middleware runtime and imports this, so it must not pull in lucide (which is
 * why these can't live alongside `NAV_ITEMS` in `./dashboard`).
 */
export const APP_ROUTES = {
  login: "/login",
  dashboard: "/dashboard",
  transactions: "/transactions",
  accounts: "/accounts",
  reports: "/reports",
  settings: "/settings",
} as const;

/**
 * Everything behind the dashboard shell. `(dashboard)` is a route *group*, so
 * it adds no URL segment — these paths are top-level and each has to be listed
 * explicitly. Missing one doesn't 404, it silently ships an unprotected page
 * that leans on the api-client's 401 refresh-and-retry to paper over the
 * absent access token.
 */
export const PROTECTED_ROUTES: string[] = [
  APP_ROUTES.dashboard,
  APP_ROUTES.transactions,
  APP_ROUTES.accounts,
  APP_ROUTES.reports,
  APP_ROUTES.settings,
];

/** Routes a signed-in user has no business seeing. */
export const AUTH_ROUTES: string[] = [APP_ROUTES.login];
