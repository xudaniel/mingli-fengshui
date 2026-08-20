import { describe, expect, it } from "vitest";
import { getDailyAlmanac, getAlmanacRange } from "../src/lib/almanac";

describe("getDailyAlmanac", () => {
  it("产出完整结构且无 undefined 字段", () => {
    const a = getDailyAlmanac(new Date(2026, 7, 20)); // 2026-08-20
    expect(a.solarDate).toBe("2026-08-20");
    expect(a.dayGanZhi).toMatch(/^[甲乙丙丁戊己庚辛壬癸][子丑寅卯辰巳午未申酉戌亥]$/);
    expect(a.zhiXing).toMatch(/^[建除满平定执破危成收开闭]$/);
    expect(a.xiu.name).toBeTruthy();
    expect(a.tianShen.type === "黄道" || a.tianShen.type === "黑道").toBe(true);
    expect(a.positions.xi).toBeTruthy();
    expect(Array.isArray(a.yi)).toBe(true);
    expect(Array.isArray(a.ji)).toBe(true);
  });

  it("同一天结果稳定可重复", () => {
    const a1 = getDailyAlmanac(new Date(2026, 0, 1));
    const a2 = getDailyAlmanac(new Date(2026, 0, 1));
    expect(a1).toEqual(a2);
  });

  it("相邻两天日干支不同", () => {
    const a1 = getDailyAlmanac(new Date(2026, 0, 1));
    const a2 = getDailyAlmanac(new Date(2026, 0, 2));
    expect(a1.dayGanZhi).not.toBe(a2.dayGanZhi);
  });
});

describe("getAlmanacRange", () => {
  it("返回指定天数且日期连续递增", () => {
    const list = getAlmanacRange(new Date(2026, 1, 27), 5); // 跨月边界
    expect(list).toHaveLength(5);
    expect(list.map((a) => a.solarDate)).toEqual([
      "2026-02-27",
      "2026-02-28",
      "2026-03-01",
      "2026-03-02",
      "2026-03-03",
    ]);
  });
});
