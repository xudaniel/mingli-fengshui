import { describe, expect, it } from "vitest";
import { buildReport } from "../src/lib/report";
import { computeBazi } from "../src/lib/bazi";
import { computeGua } from "../src/lib/bagua";

describe("buildReport", () => {
  const bazi = computeBazi({ year: 1990, month: 6, day: 15, hour: 8, minute: 30 }, "male");
  const gua = computeGua(bazi.fengshuiYear, "male");
  const meta = { name: "测试", gender: "male" as const, cityLabel: "北京", civilLabel: "1990-06-15 08:30" };

  it("产出 6 个章节，标题齐全", () => {
    const chapters = buildReport(bazi, gua, meta);
    expect(chapters).toHaveLength(6);
    for (const c of chapters) {
      expect(c.title.length).toBeGreaterThan(0);
      expect(c.paragraphs.length).toBeGreaterThan(0);
      for (const p of c.paragraphs) expect(p.length).toBeGreaterThan(0);
    }
  });

  it("总论章节引用了姓名、日主与四柱", () => {
    const chapters = buildReport(bazi, gua, meta);
    const overview = chapters[0].paragraphs.join(" ");
    expect(overview).toContain("测试");
    expect(overview).toContain(bazi.dayMaster.gan);
    expect(overview).toContain(bazi.pillars[0].ganZhi);
  });

  it("四柱章节逐柱展开，段落数等于柱数", () => {
    const chapters = buildReport(bazi, gua, meta);
    const pillarsChapter = chapters.find((c) => c.title === "四柱详解")!;
    expect(pillarsChapter.paragraphs).toHaveLength(4);
  });

  it("英文模式产出不同于中文的内容", () => {
    const zh = buildReport(bazi, gua, meta, "zh");
    const en = buildReport(bazi, gua, meta, "en", );
    expect(zh[0].title).not.toBe(en[0].title);
    expect(zh[0].paragraphs[0]).not.toBe(en[0].paragraphs[0]);
  });

  it("无名字时使用默认称呼而非空字符串", () => {
    const chapters = buildReport(bazi, gua, { ...meta, name: "" });
    expect(chapters[0].paragraphs[0]).toContain("命主");
  });
});
