import { describe, expect, it } from "vitest";
import { computeFlyingStar, getPeriod, getPeriodLabel, oppositeMountain, MOUNTAINS_24 } from "../src/lib/flyingStar";

describe("getPeriod", () => {
  it("三元九运边界正确", () => {
    expect(getPeriod(1864)).toBe(1);
    expect(getPeriod(1883)).toBe(1);
    expect(getPeriod(1884)).toBe(2);
    expect(getPeriod(2004)).toBe(8);
    expect(getPeriod(2023)).toBe(8);
    expect(getPeriod(2024)).toBe(9);
    expect(getPeriod(2043)).toBe(9);
    expect(getPeriod(2044)).toBe(1); // 循环回一运
  });

  it("当前处于下元九运", () => {
    expect(getPeriodLabel(getPeriod(2026))).toBe("下元九运");
  });
});

describe("oppositeMountain", () => {
  it("子午相对、卯酉相对", () => {
    expect(oppositeMountain("子")).toBe("午");
    expect(oppositeMountain("午")).toBe("子");
    expect(oppositeMountain("卯")).toBe("酉");
  });

  it("24 山两两互为对宫，无自反", () => {
    for (const m of MOUNTAINS_24) {
      expect(oppositeMountain(oppositeMountain(m))).toBe(m);
      expect(oppositeMountain(m)).not.toBe(m);
    }
  });
});

describe("computeFlyingStar", () => {
  it("每张飞星盘（运/山/向）九宫数字恰为 1-9 各一次", () => {
    const chart = computeFlyingStar("子", 2015); // 八运
    const yunNums = chart.palaces.map((p) => p.yunStar).sort((a, b) => a - b);
    const shanNums = chart.palaces.map((p) => p.shanStar).sort((a, b) => a - b);
    const xiangNums = chart.palaces.map((p) => p.xiangStar).sort((a, b) => a - b);
    expect(yunNums).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    expect(shanNums).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    expect(xiangNums).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
  });

  it("八运子山午向为旺山旺向（业界公认的经典配置，交叉核验算法正确性）", () => {
    const chart = computeFlyingStar("子", 2015);
    expect(chart.period).toBe(8);
    expect(chart.facing).toBe("午");
    expect(chart.isWangShanWangXiang).toBe(true);
    expect(chart.isShangShanXiaShui).toBe(false);
  });

  it("中宫运星恰为当运数", () => {
    const chart = computeFlyingStar("壬", 2015);
    const center = chart.palaces.find((p) => p.palace === "中")!;
    expect(center.yunStar).toBe(8);
  });

  it("坐山与向必然位于相对的两宫", () => {
    const chart = computeFlyingStar("甲", 2026);
    expect(chart.sitting).toBe("甲");
    expect(chart.facing).toBe("庚");
  });

  it("九运换算下同一坐山的旺山旺向判定可能不同于八运", () => {
    const chart8 = computeFlyingStar("子", 2015);
    const chart9 = computeFlyingStar("子", 2026);
    expect(chart8.period).not.toBe(chart9.period);
  });
});
