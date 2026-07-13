import { describe, it, expect, beforeEach } from "vitest";
import { useAuthStore } from "./store";

describe("useAuthStore", () => {
  beforeEach(() => {
    useAuthStore.setState({ user: null, token: null });
  });

  it("setUser stores both the user and token", () => {
    useAuthStore
      .getState()
      .setUser({ name: "Ada", email: "ada@example.com" }, "token-1");

    expect(useAuthStore.getState().user).toEqual({
      name: "Ada",
      email: "ada@example.com",
    });
    expect(useAuthStore.getState().token).toBe("token-1");
  });

  it("setToken updates only the token", () => {
    useAuthStore.getState().setToken("token-2");

    expect(useAuthStore.getState().token).toBe("token-2");
    expect(useAuthStore.getState().user).toBeNull();
  });

  it("logout clears user and token", () => {
    useAuthStore
      .getState()
      .setUser({ name: "Ada", email: "ada@example.com" }, "token-1");

    useAuthStore.getState().logout();

    expect(useAuthStore.getState().user).toBeNull();
    expect(useAuthStore.getState().token).toBeNull();
  });
});
