import { NextRequest, NextResponse } from "next/server";
import type { RefreshResponse } from "@/features/auth/types";
import { isApiError } from "@/types/api";
import { API_URL } from "@/lib/env";
import { applyRefreshTokenCookie } from "@/lib/server/auth-cookies";

export async function POST(req: NextRequest) {
  const res = await fetch(`${API_URL}/api/auth/refresh`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: req.headers.get("cookie") ?? "",
    },
    credentials: "include",
  });

  const result: RefreshResponse = await res.json();

  if (isApiError(result)) {
    return NextResponse.json(result.error, { status: res.status });
  }

  const response = NextResponse.json(result.data);
  applyRefreshTokenCookie(response, res.headers);

  return response;
}
