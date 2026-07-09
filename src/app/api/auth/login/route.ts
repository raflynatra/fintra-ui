import { API_URL } from "@/lib/env";
import { applyRefreshTokenCookie } from "@/lib/server/auth-cookies";
import { ApiResponse, isApiError } from "@/types/api";
import { LoginData } from "@/types/auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();

  const res = await fetch(`${API_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const result: ApiResponse<LoginData> = await res.json();

  if (isApiError(result)) {
    return NextResponse.json(result.error, { status: res.status });
  }

  const response = NextResponse.json(result.data);
  applyRefreshTokenCookie(response, res.headers);

  return response;
}
