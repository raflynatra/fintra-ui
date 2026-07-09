import { NextResponse } from "next/server";

type UpstreamHeaders = Headers & {
  getSetCookie?: () => string[];
};

export function applyRefreshTokenCookie(
  response: NextResponse,
  headers: Headers,
) {
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
