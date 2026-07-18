import { API_URL } from "@/lib/env";
import { isApiError, type ApiSuccess } from "@/types/api";
import { NextRequest, NextResponse } from "next/server";

/**
 * The backend's success envelope, plus the sibling fields some endpoints add
 * alongside `data` (currently only `pagination`, on the transaction list).
 */
export type ApiEnvelope = ApiSuccess<unknown> & { pagination?: unknown };

interface ForwardOptions {
  method?: string;
  /** Serialized as JSON. Omit entirely for GET/DELETE. */
  body?: unknown;
  /**
   * Reshape the success envelope. Defaults to unwrapping to `data` — override
   * only when the client needs a sibling field too.
   */
  transform?: (envelope: ApiEnvelope) => unknown;
}

/**
 * Proxies a request through to the backend, applying the four rules every
 * route handler here shares:
 *
 *  1. pass the client's `Authorization` header straight through
 *  2. forward the incoming query string
 *  3. short-circuit 204 before trying to parse a body
 *  4. on an error envelope, hand back the *inner* error (so the client reads a
 *     flat `{ code, message, details }`); otherwise unwrap to `data`
 *
 * Not suitable for the auth routes: they also rotate the refresh cookie, so
 * `login`/`refresh`/`logout` stay bespoke.
 */
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
