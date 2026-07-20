import { describe, it, expect, beforeEach } from "vitest";
import { useTransactionStore } from "./store";
import type { Transaction } from "./types";

const transaction = {
  id: "t1",
  type: "expense",
  amount: 1000,
} as Transaction;

describe("useTransactionStore", () => {
  beforeEach(() => {
    useTransactionStore.setState({ params: { size: 10 }, formPayload: null });
  });

  describe("filters", () => {
    it("setFilters merges into the existing params", () => {
      useTransactionStore.getState().setFilters({ type: "expense" });
      useTransactionStore.getState().setFilters({ accountId: "a1" });

      expect(useTransactionStore.getState().params).toEqual({
        size: 10,
        type: "expense",
        accountId: "a1",
      });
    });

    it("setFilters can clear a single filter with undefined", () => {
      useTransactionStore.getState().setFilters({ type: "expense" });
      useTransactionStore.getState().setFilters({ type: undefined });

      expect(useTransactionStore.getState().params.type).toBeUndefined();
    });

    it("clearFilters drops every filter but keeps the page size", () => {
      useTransactionStore.getState().setFilters({
        type: "income",
        categoryId: "c1",
        accountId: "a1",
        dateFrom: "2026-07-01",
        dateTo: "2026-07-31",
      });

      useTransactionStore.getState().clearFilters();

      expect(useTransactionStore.getState().params).toEqual({ size: 10 });
    });
  });

  describe("form payload", () => {
    it("setFormPayload selects a transaction and resetFormPayload clears it", () => {
      useTransactionStore.getState().setFormPayload(transaction);
      expect(useTransactionStore.getState().formPayload).toBe(transaction);

      useTransactionStore.getState().resetFormPayload();
      expect(useTransactionStore.getState().formPayload).toBeNull();
    });

    it("leaves filters untouched", () => {
      useTransactionStore.getState().setFilters({ type: "income" });
      useTransactionStore.getState().setFormPayload(transaction);

      expect(useTransactionStore.getState().params.type).toBe("income");
    });
  });
});
