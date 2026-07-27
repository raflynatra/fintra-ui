import { describe, it, expect } from "vitest";
import { shiftMonth } from "./date";

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
