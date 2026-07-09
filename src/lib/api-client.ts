import { useAuthStore } from "@/stores/auth-store";
import { RefreshData } from "@/types/auth";

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

let refreshPromise: Promise<boolean> | null = null;

async function tryRefresh(): Promise<boolean> {
  if (refreshPromise) return refreshPromise;

  refreshPromise = fetch("/api/auth/refresh", {
    method: "POST",
    credentials: "include",
  })
    .then(async (res) => {
      if (!res.ok) return false;
      const data: RefreshData = await res.json();
      useAuthStore.getState().setToken(data.token);
      return true;
    })
    .catch(() => false)
    .finally(() => {
      refreshPromise = null;
    });

  return refreshPromise;
}

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

  const response = await fetch(url.toString(), {
    ...fetchOptions,
    headers,
    credentials: "include",
  });

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ message: "Request failed" }));

    if (
      response.status === 401 &&
      !_retry &&
      error.code !== "AUTH_INVALID_CREDENTIALS"
    ) {
      const refreshed = await tryRefresh();

      if (refreshed) {
        return apiFetch<T>(endpoint, { ...options, _retry: true });
      }

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
