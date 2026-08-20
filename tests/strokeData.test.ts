import { describe, expect, it } from "vitest";
import { lookupSurnameStrokes, lookupGivenCharStrokes, charsByElement, GIVEN_CHARS } from "../src/lib/strokeData";
import { suggestNames } from "../src/lib/namingSuggest";

describe("lookupSurnameStrokes", () => {
  it("常见单姓返回单一笔画", () => {
    expect(lookupSurnameStrokes("王")).toEqual([4]);
  });

  it("常见复姓返回对应笔画", () => {
    expect(lookupSurnameStrokes("欧阳")).toEqual([20]);
  });

  it("未收录姓氏返回 null", () => {
    expect(lookupSurnameStrokes("龘")).toBeNull();
  });
});

describe("lookupGivenCharStrokes", () => {
  it("已收录用字返回笔画数组", () => {
    const strokes = lookupGivenCharStrokes("林森");
    expect(strokes).toEqual([8, 12]);
  });

  it("含未收录字时返回 null", () => {
    expect(lookupGivenCharStrokes("林龘")).toBeNull();
  });
});

describe("charsByElement", () => {
  it("五行均有候选字", () => {
    for (const e of ["木", "火", "土", "金", "水"] as const) {
      expect(charsByElement(e).length).toBeGreaterThan(0);
    }
  });

  it("GIVEN_CHARS 无重复字", () => {
    const chars = GIVEN_CHARS.map((e) => e.char);
    expect(new Set(chars).size).toBe(chars.length);
  });
});

describe("suggestNames", () => {
  it("按喜用五行生成候选名，按 goodRatio 降序排列", () => {
    const results = suggestNames([7], ["水", "木"], 5);
    expect(results.length).toBeGreaterThan(0);
    expect(results.length).toBeLessThanOrEqual(5);
    for (let i = 1; i < results.length; i++) {
      expect(results[i - 1].report.goodRatio).toBeGreaterThanOrEqual(results[i].report.goodRatio);
    }
    for (const r of results) {
      expect(["水", "木"]).toContain(r.elements[0]);
    }
  });

  it("无喜用神时回退为全五行候选", () => {
    const results = suggestNames([7], [], 3);
    expect(results.length).toBe(3);
  });

  it("候选名不重复", () => {
    const results = suggestNames([7], ["金"], 20);
    const names = results.map((r) => r.chars);
    expect(new Set(names).size).toBe(names.length);
  });
});
