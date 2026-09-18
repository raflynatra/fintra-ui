import { describe, it, expect, beforeEach } from "vitest";
import { currentMonth, shiftMonth } from "@/lib/date";
import { useReportsStore } from "./store";

describe("useReportsStore", () => {
  beforeEach(() => {
    useReportsStore.setState({ month: currentMonth() });
  });

  it("starts on the current month", () => {
    expect(useReportsStore.getState().month).toBe(currentMonth());
  });

  it("setMonth moves the selected period", () => {
    const previous = shiftMonth(currentMonth(), -1);
    useReportsStore.getState().setMonth(previous);

    expect(useReportsStore.getState().month).toBe(previous);
  });

  it("keeps its own month, independent of the other feature stores", async () => {
    const { useBudgetStore } = await import("@/features/budgets/store");

    useReportsStore.getState().setMonth(shiftMonth(currentMonth(), -2));

    expect(useBudgetStore.getState().month).toBe(currentMonth());
  });
});
