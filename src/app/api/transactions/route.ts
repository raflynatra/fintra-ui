import { forwardJson } from "@/lib/server/proxy-json";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  return forwardJson(req, "/api/transactions", {
    transform: ({ data, pagination }) => ({ transactions: data, pagination }),
  });
}

export async function POST(req: NextRequest) {
  return forwardJson(req, "/api/transactions", {
    method: "POST",
    body: await req.json(),
  });
}
