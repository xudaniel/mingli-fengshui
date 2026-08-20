import { describe, expect, it } from "vitest";
import { detectShenSha } from "../src/lib/shensha";

describe("detectShenSha", () => {
  it("甲日干命中丑/未任一地支即为天乙贵人", () => {
    const hits = detectShenSha("甲", "子", "甲", ["子", "丑", "甲", "寅"]);
    expect(hits.find((h) => h.name === "天乙贵人")).toMatchObject({ auspicious: true, pillars: [1] });
  });

  it("甲日干命中巳为文昌", () => {
    const hits = detectShenSha("甲", "子", "甲", ["子", "巳", "甲", "寅"]);
    expect(hits.find((h) => h.name === "文昌")).toMatchObject({ pillars: [1] });
  });

  it("甲日干命中寅为禄神，命中卯为羊刃", () => {
    const hits = detectShenSha("甲", "子", "甲", ["寅", "卯", "甲", "子"]);
    expect(hits.find((h) => h.name === "禄神")).toMatchObject({ pillars: [0] });
    expect(hits.find((h) => h.name === "羊刃")).toMatchObject({ auspicious: false, pillars: [1] });
  });

  it("阴干（乙）无羊刃条目", () => {
    const hits = detectShenSha("乙", "子", "子", ["卯", "子", "子", "寅"]);
    expect(hits.find((h) => h.name === "羊刃")).toBeUndefined();
  });

  it("申子辰组：驿马寅、将星子、华盖辰", () => {
    const hits = detectShenSha("庚", "申", "申", ["申", "寅", "子", "辰"]);
    expect(hits.find((h) => h.name === "驿马")).toMatchObject({ pillars: [1] });
    expect(hits.find((h) => h.name === "将星")).toMatchObject({ pillars: [2] });
    expect(hits.find((h) => h.name === "华盖")).toMatchObject({ pillars: [3] });
  });

  it("年支与日支落在同一三合组时不重复列出同一颗星", () => {
    // 年支申、日支子，同属申子辰组，驿马同为寅，只应出现一次
    const hits = detectShenSha("庚", "申", "子", ["申", "寅", "子", "午"]);
    expect(hits.filter((h) => h.name === "驿马")).toHaveLength(1);
  });

  it("无命中时返回空数组而不报错", () => {
    const hits = detectShenSha("癸", "丑", "丑", ["辰", "辰", "辰", "辰"]);
    expect(Array.isArray(hits)).toBe(true);
  });
});
