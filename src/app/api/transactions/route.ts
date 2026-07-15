import { API_URL } from "@/lib/env";
import { isApiError } from "@/types/api";
import { NextRequest, NextResponse } from "next/server";

// Minimal local shape for the backend's paginated envelope
// (`{ success, data, pagination }`) — kept local rather than importing
// `@/features/transactions/types` so this route doesn't depend on that
// feature module's shape; it just forwards whatever the backend returns.
interface PaginatedApiResponse<T> {
  success: true;
  data: T;
  pagination?: unknown;
}

export async function GET(req: NextRequest) {
  const authorization = req.headers.get("Authorization");

  const res = await fetch(
    `${API_URL}/api/transactions?${req.nextUrl.searchParams.toString()}`,
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

  const { data, pagination } = result as PaginatedApiResponse<unknown>;

  return NextResponse.json({ transactions: data, pagination });
}

export async function POST(req: NextRequest) {
  const authorization = req.headers.get("Authorization");
  const body = await req.json();

  const res = await fetch(`${API_URL}/api/transactions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(authorization && { Authorization: authorization }),
    },
    body: JSON.stringify(body),
  });

  const result = await res.json();

  if (isApiError(result)) {
    return NextResponse.json(result.error, { status: res.status });
  }

  return NextResponse.json(result.data, { status: res.status });
}
