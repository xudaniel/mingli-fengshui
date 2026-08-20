import { describe, expect, it } from "vitest";
import { DREAMS, searchDreams, dreamsByCategory, DREAM_CATEGORIES } from "../src/lib/dreams";

describe("DREAMS 数据完整性", () => {
  it("词条数量达到基本规模", () => {
    expect(DREAMS.length).toBeGreaterThanOrEqual(100);
  });

  it("每条记录字段完整且分类合法", () => {
    for (const d of DREAMS) {
      expect(d.keywords.length).toBeGreaterThan(0);
      expect(d.meaning.length).toBeGreaterThan(0);
      expect(DREAM_CATEGORIES).toContain(d.category);
    }
  });

  it("每个分类下至少有词条", () => {
    for (const c of DREAM_CATEGORIES) {
      expect(dreamsByCategory(c).length).toBeGreaterThan(0);
    }
  });
});

describe("searchDreams", () => {
  it("精确匹配关键字排在最前", () => {
    const results = searchDreams("蛇");
    expect(results[0].keywords).toContain("蛇");
  });

  it("模糊匹配可命中多条相关结果", () => {
    const results = searchDreams("鬼");
    expect(results.length).toBeGreaterThan(0);
  });

  it("空查询返回空数组", () => {
    expect(searchDreams("")).toEqual([]);
    expect(searchDreams("   ")).toEqual([]);
  });

  it("查无结果时返回空数组而不报错", () => {
    expect(searchDreams("xyz从未出现过的词汇123")).toEqual([]);
  });
});
