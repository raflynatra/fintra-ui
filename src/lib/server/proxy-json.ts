import { API_URL } from "@/lib/env";
import { isApiError, type ApiSuccess } from "@/types/api";
import { NextRequest, NextResponse } from "next/server";

/** The backend's success envelope, plus optional sibling fields such as `pagination`. */
export type ApiEnvelope = ApiSuccess<unknown> & { pagination?: unknown };

interface ForwardOptions {
  method?: string;
  /** Serialized as JSON. Omit entirely for GET/DELETE. */
  body?: unknown;
  /** Reshapes the success envelope; defaults to unwrapping to `data`. */
  transform?: (envelope: ApiEnvelope) => unknown;
}

/** Proxies a request to the backend, forwarding auth and query string, and unwrapping the response envelope. */
export async function forwardJson(
  req: NextRequest,
  path: string,
  { method = "GET", body, transform }: ForwardOptions = {},
): Promise<NextResponse> {
  const authorization = req.headers.get("Authorization");
  const search = req.nextUrl.searchParams.toString();
  const hasBody = body !== undefined;

  const res = await fetch(`${API_URL}${path}${search ? `?${search}` : ""}`, {
    method,
    headers: {
      ...(hasBody && { "Content-Type": "application/json" }),
      ...(authorization && { Authorization: authorization }),
    },
    ...(hasBody && { body: JSON.stringify(body) }),
  });

  if (res.status === 204) {
    return new NextResponse(null, { status: 204 });
  }

  const result = await res.json();

  if (isApiError(result)) {
    return NextResponse.json(result.error, { status: res.status });
  }

  const envelope = result as ApiEnvelope;

  return NextResponse.json(transform ? transform(envelope) : envelope.data, {
    status: res.status,
  });
}
