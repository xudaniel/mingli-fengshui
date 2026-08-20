import { describe, expect, it } from "vitest";
import { computeQiMen } from "../src/lib/qimen";

describe("computeQiMen 阴阳遁判定", () => {
  it("冬至后、夏至前为阳遁", () => {
    const chart = computeQiMen({ date: new Date(2026, 2, 15) }); // 3 月中
    expect(chart.isYangDun).toBe(true);
  });

  it("夏至后、冬至前为阴遁", () => {
    const chart = computeQiMen({ date: new Date(2026, 7, 15) }); // 8 月中
    expect(chart.isYangDun).toBe(false);
  });

  it("年初（1 月）应正确回溯到上一年的冬至，而非误判为局起点在未来", () => {
    const chart = computeQiMen({ date: new Date(2026, 0, 15) }); // 1 月中，早于本年冬至
    expect(chart.isYangDun).toBe(true);
    expect(chart.ju).toBeGreaterThanOrEqual(1);
    expect(chart.ju).toBeLessThanOrEqual(9);
  });

  it("年末（12 月冬至后）应判定为阳遁新周期起点附近", () => {
    const chart = computeQiMen({ date: new Date(2026, 11, 25) }); // 12 月下旬，冬至后
    expect(chart.isYangDun).toBe(true);
  });
});

describe("computeQiMen 结构正确性", () => {
  it("局数恒在 1-9 之间，label 与 isYangDun/ju 一致", () => {
    const chart = computeQiMen({ date: new Date(2026, 4, 1) });
    expect(chart.ju).toBeGreaterThanOrEqual(1);
    expect(chart.ju).toBeLessThanOrEqual(9);
    expect(chart.label).toContain(chart.isYangDun ? "阳遁" : "阴遁");
  });

  it("九宫（含中宫）均有六仪三奇与九星，八门仅中宫为空", () => {
    const chart = computeQiMen({ date: new Date(2026, 4, 1) });
    expect(chart.palaces).toHaveLength(9);
    for (const p of chart.palaces) {
      expect(p.yiQi.length).toBe(1);
      expect(p.xing.length).toBe(2);
      if (p.palace === "中") expect(p.men).toBeNull();
      else expect(p.men).not.toBeNull();
    }
  });

  it("六仪三奇九宫内容互不重复（九个不同符号各占一宫）", () => {
    const chart = computeQiMen({ date: new Date(2026, 4, 1) });
    const yiQiSet = new Set(chart.palaces.map((p) => p.yiQi));
    expect(yiQiSet.size).toBe(9);
  });

  it("九星本位恒定，不随局数/阴阳遁变化", () => {
    const c1 = computeQiMen({ date: new Date(2026, 2, 1) });
    const c2 = computeQiMen({ date: new Date(2026, 8, 1) });
    const xingOf = (chart: typeof c1, palace: string) => chart.palaces.find((p) => p.palace === palace)!.xing;
    expect(xingOf(c1, "坎")).toBe("天蓬");
    expect(xingOf(c2, "坎")).toBe("天蓬");
    expect(xingOf(c1, "离")).toBe("天英");
  });
});
