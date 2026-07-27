import { forwardJson } from "@/lib/server/proxy-json";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  return forwardJson(req, "/api/budgets", {
    method: "POST",
    body: await req.json(),
  });
}
