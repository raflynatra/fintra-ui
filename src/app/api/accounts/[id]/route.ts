import { forwardJson } from "@/lib/server/proxy-json";
import { NextRequest } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  return forwardJson(req, `/api/accounts/${id}`);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  return forwardJson(req, `/api/accounts/${id}`, {
    method: "PUT",
    body: await req.json(),
  });
}

// A soft delete: the backend archives the account and keeps its history.
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  return forwardJson(req, `/api/accounts/${id}`, { method: "DELETE" });
}
