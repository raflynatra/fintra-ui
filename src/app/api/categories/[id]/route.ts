import { forwardJson } from "@/lib/server/proxy-json";
import { NextRequest } from "next/server";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  return forwardJson(req, `/api/categories/${id}`, { method: "DELETE" });
}
