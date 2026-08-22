import { describe, expect, it } from "vitest";
import { scoreHoursOfDay } from "../src/lib/hourTiming";

describe("scoreHoursOfDay", () => {
  const hours = scoreHoursOfDay(2026, 3, 15, "子", ["金"], ["火"]);

  it("returns exactly 12 hour blocks covering all twelve zhi in order", () => {
    expect(hours).toHaveLength(12);
    expect(hours.map((h) => h.zhi)).toEqual(["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"]);
  });

  it("each block's hour pillar has a valid ganzhi whose zhi matches the block", () => {
    for (const h of hours) {
      expect(h.ganZhi).toMatch(/^[甲乙丙丁戊己庚辛壬癸][子丑寅卯辰巳午未申酉戌亥]$/);
      expect(h.ganZhi[1]).toBe(h.zhi);
    }
  });

  it("applies the same clash rules as day scoring: 午 hour clashes a 子 day-pillar", () => {
    const wu = hours.find((h) => h.zhi === "午")!;
    expect(wu.isChong).toBe(true);
    expect(wu.score).toBeLessThanOrEqual(-2);
  });

  it("六合 hour (丑 for a 子 day-pillar) is not marked as a clash", () => {
    const chou = hours.find((h) => h.zhi === "丑")!;
    expect(chou.isChong).toBe(false);
  });

  it("scores stay within the shared -5..4 range", () => {
    for (const h of hours) {
      expect(h.score).toBeGreaterThanOrEqual(-5);
      expect(h.score).toBeLessThanOrEqual(4);
    }
  });

  it("hour stems follow the five-rats cycle: consecutive hour stems differ", () => {
    const stems = hours.map((h) => h.ganZhi[0]);
    for (let i = 1; i < stems.length; i++) {
      expect(stems[i]).not.toBe(stems[i - 1]);
    }
  });
});
