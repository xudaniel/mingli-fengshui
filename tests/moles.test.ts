import { describe, expect, it } from "vitest";
import { MOLES, MOLE_CATEGORIES, searchMoles, molesByCategory } from "../src/lib/moles";

describe("MOLES dataset", () => {
  it("has at least 40 entries with non-empty fields", () => {
    expect(MOLES.length).toBeGreaterThanOrEqual(40);
    for (const m of MOLES) {
      expect(m.keywords.length).toBeGreaterThan(0);
      expect(m.meaning.length).toBeGreaterThan(5);
      expect(MOLE_CATEGORIES).toContain(m.category);
    }
  });

  it("primary keywords are unique across entries", () => {
    const primary = MOLES.map((m) => m.keywords[0]);
    expect(new Set(primary).size).toBe(primary.length);
  });

  it("every category has entries", () => {
    for (const c of MOLE_CATEGORIES) {
      expect(molesByCategory(c).length).toBeGreaterThan(0);
    }
  });
});

describe("searchMoles", () => {
  it("exact keyword match ranks first", () => {
    const results = searchMoles("耳垂");
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].keywords).toContain("耳垂");
  });

  it("substring queries match", () => {
    expect(searchMoles("眉").length).toBeGreaterThan(0);
    expect(searchMoles("脚").length).toBeGreaterThan(0);
  });

  it("empty or no-match queries return empty", () => {
    expect(searchMoles("")).toEqual([]);
    expect(searchMoles("不存在的部位xyz")).toEqual([]);
  });
});
