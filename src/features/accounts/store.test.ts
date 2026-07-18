import { describe, it, expect, beforeEach } from "vitest";
import { useAccountStore } from "./store";
import type { Account } from "./types";

const account = { id: "a1", name: "Cash", type: "cash" } as Account;

describe("useAccountStore", () => {
  beforeEach(() => {
    useAccountStore.setState({
      sheetOpen: false,
      editing: null,
      archiving: null,
    });
  });

  it("openCreate opens the sheet with no account to edit", () => {
    useAccountStore.getState().openCreate();

    expect(useAccountStore.getState().sheetOpen).toBe(true);
    expect(useAccountStore.getState().editing).toBeNull();
  });

  it("openEdit opens the sheet on the given account", () => {
    useAccountStore.getState().openEdit(account);

    expect(useAccountStore.getState().sheetOpen).toBe(true);
    expect(useAccountStore.getState().editing).toBe(account);
  });

  it("openCreate after openEdit clears the previous selection", () => {
    // Otherwise "Add account" would reopen the last edited one — null is a
    // meaningful open state, so it has to be reset explicitly.
    useAccountStore.getState().openEdit(account);
    useAccountStore.getState().openCreate();

    expect(useAccountStore.getState().editing).toBeNull();
    expect(useAccountStore.getState().sheetOpen).toBe(true);
  });

  it("setSheetOpen(false) closes without disturbing the archive target", () => {
    useAccountStore.getState().setArchiving(account);
    useAccountStore.getState().openCreate();
    useAccountStore.getState().setSheetOpen(false);

    expect(useAccountStore.getState().sheetOpen).toBe(false);
    expect(useAccountStore.getState().archiving).toBe(account);
  });

  it("setArchiving selects and clears the archive target", () => {
    useAccountStore.getState().setArchiving(account);
    expect(useAccountStore.getState().archiving).toBe(account);

    useAccountStore.getState().setArchiving(null);
    expect(useAccountStore.getState().archiving).toBeNull();
  });
});
