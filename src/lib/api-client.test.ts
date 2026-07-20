import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { apiClient, ApiClientError } from "./api-client";
import { useAuthStore } from "@/features/auth/store";

function jsonResponse(body: unknown, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  } as Response;
}

beforeEach(() => {
  useAuthStore.setState({ user: null, token: null });
  Object.defineProperty(window, "location", {
    value: { origin: "http://localhost:3000", href: "http://localhost:3000/" },
    writable: true,
    configurable: true,
  });
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("apiClient", () => {
  it("returns parsed JSON for a successful request", async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce(jsonResponse({ id: 1 }));
    vi.stubGlobal("fetch", fetchMock);

    await expect(apiClient.get("/api/data")).resolves.toEqual({ id: 1 });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("refreshes the token on 401 and retries the original request once", async () => {
    useAuthStore.setState({ token: "expired" });
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse({ message: "unauthorized" }, 401))
      .mockResolvedValueOnce(jsonResponse({ token: "fresh" }))
      .mockResolvedValueOnce(jsonResponse({ data: "ok" }));
    vi.stubGlobal("fetch", fetchMock);

    await expect(apiClient.get("/api/data")).resolves.toEqual({ data: "ok" });

    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(
      fetchMock.mock.calls.some((c) =>
        String(c[0]).includes("/api/auth/refresh"),
      ),
    ).toBe(true);
    expect(useAuthStore.getState().token).toBe("fresh");
  });

  it("logs out and redirects to /login when the refresh fails", async () => {
    useAuthStore.setState({ token: "expired" });
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse({ message: "unauthorized" }, 401))
      .mockResolvedValueOnce(jsonResponse({ message: "nope" }, 401));
    vi.stubGlobal("fetch", fetchMock);

    await expect(apiClient.get("/api/data")).rejects.toThrow(ApiClientError);
    expect(useAuthStore.getState().token).toBeNull();
    expect(window.location.href).toBe("/login");
  });

  it("throws SERVICE_UNAVAILABLE without signing out when the backend is unreachable", async () => {
    useAuthStore.setState({ user: { name: "Ada", email: "a@b.com" }, token: "t" });
    const fetchMock = vi.fn().mockRejectedValueOnce(new TypeError("fetch failed"));
    vi.stubGlobal("fetch", fetchMock);

    await expect(apiClient.get("/api/data")).rejects.toMatchObject({
      code: "SERVICE_UNAVAILABLE",
      status: 0,
    });
    expect(useAuthStore.getState().token).toBe("t");
    expect(useAuthStore.getState().user).not.toBeNull();
    expect(window.location.href).toBe("http://localhost:3000/");
  });

  it("keeps the session when the refresh itself is unreachable", async () => {
    useAuthStore.setState({ user: { name: "Ada", email: "a@b.com" }, token: "expired" });
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse({ message: "unauthorized" }, 401))
      .mockRejectedValueOnce(new TypeError("fetch failed"));
    vi.stubGlobal("fetch", fetchMock);

    await expect(apiClient.get("/api/data")).rejects.toMatchObject({
      code: "SERVICE_UNAVAILABLE",
    });
    expect(useAuthStore.getState().token).toBe("expired");
    expect(useAuthStore.getState().user).not.toBeNull();
    expect(window.location.href).toBe("http://localhost:3000/");
  });

  it("does not attempt a refresh on invalid-credentials 401", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        jsonResponse(
          { code: "AUTH_INVALID_CREDENTIALS", message: "Wrong password" },
          401,
        ),
      );
    vi.stubGlobal("fetch", fetchMock);

    await expect(
      apiClient.post("/api/auth/login", { email: "a@b.com", password: "x" }),
    ).rejects.toThrow("Wrong password");
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("shares a single refresh across concurrent 401s", async () => {
    useAuthStore.setState({ token: "expired" });
    let refreshCount = 0;
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes("/api/auth/refresh")) {
        refreshCount += 1;
        useAuthStore.setState({ token: "fresh" });
        return jsonResponse({ token: "fresh" });
      }
      return useAuthStore.getState().token === "fresh"
        ? jsonResponse({ ok: true })
        : jsonResponse({ message: "unauthorized" }, 401);
    });
    vi.stubGlobal("fetch", fetchMock);

    const [a, b] = await Promise.all([
      apiClient.get("/api/a"),
      apiClient.get("/api/b"),
    ]);

    expect(a).toEqual({ ok: true });
    expect(b).toEqual({ ok: true });
    expect(refreshCount).toBe(1);
  });
});
