import { forwardJson } from "@/lib/server/proxy-json";
import { NextRequest } from "next/server";

/**
 * Registration issues no session — the backend answers 204 and the client signs
 * in straight after — so this needs no refresh-cookie handling, unlike `login`.
 */
export async function POST(req: NextRequest) {
  const body = await req.json();

  return forwardJson(req, "/api/auth/register", { method: "POST", body });
}
