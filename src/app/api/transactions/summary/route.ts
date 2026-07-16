import { API_URL } from "@/lib/env";
import { isApiError } from "@/types/api";
import { NextRequest, NextResponse } from "next/server";

interface SummaryApiResponse<T> {
  success: true;
  data: T;
}

export async function GET(req: NextRequest) {
  const authorization = req.headers.get("Authorization");

  const res = await fetch(
    `${API_URL}/api/transactions/summary?${req.nextUrl.searchParams.toString()}`,
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

  const { data } = result as SummaryApiResponse<unknown>;

  return NextResponse.json(data);
}
