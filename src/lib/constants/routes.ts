/** Application route paths. */
export const APP_ROUTES = {
  login: "/login",
  dashboard: "/dashboard",
  transactions: "/transactions",
  budgets: "/budgets",
  reports: "/reports",
  settings: "/settings",
  accounts: "/settings/accounts",
  categories: "/settings/categories",
} as const;

/**
 * Routes behind the dashboard shell that require a session. Matched by prefix,
 * so `/settings` also covers every settings sub-page.
 */
export const PROTECTED_ROUTES: string[] = [
  APP_ROUTES.dashboard,
  APP_ROUTES.transactions,
  APP_ROUTES.budgets,
  APP_ROUTES.reports,
  APP_ROUTES.settings,
];

/** Routes a signed-in user has no business seeing. */
export const AUTH_ROUTES: string[] = [APP_ROUTES.login];
