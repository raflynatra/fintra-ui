import { API_URL } from "@/lib/env";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const authorization = req.headers.get("Authorization");

  const cookieStore = await cookies();
  const refreshToken = cookieStore.get("refresh_token")?.value;

  try {
    await fetch(`${API_URL}/api/auth/logout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(authorization && { Authorization: authorization }),
        ...(refreshToken && { Cookie: `refresh_token=${refreshToken}` }),
      },
    });
  } catch {}

  const response = NextResponse.json({ message: "Logged out" });

  cookieStore.delete("refresh_token");

  return response;
}
