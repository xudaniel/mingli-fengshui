import { describe, expect, it } from "vitest";
import { computeBazi } from "../src/lib/bazi";
import { computeTodayBrief } from "../src/lib/todayBrief";
import { detectTaiSui } from "../src/lib/taisui";

describe("computeTodayBrief", () => {
  const bazi = computeBazi({ year: 1990, month: 6, day: 15, hour: 8, minute: 30 }, "male");

  it("produces a verdict consistent with the day score", () => {
    const today = new Date(2026, 7, 20);
    const brief = computeTodayBrief(bazi, "zh", today);
    if (brief.dayScore.score >= 2) expect(brief.verdict).toBe("favorable");
    else if (brief.dayScore.score <= -2) expect(brief.verdict).toBe("unfavorable");
    else expect(brief.verdict).toBe("neutral");
  });

  it("includes a non-empty qimen label", () => {
    const brief = computeTodayBrief(bazi, "zh", new Date(2026, 7, 20));
    expect(brief.qimenLabel.length).toBeGreaterThan(0);
  });

  it("surfaces a Tai Sui hit when the given year is a conflict year for this chart", () => {
    const birthYearZhi = bazi.pillars[0].zhi;
    // find a year within the next 12 that's a genuine Tai Sui hit for this chart
    const hits = detectTaiSui(birthYearZhi, 2026, 12);
    expect(hits.length).toBeGreaterThan(0);
    const hitYear = hits[0].year;
    const brief = computeTodayBrief(bazi, "zh", new Date(hitYear, 5, 15));
    expect(brief.taiSuiHit).not.toBeNull();
    expect(brief.verdictText).toContain(brief.taiSuiHit!.kind);
  });

  it("returns no Tai Sui hit for an ordinary non-conflict year", () => {
    const birthYearZhi = bazi.pillars[0].zhi;
    const hits = new Set(detectTaiSui(birthYearZhi, 2000, 60).map((h) => h.year));
    const quietYear = [2001, 2002, 2003, 2004].find((y) => !hits.has(y));
    if (quietYear) {
      const brief = computeTodayBrief(bazi, "zh", new Date(quietYear, 5, 15));
      expect(brief.taiSuiHit).toBeNull();
    }
  });

  it("English mode produces English verdict text", () => {
    const brief = computeTodayBrief(bazi, "en", new Date(2026, 7, 20));
    expect(/[a-zA-Z]/.test(brief.verdictText)).toBe(true);
  });
});
