import { API_URL } from "@/lib/env";
import { isApiError } from "@/types/api";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const authorization = req.headers.get("Authorization");

  const res = await fetch(
    `${API_URL}/api/categories?${req.nextUrl.searchParams.toString()}`,
    {
      headers: {
        "Content-Type": "application/json",
        ...(authorization && { Authorization: authorization }),
      },
    },
  );

  const result = await res.json();

  if (isApiError(result)) {
    return NextResponse.json(result.error, { status: res.status });
  }

  return NextResponse.json(result.data);
}
