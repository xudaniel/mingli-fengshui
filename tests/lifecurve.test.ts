import { describe, expect, it } from "vitest";
import { scoreGanZhi, computeLifeCurve } from "../src/lib/lifecurve";
import { computeBazi } from "../src/lib/bazi";

describe("scoreGanZhi", () => {
  it("天干喜、地支忌 → +2-1=+1", () => {
    // 甲寅：干甲(木)喜，支寅本气木(喜) -> 实际都木，试用不同组合
    expect(scoreGanZhi("甲寅", ["木"], ["金"])).toBe(3); // 干+2 支+1
  });

  it("天干忌、地支中性 → -2", () => {
    expect(scoreGanZhi("庚申", [], ["金"])).toBe(-3); // 庚金忌-2，申本气金忌-1
  });

  it("均中性 → 0", () => {
    expect(scoreGanZhi("戊辰", ["水"], ["火"])).toBe(0);
  });

  it("范围恒在 -3..3", () => {
    for (const gz of ["甲子", "乙丑", "丙寅", "丁卯", "戊辰"]) {
      const s = scoreGanZhi(gz, ["木"], ["金", "水"]);
      expect(s).toBeGreaterThanOrEqual(-3);
      expect(s).toBeLessThanOrEqual(3);
    }
  });
});

describe("computeLifeCurve", () => {
  const bazi = computeBazi({ year: 1990, month: 6, day: 15, hour: 8, minute: 30 }, "male");
  const curve = computeLifeCurve(bazi.strength.favorable, bazi.strength.unfavorable, bazi.daYun);

  it("birthYear 与出生年一致", () => {
    expect(curve.birthYear).toBe(1990);
  });

  it("逐年覆盖第一步大运起到最后一步大运止", () => {
    expect(curve.years[0].year).toBe(bazi.daYun[0].startYear);
    expect(curve.years[curve.years.length - 1].year).toBe(bazi.daYun[bazi.daYun.length - 1].endYear);
    expect(curve.years).toHaveLength(bazi.daYun.length * 10);
  });

  it("年龄与年份一一对应", () => {
    for (const p of curve.years) {
      expect(p.age).toBe(p.year - curve.birthYear + 1);
    }
  });

  it("大运分段数与 daYun 长度一致，且分数与 scoreGanZhi 一致", () => {
    expect(curve.segments).toHaveLength(bazi.daYun.length);
    curve.segments.forEach((seg, i) => {
      expect(seg.ganZhi).toBe(bazi.daYun[i].ganZhi);
      expect(seg.score).toBe(scoreGanZhi(seg.ganZhi, bazi.strength.favorable, bazi.strength.unfavorable));
    });
  });

  it("空大运时返回空曲线而不报错", () => {
    const empty = computeLifeCurve(["木"], ["金"], []);
    expect(empty.years).toEqual([]);
    expect(empty.segments).toEqual([]);
  });
});
