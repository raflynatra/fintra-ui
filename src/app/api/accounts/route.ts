import { forwardJson } from "@/lib/server/proxy-json";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  return forwardJson(req, "/api/accounts");
}

export async function POST(req: NextRequest) {
  return forwardJson(req, "/api/accounts", {
    method: "POST",
    body: await req.json(),
  });
}
