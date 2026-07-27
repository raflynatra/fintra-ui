import { describe, it, expect } from "vitest";
import { monthRange, shiftMonth } from "./date";

describe("shiftMonth", () => {
  it.each([
    ["2026-07", -1, "2026-06"],
    ["2026-07", 1, "2026-08"],
    ["2026-01", -1, "2025-12"],
    ["2026-12", 1, "2027-01"],
  ])("shifts %s by %i to %s", (month, delta, expected) => {
    expect(shiftMonth(month, delta)).toBe(expected);
  });
});

describe("monthRange", () => {
  it.each([
    ["2026-07", "2026-07-01", "2026-07-31"],
    ["2026-04", "2026-04-01", "2026-04-30"],
    ["2026-02", "2026-02-01", "2026-02-28"],
    ["2024-02", "2024-02-01", "2024-02-29"],
  ])("expands %s to %s – %s", (month, dateFrom, dateTo) => {
    expect(monthRange(month)).toEqual({ dateFrom, dateTo });
  });
});
