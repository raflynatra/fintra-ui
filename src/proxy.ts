import { API_URL } from "@/lib/constants";
import { isApiError } from "@/types/api";
import type { RefreshResponse } from "@/types/auth";
import { NextRequest, NextResponse } from "next/server";

const PROTECTED_ROUTES = ["/dashboard"];
const AUTH_ROUTES = ["/login"];
const ACCESS_TOKEN_HEADER = "x-access-token";

type UpstreamHeaders = Headers & {
  getSetCookie?: () => string[];
};

function applyRefreshTokenCookie(response: NextResponse, headers: Headers) {
  const upstreamHeaders = headers as UpstreamHeaders;
  const rawSetCookie = headers.get("set-cookie");
  const setCookies =
    typeof upstreamHeaders.getSetCookie === "function"
      ? upstreamHeaders.getSetCookie()
      : rawSetCookie
        ? [rawSetCookie]
        : [];

  for (const setCookie of setCookies) {
    const parts = setCookie.split(";").map((part) => part.trim());
    const tokenPart = parts.find((part) => part.startsWith("refresh_token="));

    if (!tokenPart) continue;

    const value = tokenPart.slice("refresh_token=".length);
    const options: {
      path?: string;
      expires?: Date;
      maxAge?: number;
      httpOnly?: boolean;
      secure?: boolean;
      sameSite?: "strict" | "lax" | "none";
    } = { path: "/" };

    for (const part of parts.slice(1)) {
      const [rawKey, ...rest] = part.split("=");
      const key = rawKey.toLowerCase();
      const rawValue = rest.join("=").trim();

      if (key === "path" && rawValue) options.path = rawValue;
      if (key === "httponly") options.httpOnly = true;
      if (key === "secure") options.secure = true;
      if (key === "samesite") {
        const sameSite = rawValue.toLowerCase();
        if (
          sameSite === "strict" ||
          sameSite === "lax" ||
          sameSite === "none"
        ) {
          options.sameSite = sameSite;
        }
      }
      if (key === "max-age") {
        const maxAge = Number(rawValue);
        if (!Number.isNaN(maxAge)) options.maxAge = maxAge;
      }
      if (key === "expires") {
        const expires = new Date(rawValue);
        if (!Number.isNaN(expires.getTime())) options.expires = expires;
      }
    }

    response.cookies.set({
      name: "refresh_token",
      value,
      ...options,
    });
  }
}

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

    const res = await fetch(`${API_URL}/api/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: req.headers.get("cookie") ?? "",
      },
      credentials: "include",
    });

    const result: RefreshResponse = await res.json();

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
