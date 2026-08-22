import { describe, expect, it } from "vitest";
import { FORTUNE_STICKS, drawStick } from "../src/lib/fortuneStick";

describe("FORTUNE_STICKS dataset", () => {
  it("has exactly 100 sticks numbered 1-100 with no gaps or duplicates", () => {
    expect(FORTUNE_STICKS).toHaveLength(100);
    const numbers = FORTUNE_STICKS.map((s) => s.number).sort((a, b) => a - b);
    expect(numbers).toEqual(Array.from({ length: 100 }, (_, i) => i + 1));
  });

  it("every stick has a non-empty title, poem, and meaning", () => {
    for (const s of FORTUNE_STICKS) {
      expect(s.title.length).toBeGreaterThan(0);
      expect(s.poem.length).toBeGreaterThan(10);
      expect(s.meaning.length).toBeGreaterThan(5);
    }
  });

  it("covers all five grades", () => {
    const grades = new Set(FORTUNE_STICKS.map((s) => s.grade));
    expect(grades).toEqual(new Set(["上上", "上", "中", "下", "下下"]));
  });

  it("extreme grades are rarer than middle grades", () => {
    const count = (g: string) => FORTUNE_STICKS.filter((s) => s.grade === g).length;
    expect(count("上上")).toBeLessThan(count("中"));
    expect(count("下下")).toBeLessThan(count("下"));
  });
});

describe("drawStick", () => {
  it("returns the requested stick when a number is injected", () => {
    expect(drawStick(7).number).toBe(7);
    expect(drawStick(100).number).toBe(100);
  });

  it("throws for out-of-range numbers", () => {
    expect(() => drawStick(0)).toThrow();
    expect(() => drawStick(101)).toThrow();
  });

  it("random draws span a wide range of stick numbers (not biased to a corner)", () => {
    const seen = new Set<number>();
    for (let i = 0; i < 500; i++) seen.add(drawStick().number);
    expect(seen.size).toBeGreaterThan(60);
    expect(Math.min(...seen)).toBeLessThanOrEqual(10);
    expect(Math.max(...seen)).toBeGreaterThanOrEqual(90);
  });
});
