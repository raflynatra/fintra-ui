import { API_URL } from "@/lib/env";
import { applyRefreshTokenCookie } from "@/lib/server/auth-cookies";
import { APP_ROUTES, AUTH_ROUTES, PROTECTED_ROUTES } from "@/lib/constants/routes";
import { isApiError } from "@/types/api";
import type { RefreshResponse } from "@/features/auth/types";
import { NextRequest, NextResponse } from "next/server";

const ACCESS_TOKEN_HEADER = "x-access-token";

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const refreshToken = req.cookies.get("refresh_token")?.value;

  if (AUTH_ROUTES.some((route) => pathname.startsWith(route))) {
    if (refreshToken)
      return NextResponse.redirect(new URL(APP_ROUTES.dashboard, req.url));
    return NextResponse.next();
  }

  if (PROTECTED_ROUTES.some((route) => pathname.startsWith(route))) {
    if (!refreshToken)
      return NextResponse.redirect(new URL(APP_ROUTES.login, req.url));

    let res: Response;
    let result: RefreshResponse;
    try {
      res = await fetch(`${API_URL}/api/auth/refresh`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: req.headers.get("cookie") ?? "",
        },
        credentials: "include",
      });
      result = await res.json();
    } catch {
      return NextResponse.next();
    }

    if (!res.ok || isApiError(result)) {
      /**
       * Same distinction the API client draws: only a rejected session signs
       * the user out. A rate limit (the refresh endpoint is capped per IP) or a
       * backend fault is transient, so keep the cookie and render without a
       * fresh token — the client retries on its next request.
       */
      if (res.status !== 401 && res.status !== 403) {
        return NextResponse.next();
      }

      const response = NextResponse.redirect(new URL(APP_ROUTES.login, req.url));
      response.cookies.delete("refresh_token");
      return response;
    }

    const requestHeaders = new Headers(req.headers);
    requestHeaders.set(ACCESS_TOKEN_HEADER, result.data.token);

    const response = NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });

    applyRefreshTokenCookie(response, res.headers);
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
