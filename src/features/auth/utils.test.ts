import { describe, it, expect } from "vitest";
import { toChangePasswordPayload } from "./utils";

describe("toChangePasswordPayload", () => {
  const values = {
    currentPassword: "old-secret",
    newPassword: "Secret123",
    confirmPassword: "Secret123",
  };

  it("keeps the two fields the backend accepts", () => {
    expect(toChangePasswordPayload(values)).toEqual({
      currentPassword: "old-secret",
      newPassword: "Secret123",
    });
  });

  it("drops the confirmation — the backend's schema has no field for it", () => {
    expect(toChangePasswordPayload(values)).not.toHaveProperty(
      "confirmPassword",
    );
  });
});
