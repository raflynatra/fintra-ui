import { forwardJson } from "@/lib/server/proxy-json";
import { NextRequest } from "next/server";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  return forwardJson(req, `/api/transactions/${id}`, {
    method: "PUT",
    body: await req.json(),
  });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  return forwardJson(req, `/api/transactions/${id}`, { method: "DELETE" });
}
