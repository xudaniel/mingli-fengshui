import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { computeBazi } from "../src/lib/bazi";
import type { CivilMoment } from "../src/lib/solarTime";

beforeAll(() => {
  // computeBazi 的流年取当前日期，冻结以保证测试稳定
  vi.useFakeTimers();
  vi.setSystemTime(new Date(2026, 7, 19, 12, 0, 0));
});

afterAll(() => {
  vi.useRealTimers();
});

const civil = (year: number, month: number, day: number, hour: number, minute: number): CivilMoment => ({
  year,
  month,
  day,
  hour,
  minute,
});

const fourPillars = (c: CivilMoment) =>
  computeBazi(c, "male")
    .pillars.map((p) => p.ganZhi)
    .join(" ");

describe("computeBazi 四柱快照（回归保护）", () => {
  it("外部核验过的命盘", () => {
    // 与主流排盘工具核对一致
    expect(fourPillars(civil(1990, 6, 15, 8, 30))).toBe("庚午 壬午 辛亥 壬辰");
    expect(fourPillars(civil(1995, 3, 8, 20, 49))).toBe("乙亥 己卯 戊戌 壬戌");
  });

  it("立春边界：1990 年立春为 02-04 10:14", () => {
    expect(fourPillars(civil(1990, 2, 4, 9, 0))).toBe("己巳 丁丑 庚子 辛巳");
    expect(fourPillars(civil(1990, 2, 4, 11, 0))).toBe("庚午 戊寅 庚子 壬午");
  });

  it("晚子时（流派 2）：23 时后日柱不变、时柱用次日子时", () => {
    expect(fourPillars(civil(1988, 8, 8, 22, 30))).toBe("戊辰 庚申 乙未 丁亥");
    expect(fourPillars(civil(1988, 8, 8, 23, 30))).toBe("戊辰 庚申 乙未 戊子");
    expect(fourPillars(civil(1988, 8, 9, 0, 30))).toBe("戊辰 庚申 丙申 戊子");
  });

  it("其余年代快照", () => {
    expect(fourPillars(civil(2000, 1, 1, 12, 0))).toBe("己卯 丙子 戊午 戊午");
    expect(fourPillars(civil(1984, 2, 2, 6, 0))).toBe("癸亥 乙丑 丙寅 辛卯");
    expect(fourPillars(civil(2008, 8, 8, 20, 8))).toBe("戊子 庚申 庚辰 丙戌");
    expect(fourPillars(civil(1975, 12, 25, 4, 15))).toBe("乙卯 戊子 乙巳 戊寅");
    expect(fourPillars(civil(2024, 2, 4, 17, 0))).toBe("甲辰 丙寅 戊戌 辛酉");
    expect(fourPillars(civil(1969, 7, 20, 10, 56))).toBe("己酉 辛未 丙申 癸巳");
    expect(fourPillars(civil(1955, 10, 1, 15, 0))).toBe("乙未 乙酉 乙未 甲申");
  });
});

describe("computeBazi 派生数据", () => {
  const r = computeBazi(civil(1990, 6, 15, 8, 30), "male");

  it("日主与生肖星座", () => {
    expect(r.dayMaster).toEqual({ gan: "辛", element: "金" });
    expect(r.shengXiao).toBe("马");
    expect(r.xingZuo).toBe("双子座");
  });

  it("本气五行计数合计 8", () => {
    const total = Object.values(r.elementCounts).reduce((a, b) => a + b, 0);
    expect(total).toBe(8);
  });

  it("加权占比合计约 100%", () => {
    const total = Object.values(r.strength.weighted).reduce((a, b) => a + b, 0);
    expect(total).toBeCloseTo(100, 6);
  });

  it("藏干与十神：亥藏壬甲，对辛为伤官/正财", () => {
    const day = r.pillars[2];
    expect(day.hiddenStems.map((h) => h.gan)).toEqual(["壬", "甲"]);
    expect(day.hiddenStems.map((h) => h.shiShen)).toEqual(["伤官", "正财"]);
  });

  it("命卦年份按立春修正", () => {
    expect(r.fengshuiYear).toBe(1990);
    expect(computeBazi(civil(1990, 2, 4, 9, 0), "male").fengshuiYear).toBe(1989);
    expect(computeBazi(civil(1990, 2, 4, 11, 0), "male").fengshuiYear).toBe(1990);
  });

  it("流年取冻结的当前年份", () => {
    expect(r.liuNian).toEqual({ year: 2026, ganZhi: "丙午" });
  });

  it("调候：辛金午月首取壬水", () => {
    expect(r.tiaoHou.primaryStem).toBe("壬");
    expect(r.tiaoHou.primaryElement).toBe("水");
  });

  it("地支关系：午午自刑", () => {
    // 庚午 壬午 辛亥 壬辰 → 年月两午自刑
    expect(r.relations.some((rel) => rel.kind === "自刑")).toBe(true);
  });

  it("大运 8 步且年龄区间连续", () => {
    expect(r.daYun).toHaveLength(8);
    for (let i = 1; i < r.daYun.length; i++) {
      expect(r.daYun[i].startAge).toBe(r.daYun[i - 1].endAge + 1);
      expect(r.daYun[i].startYear).toBe(r.daYun[i - 1].endYear + 1);
    }
  });
});
