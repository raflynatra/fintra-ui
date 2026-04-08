import { NextRequest, NextResponse } from "next/server";
import type { RefreshResponse } from "@/types/auth";
import { isApiError } from "@/types/api";
import { API_URL } from "@/lib/constants";

export async function POST(req: NextRequest) {
  const res = await fetch(`${API_URL}/api/auth/refresh`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: req.headers.get("cookie") ?? "",
    },
  });

  const result: RefreshResponse = await res.json();

  if (isApiError(result)) {
    return NextResponse.json(result.error, { status: res.status });
  }

  const response = NextResponse.json(result.data);

  const setCookie = res.headers.get("set-cookie");
  if (setCookie) {
    response.headers.set("set-cookie", setCookie);
  }

  return response;
}
