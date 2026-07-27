import { describe, it, expect } from "vitest";
import {
  changePasswordFormSchema,
  loginSchema,
  passwordSchema,
  PASSWORD_RULES,
} from "./schema";

describe("loginSchema", () => {
  it("accepts a valid email and password", () => {
    const result = loginSchema.safeParse({
      email: "user@example.com",
      password: "secret1",
    });
    expect(result.success).toBe(true);
  });

  it("rejects an invalid email", () => {
    const result = loginSchema.safeParse({
      email: "not-an-email",
      password: "secret1",
    });
    expect(result.success).toBe(false);
  });

  it("accepts a short legacy password — the backend's login rule is min(1)", () => {
    const result = loginSchema.safeParse({
      email: "user@example.com",
      password: "123",
    });
    expect(result.success).toBe(true);
  });

  it("still requires a password", () => {
    const result = loginSchema.safeParse({
      email: "user@example.com",
      password: "",
    });
    expect(result.success).toBe(false);
  });
});

describe("passwordSchema", () => {
  it("accepts a password meeting every rule", () => {
    expect(passwordSchema.safeParse("Secret123").success).toBe(true);
  });

  it.each([
    ["length", "Secr3t"],
    ["uppercase", "secret123"],
    ["lowercase", "SECRET123"],
    ["number", "SecretPass"],
  ])(
    "rejects a password missing the %s rule, and names it in the message",
    (ruleId, password) => {
      const result = passwordSchema.safeParse(password);
      expect(result.success).toBe(false);

      const rule = PASSWORD_RULES.find((entry) => entry.id === ruleId)!;
      const messages = result.success
        ? []
        : result.error.issues.map((issue) => issue.message);

      // Pins the checklist to the schema: the label the UI shows is the same
      // string the resolver raises.
      expect(messages).toContain(rule.label);
    },
  );

  it("rejects one over 100 characters", () => {
    expect(passwordSchema.safeParse(`Aa1${"x".repeat(98)}`).success).toBe(
      false,
    );
  });
});

describe("PASSWORD_RULES", () => {
  it("every rule passes for a compliant password", () => {
    expect(PASSWORD_RULES.every((rule) => rule.test("Secret123"))).toBe(true);
  });

  it("no rule passes for an empty password", () => {
    expect(PASSWORD_RULES.some((rule) => rule.test(""))).toBe(false);
  });

  it("each rule fails exactly the password missing it", () => {
    const byId = Object.fromEntries(
      PASSWORD_RULES.map((rule) => [rule.id, rule]),
    );

    expect(byId.length?.test("Secr3t")).toBe(false);
    expect(byId.uppercase.test("secret123")).toBe(false);
    expect(byId.lowercase.test("SECRET123")).toBe(false);
    expect(byId.number.test("SecretPass")).toBe(false);
  });
});

describe("changePasswordFormSchema", () => {
  const valid = {
    currentPassword: "123",
    newPassword: "Secret123",
    confirmPassword: "Secret123",
  };

  it("accepts a current password of any length with a valid, matching new one", () => {
    expect(changePasswordFormSchema.safeParse(valid).success).toBe(true);
  });

  it("requires the current password", () => {
    const result = changePasswordFormSchema.safeParse({
      ...valid,
      currentPassword: "",
    });
    expect(result.success).toBe(false);
  });

  it("requires the confirmation", () => {
    const result = changePasswordFormSchema.safeParse({
      ...valid,
      confirmPassword: "",
    });
    expect(result.success).toBe(false);
  });

  it("reports a mismatch under confirmPassword, not newPassword", () => {
    const result = changePasswordFormSchema.safeParse({
      ...valid,
      confirmPassword: "Secret124",
    });

    expect(result.success).toBe(false);
    const paths = result.success
      ? []
      : result.error.issues.map((issue) => issue.path.join("."));
    expect(paths).toContain("confirmPassword");
    expect(paths).not.toContain("newPassword");
  });

  it("still rejects a weak new password even when the confirmation matches", () => {
    const result = changePasswordFormSchema.safeParse({
      currentPassword: "old",
      newPassword: "weakpass",
      confirmPassword: "weakpass",
    });
    expect(result.success).toBe(false);
  });
});
