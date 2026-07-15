import { API_URL } from "@/lib/env";
import { isApiError } from "@/types/api";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const authorization = req.headers.get("Authorization");
  const body = await req.json();

  const res = await fetch(`${API_URL}/api/transactions/${id}`, {
    method: "PUT",
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

  return NextResponse.json(result.data);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const authorization = req.headers.get("Authorization");

  const res = await fetch(`${API_URL}/api/transactions/${id}`, {
    method: "DELETE",
    headers: {
      ...(authorization && { Authorization: authorization }),
    },
  });

  if (res.status === 204) {
    return new NextResponse(null, { status: 204 });
  }

  const result = await res.json();

  if (isApiError(result)) {
    return NextResponse.json(result.error, { status: res.status });
  }

  return NextResponse.json(result.data);
}
