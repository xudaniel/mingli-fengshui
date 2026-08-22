import { describe, expect, it } from "vitest";
import { SOLAR_TERMS, currentSolarTerm } from "../src/lib/solarTerms";

describe("SOLAR_TERMS dataset", () => {
  it("has exactly 24 unique terms, 6 per season", () => {
    expect(SOLAR_TERMS).toHaveLength(24);
    expect(new Set(SOLAR_TERMS.map((t) => t.name)).size).toBe(24);
    for (const season of ["春", "夏", "秋", "冬"]) {
      expect(SOLAR_TERMS.filter((t) => t.season === season)).toHaveLength(6);
    }
  });

  it("every term has non-empty description and wellness text", () => {
    for (const t of SOLAR_TERMS) {
      expect(t.description.length).toBeGreaterThan(5);
      expect(t.wellness.length).toBeGreaterThan(10);
    }
  });
});

describe("currentSolarTerm", () => {
  it("identifies known reference dates correctly", () => {
    // 2026-06-21 是夏至（6月21-22日）
    expect(currentSolarTerm(new Date(2026, 5, 25)).name).toBe("夏至");
    // 2026-02-10 落在立春（2月3-5日）之后、雨水（2月18-20日）之前
    expect(currentSolarTerm(new Date(2026, 1, 10)).name).toBe("立春");
    // 2026-10-01 落在秋分（9月22-24日）之后、寒露（10月8-9日）之前
    expect(currentSolarTerm(new Date(2026, 9, 1)).name).toBe("秋分");
  });

  it("handles the year-start boundary (early January falls in 冬至 or 小寒)", () => {
    const term = currentSolarTerm(new Date(2026, 0, 3));
    expect(["冬至", "小寒"]).toContain(term.name);
  });

  it("handles late December (冬至 of the same calendar year)", () => {
    expect(currentSolarTerm(new Date(2026, 11, 25)).name).toBe("冬至");
  });
});
