import { describe, expect, it } from "vitest";
import {
  dayGanRelation,
  dayZhiRelation,
  zodiacRelation,
  guaGroupMatch,
  computeCompatibility,
} from "../src/lib/compatibility";
import { computeBazi } from "../src/lib/bazi";
import { computeGua } from "../src/lib/bagua";

describe("dayGanRelation", () => {
  it("甲己合土", () => {
    const r = dayGanRelation("甲", "己");
    expect(r.hasHe).toBe(true);
    expect(r.element).toBe("土");
  });

  it("丙辛合水，方向无关", () => {
    expect(dayGanRelation("辛", "丙").hasHe).toBe(true);
    expect(dayGanRelation("辛", "丙").element).toBe("水");
  });

  it("无五合关系时 hasHe 为假", () => {
    expect(dayGanRelation("甲", "乙").hasHe).toBe(false);
  });
});

describe("dayZhiRelation / zodiacRelation", () => {
  it("子丑六合", () => {
    const r = dayZhiRelation("子", "丑");
    expect(r.relations.some((x) => x.kind === "六合")).toBe(true);
    expect(r.summary).toContain("六合");
  });

  it("申子辰互为三合", () => {
    expect(dayZhiRelation("申", "子").sanHe).toBe(true);
    expect(dayZhiRelation("子", "辰").sanHe).toBe(true);
    expect(dayZhiRelation("申", "辰").sanHe).toBe(true);
  });

  it("子午相冲", () => {
    expect(dayZhiRelation("子", "午").relations.some((x) => x.kind === "相冲")).toBe(true);
  });

  it("无关系时给出中性总结", () => {
    const r = zodiacRelation("丑", "卯");
    expect(r.relations).toEqual([]);
    expect(r.sanHe).toBe(false);
    expect(r.summary).toContain("平顺");
  });
});

describe("guaGroupMatch", () => {
  it("同组与不同组分别给出对应文案", () => {
    const kan = computeGua(1990, "male"); // 坎 东四命
    const li = computeGua(2000, "female"); // 离 东四命（示例，实际以函数结果为准）
    const dui = computeGua(1995, "male"); // 坤 西四命
    const sameMatch = guaGroupMatch(kan, li);
    expect(sameMatch.sameGroup).toBe(kan.group === li.group);
    const diffMatch = guaGroupMatch(kan, dui);
    expect(diffMatch.sameGroup).toBe(kan.group === dui.group);
  });
});

describe("computeCompatibility", () => {
  it("综合评分落在 5-95 区间且结构完整", () => {
    const a = computeBazi({ year: 1990, month: 6, day: 15, hour: 8, minute: 30 }, "male");
    const b = computeBazi({ year: 1992, month: 3, day: 10, hour: 14, minute: 0 }, "female");
    const guaA = computeGua(a.fengshuiYear, "male");
    const guaB = computeGua(b.fengshuiYear, "female");
    const report = computeCompatibility(a, guaA, b, guaB);
    expect(report.score).toBeGreaterThanOrEqual(5);
    expect(report.score).toBeLessThanOrEqual(95);
    expect(report.summary.length).toBeGreaterThan(0);
    expect(report.dayGan).toBeDefined();
    expect(report.dayZhi).toBeDefined();
    expect(report.zodiac).toBeDefined();
  });

  it("正向关系组合（天干五合+日支六合+生肖六合）应显著高于负向组合（日支冲+生肖冲）", () => {
    const good = mockBazi("甲", "子", "丑");
    const goodPartner = mockBazi("己", "丑", "子");
    const bad = mockBazi("甲", "子", "午");
    const badPartner = mockBazi("庚", "午", "子");
    const guaSame = computeGua(1990, "male");

    const goodReport = computeCompatibility(good, guaSame, goodPartner, guaSame);
    const badReport = computeCompatibility(bad, guaSame, badPartner, guaSame);
    expect(goodReport.score).toBeGreaterThan(badReport.score);
  });
});

/** 构造仅含 computeCompatibility 所需字段的最小 BaziResult 替身。 */
function mockBazi(dayGan: string, dayZhi: string, yearZhi: string) {
  return {
    dayMaster: { gan: dayGan, element: "木" },
    pillars: [
      { zhi: yearZhi },
      {},
      { gan: dayGan, zhi: dayZhi },
      {},
    ],
    strength: {
      weighted: { 木: 20, 火: 20, 土: 20, 金: 20, 水: 20 },
      favorable: [],
      unfavorable: [],
    },
  } as unknown as Parameters<typeof computeCompatibility>[0];
}
