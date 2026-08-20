import { describe, expect, it } from "vitest";
import { HEXAGRAMS, TRIGRAMS, TRIGRAM_ORDER, findHexagram, trigramFromLines } from "../src/lib/ichingData";

describe("HEXAGRAMS 数据完整性", () => {
  it("恰好 64 条，upper/lower 组合各不相同", () => {
    expect(HEXAGRAMS).toHaveLength(64);
    const keys = new Set(HEXAGRAMS.map((h) => `${h.upper}/${h.lower}`));
    expect(keys.size).toBe(64);
  });

  it("8 个上下卦相同的纯卦，卦名为「X为Y」", () => {
    for (const t of TRIGRAM_ORDER) {
      const h = findHexagram(t, t);
      expect(h.name).toBe(`${t}为${TRIGRAMS[t].nature}`);
    }
  });

  it("每条记录字段完整", () => {
    for (const h of HEXAGRAMS) {
      expect(h.name.length).toBeGreaterThan(0);
      expect(h.summary.length).toBeGreaterThan(0);
      expect(["good", "neutral", "caution"]).toContain(h.luck);
    }
  });

  it("覆盖全部 8x8=64 种上下卦组合", () => {
    for (const upper of TRIGRAM_ORDER) {
      for (const lower of TRIGRAM_ORDER) {
        expect(() => findHexagram(upper, lower)).not.toThrow();
      }
    }
  });
});

describe("trigramFromLines", () => {
  it("三阳爻为乾，三阴爻为坤", () => {
    expect(trigramFromLines([true, true, true])).toBe("乾");
    expect(trigramFromLines([false, false, false])).toBe("坤");
  });

  it("与 TRIGRAMS 表定义一致", () => {
    for (const [name, t] of Object.entries(TRIGRAMS)) {
      expect(trigramFromLines(t.lines)).toBe(name);
    }
  });
});
