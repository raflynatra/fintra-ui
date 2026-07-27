import { API_URL } from "@/lib/env";
import { isApiError } from "@/types/api";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(req: NextRequest) {
  const authorization = req.headers.get("Authorization");

  const res = await fetch(`${API_URL}/api/auth/password`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...(authorization && { Authorization: authorization }),
    },
    body: JSON.stringify(await req.json()),
  });

  if (res.status === 204) {
    (await cookies()).delete("refresh_token");
    return new NextResponse(null, { status: 204 });
  }

  const result = await res.json();

  if (isApiError(result)) {
    return NextResponse.json(result.error, { status: res.status });
  }

  return NextResponse.json(result.data, { status: res.status });
}
