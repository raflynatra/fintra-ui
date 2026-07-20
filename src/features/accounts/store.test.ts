import { describe, it, expect, beforeEach } from "vitest";
import { useAccountStore } from "./store";
import type { Account } from "./types";

const account = { id: "a1", name: "Cash", type: "cash" } as Account;

describe("useAccountStore", () => {
  beforeEach(() => {
    useAccountStore.setState({ formPayload: null, archiving: null });
  });

  it("setFormPayload selects an account and resetFormPayload clears it", () => {
    useAccountStore.getState().setFormPayload(account);
    expect(useAccountStore.getState().formPayload).toBe(account);

    useAccountStore.getState().resetFormPayload();
    expect(useAccountStore.getState().formPayload).toBeNull();
  });

  it("resetFormPayload leaves the archive target untouched", () => {
    useAccountStore.getState().setArchiving(account);
    useAccountStore.getState().setFormPayload(account);
    useAccountStore.getState().resetFormPayload();

    expect(useAccountStore.getState().formPayload).toBeNull();
    expect(useAccountStore.getState().archiving).toBe(account);
  });

  it("setArchiving selects and clears the archive target", () => {
    useAccountStore.getState().setArchiving(account);
    expect(useAccountStore.getState().archiving).toBe(account);

    useAccountStore.getState().setArchiving(null);
    expect(useAccountStore.getState().archiving).toBeNull();
  });
});
