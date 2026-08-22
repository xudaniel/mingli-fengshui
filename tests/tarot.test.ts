import { describe, expect, it } from "vitest";
import { TAROT_DECK, drawCard } from "../src/lib/tarot";

describe("TAROT_DECK", () => {
  it("has exactly 78 cards: 22 major + 56 minor", () => {
    expect(TAROT_DECK).toHaveLength(78);
    expect(TAROT_DECK.filter((c) => c.arcana === "major")).toHaveLength(22);
    expect(TAROT_DECK.filter((c) => c.arcana === "minor")).toHaveLength(56);
  });

  it("all card names are unique (zh and en)", () => {
    expect(new Set(TAROT_DECK.map((c) => c.name)).size).toBe(78);
    expect(new Set(TAROT_DECK.map((c) => c.nameEn)).size).toBe(78);
  });

  it("every card has distinct non-empty upright and reversed meanings", () => {
    for (const c of TAROT_DECK) {
      expect(c.upright.length).toBeGreaterThan(5);
      expect(c.reversed.length).toBeGreaterThan(5);
      expect(c.upright).not.toBe(c.reversed);
    }
  });
});

describe("drawCard", () => {
  it("returns the requested card and orientation when injected", () => {
    const d = drawCard(0, true);
    expect(d.card.name).toBe("愚者");
    expect(d.reversed).toBe(true);
  });

  it("throws for out-of-range index", () => {
    expect(() => drawCard(78)).toThrow();
    expect(() => drawCard(-1)).toThrow();
  });

  it("random draws produce both orientations and a wide card spread", () => {
    const seen = new Set<string>();
    let reversedCount = 0;
    for (let i = 0; i < 400; i++) {
      const d = drawCard();
      seen.add(d.card.name);
      if (d.reversed) reversedCount++;
    }
    expect(seen.size).toBeGreaterThan(50);
    expect(reversedCount).toBeGreaterThan(100);
    expect(reversedCount).toBeLessThan(300);
  });
});
