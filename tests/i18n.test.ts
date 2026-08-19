import { describe, expect, it } from "vitest";
// dict.ts doesn't export the raw maps, so we exercise via t() and a small
// reflection trick: import the module namespace and check known keys exist
// in both languages by calling t() and confirming zh/en differ where expected.
import { t, dictKeys } from "../src/lib/i18n/dict";

const SAMPLE_KEYS = [
  "app.title", "app.subtitle", "form.submit", "result.title", "strength.title",
  "gua.title", "compat.title", "calendar.title", "hour.title", "curve.title",
  "house.title", "taisui.title", "interpret.title", "about.title", "footer.disclaimer",
];

describe("t()", () => {
  it("已知键在中英文下均返回非空、非键名本身的文本", () => {
    for (const key of SAMPLE_KEYS) {
      const zh = t("zh", key);
      const en = t("en", key);
      expect(zh).not.toBe(key);
      expect(en).not.toBe(key);
      expect(zh.length).toBeGreaterThan(0);
      expect(en.length).toBeGreaterThan(0);
    }
  });

  it("未知键回退为键名本身，不抛错", () => {
    expect(t("zh", "nonexistent.key")).toBe("nonexistent.key");
    expect(t("en", "nonexistent.key")).toBe("nonexistent.key");
  });

  it("变量插值正确替换", () => {
    const zh = t("zh", "profiles.importSuccess", { added: 3, skipped: 1 });
    expect(zh).toContain("3");
    expect(zh).toContain("1");
    const en = t("en", "profiles.importSuccess", { added: 3, skipped: 1 });
    expect(en).toContain("3");
    expect(en).toContain("1");
  });

  it("中英文本确实不同（非误用同一文案）", () => {
    for (const key of SAMPLE_KEYS) {
      expect(t("zh", key)).not.toBe(t("en", key));
    }
  });
});

describe("词典键完整性", () => {
  it("中英文键集合完全一致", () => {
    expect(dictKeys("en")).toEqual(dictKeys("zh"));
  });

  it("键数量可观（覆盖主要 UI 区块）", () => {
    expect(dictKeys("zh").length).toBeGreaterThan(80);
  });
});
