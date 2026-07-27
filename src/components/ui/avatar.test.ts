import { describe, it, expect } from "vitest";
import { getInitials } from "./avatar";

describe("getInitials", () => {
  it("takes the first and last word", () => {
    expect(getInitials("Rafly Natra")).toBe("RN");
  });

  it("skips the middle words", () => {
    expect(getInitials("Ada Byron King Lovelace")).toBe("AL");
  });

  it("returns one letter for a single word", () => {
    expect(getInitials("Rafly")).toBe("R");
  });

  it("uppercases a lowercase name", () => {
    expect(getInitials("rafly natra")).toBe("RN");
  });

  it("collapses extra whitespace", () => {
    expect(getInitials("  Rafly   Natra  ")).toBe("RN");
  });

  it("keeps an accented character intact", () => {
    expect(getInitials("Émile Durkheim")).toBe("ÉD");
  });

  it("keeps a non-BMP character whole rather than splitting the pair", () => {
    // Naive indexing would return a lone surrogate here.
    expect(getInitials("🎉 Party")).toBe("🎉P");
  });

  it.each([
    ["an empty string", ""],
    ["whitespace only", "   "],
    ["undefined", undefined],
  ])("returns nothing for %s, so the icon fallback shows", (_label, name) => {
    expect(getInitials(name)).toBe("");
  });
});
