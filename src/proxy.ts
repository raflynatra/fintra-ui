import { API_URL } from "@/lib/env";
import { applyRefreshTokenCookie } from "@/lib/server/auth-cookies";
import { isApiError } from "@/types/api";
import type { RefreshResponse } from "@/features/auth/types";
import { NextRequest, NextResponse } from "next/server";

const PROTECTED_ROUTES = ["/dashboard"];
const AUTH_ROUTES = ["/login"];
const ACCESS_TOKEN_HEADER = "x-access-token";

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const refreshToken = req.cookies.get("refresh_token")?.value;

  // Redirect logged-in users away from auth pages
  if (AUTH_ROUTES.some((route) => pathname.startsWith(route))) {
    if (refreshToken)
      return NextResponse.redirect(new URL("/dashboard", req.url));
    return NextResponse.next();
  }

  // Protect private routes
  if (PROTECTED_ROUTES.some((route) => pathname.startsWith(route))) {
    if (!refreshToken) return NextResponse.redirect(new URL("/login", req.url));

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
      // Backend unreachable (ECONNREFUSED) or a non-JSON gateway page (502/504).
      // A transient outage is NOT a sign-out: let the request through with the
      // session intact and no access token. The client surfaces the error (as a
      // toast) once it tries to fetch. Do not touch the refresh cookie.
      return NextResponse.next();
    }

    if (!res.ok || isApiError(result)) {
      const response = NextResponse.redirect(new URL("/login", req.url));
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
