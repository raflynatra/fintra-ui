import { forwardJson } from "@/lib/server/proxy-json";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  // The only endpoint with a sibling field alongside `data`: the client needs
  // `pagination` for the infinite list, so reshape rather than plain-unwrap.
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
