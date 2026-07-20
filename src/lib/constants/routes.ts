/** Application route paths. */
export const APP_ROUTES = {
  login: "/login",
  dashboard: "/dashboard",
  transactions: "/transactions",
  accounts: "/accounts",
  reports: "/reports",
  settings: "/settings",
} as const;

/** Routes behind the dashboard shell that require a session. */
export const PROTECTED_ROUTES: string[] = [
  APP_ROUTES.dashboard,
  APP_ROUTES.transactions,
  APP_ROUTES.accounts,
  APP_ROUTES.reports,
  APP_ROUTES.settings,
];

/** Routes a signed-in user has no business seeing. */
export const AUTH_ROUTES: string[] = [APP_ROUTES.login];
