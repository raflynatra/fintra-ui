import { useAuthStore } from "@/stores/auth-store";
import { RefreshData } from "@/types/auth";

type FetchOptions = RequestInit & {
  params?: Record<string, string>;
  _retry?: boolean;
};

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
      throw new Error("Session expired");
    }

    throw new Error(error.message || `HTTP error ${response.status}`);
  }

  if (response.status === 204) return null as T;

  return response.json() as Promise<T>;
}

async function tryRefresh(): Promise<boolean> {
  try {
    const res = await fetch("/api/auth/refresh", {
      method: "POST",
      credentials: "include",
    });

    if (!res.ok) return false;

    const data: RefreshData = await res.json();
    useAuthStore.getState().setToken(data.token);
    return true;
  } catch {
    return false;
  }
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
