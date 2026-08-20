import { describe, expect, it } from "vitest";
import { computeWuGe, getShuLi, buildWuGeReport } from "../src/lib/wuge";

describe("computeWuGe", () => {
  it("单姓单名（2字）：外格固定为 2", () => {
    // 姓 5 画，名 3 画
    const g = computeWuGe([5], [3]);
    expect(g.tianGe).toBe(6); // 5+1
    expect(g.renGe).toBe(8); // 5+3
    expect(g.diGe).toBe(4); // 3+1
    expect(g.waiGe).toBe(2);
    expect(g.zongGe).toBe(8); // 5+3
  });

  it("单姓双名（3字）", () => {
    // 姓 7 画，名两字 8、9 画
    const g = computeWuGe([7], [8, 9]);
    expect(g.tianGe).toBe(8); // 7+1
    expect(g.renGe).toBe(15); // 7+8
    expect(g.diGe).toBe(17); // 8+9
    expect(g.zongGe).toBe(24); // 7+8+9
    expect(g.waiGe).toBe(10); // 24-15+1
  });

  it("双姓双名（4字）", () => {
    // 姓两字 6、7 画，名两字 8、9 画
    const g = computeWuGe([6, 7], [8, 9]);
    expect(g.tianGe).toBe(13); // 6+7
    expect(g.renGe).toBe(15); // 7+8
    expect(g.diGe).toBe(17); // 8+9
    expect(g.zongGe).toBe(30); // 6+7+8+9
    expect(g.waiGe).toBe(16); // 30-15+1
  });

  it("姓或名为空时抛出错误", () => {
    expect(() => computeWuGe([], [3])).toThrow();
    expect(() => computeWuGe([5], [])).toThrow();
  });
});

describe("getShuLi", () => {
  it("1-81 均有明确评级", () => {
    for (let n = 1; n <= 81; n++) {
      const s = getShuLi(n);
      expect(["大吉", "吉", "半吉", "凶", "大凶"]).toContain(s.luck);
      expect(s.meaning.length).toBeGreaterThan(0);
    }
  });

  it("超过 81 时循环回落到 1-81 区间", () => {
    expect(getShuLi(82).number).toBe(2);
    expect(getShuLi(162).number).toBe(82 - 80); // 162-80-80=2
  });

  it("数理 1 与 81 评级一致（还本归元）", () => {
    expect(getShuLi(1).luck).toBe(getShuLi(81).luck);
  });
});

describe("buildWuGeReport", () => {
  it("goodRatio 落在 0-1 之间且五格评级齐全", () => {
    const r = buildWuGeReport([7], [8, 9]);
    expect(r.goodRatio).toBeGreaterThanOrEqual(0);
    expect(r.goodRatio).toBeLessThanOrEqual(1);
    for (const s of [r.tianGeShuLi, r.renGeShuLi, r.diGeShuLi, r.waiGeShuLi, r.zongGeShuLi]) {
      expect(["大吉", "吉", "半吉", "凶", "大凶"]).toContain(s.luck);
    }
  });
});
