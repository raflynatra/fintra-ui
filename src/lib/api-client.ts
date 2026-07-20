import { useAuthStore } from "@/features/auth/store";
import { RefreshData } from "@/features/auth/types";
import type { ApiErrorDetail } from "@/types/api";

type FetchOptions = RequestInit & {
  params?: Record<string, string>;
  _retry?: boolean;
};

/** Error thrown by the API client, carrying the HTTP `status`, backend `code`, and 422 field `details`. */
export class ApiClientError extends Error {
  readonly status: number;
  readonly code?: string;
  readonly details?: ApiErrorDetail[];

  constructor(
    message: string,
    status: number,
    code?: string,
    details?: ApiErrorDetail[],
  ) {
    super(message);
    this.name = "ApiClientError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

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

      if (outcome === "unreachable") {
        throw new ApiClientError(
          SERVICE_UNAVAILABLE_MESSAGE,
          0,
          "SERVICE_UNAVAILABLE",
        );
      }

      useAuthStore.getState().logout();
      window.location.href = "/login";
      throw new ApiClientError("Session expired", 401, error.code);
    }

    throw new ApiClientError(
      error.message || `HTTP error ${response.status}`,
      response.status,
      error.code,
      error.details,
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
