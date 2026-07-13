import { useAuthStore } from "@/features/auth/store";
import { RefreshData } from "@/features/auth/types";

type FetchOptions = RequestInit & {
  params?: Record<string, string>;
  _retry?: boolean;
};

/**
 * Error thrown by the API client. Carries the HTTP `status` and the backend
 * error `code` so callers (and React Query) can branch on them reliably
 * instead of string-matching messages.
 */
export class ApiClientError extends Error {
  readonly status: number;
  readonly code?: string;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = "ApiClientError";
    this.status = status;
    this.code = code;
  }
}

// "refreshed" — got a fresh token, retry the original request.
// "invalid"   — backend rejected the refresh (expired/invalid session) → sign out.
// "unreachable" — network/backend failure; NOT an auth event, keep the session.
type RefreshOutcome = "refreshed" | "invalid" | "unreachable";

let refreshPromise: Promise<RefreshOutcome> | null = null;

async function tryRefresh(): Promise<RefreshOutcome> {
  if (refreshPromise) return refreshPromise;

  refreshPromise = fetch("/api/auth/refresh", {
    method: "POST",
    credentials: "include",
  })
    .then(async (res): Promise<RefreshOutcome> => {
      if (!res.ok) return "invalid";
      const data: RefreshData = await res.json();
      useAuthStore.getState().setToken(data.token);
      return "refreshed";
    })
    // A rejected fetch (backend down) or a non-JSON body is a connectivity
    // problem, not a failed auth — distinguish it so callers don't sign out.
    .catch(() => "unreachable" as const)
    .finally(() => {
      refreshPromise = null;
    });

  return refreshPromise;
}

const SERVICE_UNAVAILABLE_MESSAGE =
  "Can't reach the server. Please try again.";

async function apiFetch<T>(
  endpoint: string,
  options: FetchOptions = {},
): Promise<T> {
  const { params, _retry, ...fetchOptions } = options;

  const url = new URL(endpoint, window.location.origin);
  if (params) {
    Object.entries(params).forEach(([key, val]) =>
      url.searchParams.set(key, val),
    );
  }

  const token = useAuthStore.getState().token;
  const headers = new Headers(fetchOptions.headers);

  headers.set("Content-Type", "application/json");
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  let response: Response;
  try {
    response = await fetch(url.toString(), {
      ...fetchOptions,
      headers,
      credentials: "include",
    });
  } catch {
    // Backend unreachable on the initial request. Surface as a connectivity
    // error (toasted globally) without disturbing the session.
    throw new ApiClientError(
      SERVICE_UNAVAILABLE_MESSAGE,
      0,
      "SERVICE_UNAVAILABLE",
    );
  }

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ message: "Request failed" }));

    if (
      response.status === 401 &&
      !_retry &&
      error.code !== "AUTH_INVALID_CREDENTIALS"
    ) {
      const outcome = await tryRefresh();

      if (outcome === "refreshed") {
        return apiFetch<T>(endpoint, { ...options, _retry: true });
      }

      // Backend unreachable during refresh — keep the user signed in; let the
      // failure surface as a connectivity error toast.
      if (outcome === "unreachable") {
        throw new ApiClientError(
          SERVICE_UNAVAILABLE_MESSAGE,
          0,
          "SERVICE_UNAVAILABLE",
        );
      }

      // outcome === "invalid": a genuinely expired/invalid session.
      useAuthStore.getState().logout();
      window.location.href = "/login";
      throw new ApiClientError("Session expired", 401, error.code);
    }

    throw new ApiClientError(
      error.message || `HTTP error ${response.status}`,
      response.status,
      error.code,
    );
  }

  if (response.status === 204) return null as T;

  return response.json() as Promise<T>;
}

export const apiClient = {
  get: <T>(endpoint: string, options?: FetchOptions) =>
    apiFetch<T>(endpoint, { ...options, method: "GET" }),

  post: <T>(endpoint: string, body: unknown, options?: FetchOptions) =>
    apiFetch<T>(endpoint, {
      ...options,
      method: "POST",
      body: JSON.stringify(body),
    }),

  put: <T>(endpoint: string, body: unknown, options?: FetchOptions) =>
    apiFetch<T>(endpoint, {
      ...options,
      method: "PUT",
      body: JSON.stringify(body),
    }),

  patch: <T>(endpoint: string, body: unknown, options?: FetchOptions) =>
    apiFetch<T>(endpoint, {
      ...options,
      method: "PATCH",
      body: JSON.stringify(body),
    }),

  delete: <T>(endpoint: string, options?: FetchOptions) =>
    apiFetch<T>(endpoint, { ...options, method: "DELETE" }),
};
