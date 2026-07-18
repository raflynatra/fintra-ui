import { forwardJson } from "@/lib/server/proxy-json";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  return forwardJson(req, "/api/categories");
}
