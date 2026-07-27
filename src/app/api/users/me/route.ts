import { forwardJson } from "@/lib/server/proxy-json";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  return forwardJson(req, "/api/users/me");
}

export async function PUT(req: NextRequest) {
  return forwardJson(req, "/api/users/me", {
    method: "PUT",
    body: await req.json(),
  });
}

export async function DELETE(req: NextRequest) {
  return forwardJson(req, "/api/users/me", { method: "DELETE" });
}
