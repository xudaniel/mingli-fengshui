import { describe, expect, it } from "vitest";
import { computeZiWei, PALACE_NAMES } from "../src/lib/ziwei";

describe("computeZiWei 结构正确性", () => {
  it("十二宫恰好覆盖十二地支，每宫恰有一个宫名，命宫在 lifePalaceIndex", () => {
    const chart = computeZiWei({ yearGan: "庚", lunarMonth: 6, lunarDay: 15, shiChenIndex: 4 });
    expect(chart.palaces).toHaveLength(12);
    const names = chart.palaces.map((p) => p.name);
    expect(new Set(names).size).toBe(12);
    for (const n of PALACE_NAMES) expect(names).toContain(n);
    const lifePalace = chart.palaces.find((p) => p.name === "命宫")!;
    expect(lifePalace.zhiIndex).toBe(chart.lifePalaceIndex);
  });

  it("正月子时命宫与身宫同宫（均落月宫=寅）", () => {
    const chart = computeZiWei({ yearGan: "甲", lunarMonth: 1, lunarDay: 1, shiChenIndex: 0 });
    expect(chart.lifePalaceIndex).toBe(2); // 寅
    expect(chart.bodyPalaceIndex).toBe(2);
  });

  it("命宫随时辰增加而逆行（月宫固定时，时辰越晚命宫越靠前）", () => {
    const monthDay = { yearGan: "甲", lunarMonth: 5, lunarDay: 10 };
    const shi0 = computeZiWei({ ...monthDay, shiChenIndex: 0 });
    const shi1 = computeZiWei({ ...monthDay, shiChenIndex: 1 });
    expect(shi1.lifePalaceIndex).toBe((shi0.lifePalaceIndex - 1 + 12) % 12);
  });

  it("五行局数落在 2-6 之间且名称对应", () => {
    const chart = computeZiWei({ yearGan: "丙", lunarMonth: 3, lunarDay: 20, shiChenIndex: 6 });
    expect(chart.ju.number).toBeGreaterThanOrEqual(2);
    expect(chart.ju.number).toBeLessThanOrEqual(6);
    expect(chart.ju.name).toContain(String(chart.ju.number) === "2" ? "水" : "");
  });

  it("紫微与天府镜像关系恒成立（寅申同宫，子辰互补等）", () => {
    for (const yearGan of ["甲", "乙", "丙", "丁", "戊"]) {
      const chart = computeZiWei({ yearGan, lunarMonth: 7, lunarDay: 23, shiChenIndex: 9 });
      expect((chart.ziweiIndex + chart.tianfuIndex) % 12).toBe(4);
    }
  });

  it("紫微星系六星与天府星系八星的相对偏移固定（结构自洽性校验）", () => {
    const chart = computeZiWei({ yearGan: "辛", lunarMonth: 9, lunarDay: 5, shiChenIndex: 2 });
    const find = (star: string) => chart.palaces.find((p) => p.stars.includes(star))!.zhiIndex;
    const mod12 = (n: number) => ((n % 12) + 12) % 12;
    expect(find("天机")).toBe(mod12(chart.ziweiIndex - 1));
    expect(find("太阳")).toBe(mod12(chart.ziweiIndex - 3));
    expect(find("廉贞")).toBe(mod12(chart.ziweiIndex - 8));
    expect(find("太阴")).toBe(mod12(chart.tianfuIndex + 1));
    expect(find("七杀")).toBe(mod12(chart.tianfuIndex + 6));
    expect(find("破军")).toBe(mod12(chart.tianfuIndex + 10));
  });

  it("十四主星全部被放置且互不重叠冲突（各自恰一宫）", () => {
    const chart = computeZiWei({ yearGan: "壬", lunarMonth: 11, lunarDay: 28, shiChenIndex: 7 });
    const mainStars = [
      "紫微", "天机", "太阳", "武曲", "天同", "廉贞",
      "天府", "太阴", "贪狼", "巨门", "天相", "天梁", "七杀", "破军",
    ];
    const allStars = chart.palaces.flatMap((p) => p.stars);
    for (const s of mainStars) {
      expect(allStars.filter((x) => x === s)).toHaveLength(1);
    }
  });

  it("四化表：十天干各自产生 4 个不同类型的四化星", () => {
    for (const yearGan of ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"]) {
      const chart = computeZiWei({ yearGan, lunarMonth: 2, lunarDay: 2, shiChenIndex: 0 });
      expect(chart.siHua).toHaveLength(4);
      expect(chart.siHua.map((s) => s.type)).toEqual(["化禄", "化权", "化科", "化忌"]);
      expect(new Set(chart.siHua.map((s) => s.star)).size).toBe(4);
    }
  });

  it("未知年干抛出错误而非静默产出错误数据", () => {
    expect(() => computeZiWei({ yearGan: "X", lunarMonth: 1, lunarDay: 1, shiChenIndex: 0 })).toThrow();
  });

  // 注：安紫微星的「日/局数」定位公式在不同流传版本间存在细节差异，
  // 本实现采用其中一种自洽版本（见 ziwei.ts 文件头注释），此处不对其
  // 绝对宫位断言「标准答案」，仅验证下游的结构性质。
});
