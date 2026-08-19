import { describe, expect, it } from "vitest";
import {
  analyzeStrength,
  ganElement,
  zhiElement,
  shengOf,
  shengBy,
  keOf,
  keBy,
} from "../src/lib/analysis";

describe("五行基础映射", () => {
  it("天干五行", () => {
    expect(ganElement("甲")).toBe("木");
    expect(ganElement("乙")).toBe("木");
    expect(ganElement("丙")).toBe("火");
    expect(ganElement("戊")).toBe("土");
    expect(ganElement("辛")).toBe("金");
    expect(ganElement("癸")).toBe("水");
  });

  it("地支本气五行", () => {
    expect(zhiElement("寅")).toBe("木");
    expect(zhiElement("午")).toBe("火");
    expect(zhiElement("辰")).toBe("土");
    expect(zhiElement("戌")).toBe("土");
    expect(zhiElement("酉")).toBe("金");
    expect(zhiElement("亥")).toBe("水");
  });

  it("生克循环", () => {
    expect(shengOf("木")).toBe("火");
    expect(shengBy("木")).toBe("水");
    expect(keOf("木")).toBe("土");
    expect(keBy("木")).toBe("金");
    expect(shengOf("水")).toBe("木");
    expect(keOf("金")).toBe("木");
  });
});

describe("analyzeStrength", () => {
  it("全盘同气 → 身强，喜克泄耗", () => {
    const pillar = { gan: "甲", zhi: "寅", hideGan: ["甲", "丙", "戊"] };
    const r = analyzeStrength(
      [
        { ...pillar, isMonth: false },
        { ...pillar, isMonth: true },
        { ...pillar, isMonth: false },
        { ...pillar, isMonth: false },
      ],
      "木",
    );
    expect(r.verdict).toBe("身强");
    expect(r.supportPct).toBeCloseTo(80, 0);
    expect(r.favorable).toEqual(["火", "土", "金"]);
    expect(r.unfavorable).toEqual(["水", "木"]);
  });

  it("日主孤立 → 身弱，喜印比", () => {
    const r = analyzeStrength(
      [
        { gan: "庚", zhi: "申", hideGan: ["庚", "壬", "戊"], isMonth: false },
        { gan: "戊", zhi: "戌", hideGan: ["戊", "辛", "丁"], isMonth: true },
        { gan: "甲", zhi: "申", hideGan: ["庚", "壬", "戊"], isMonth: false },
        { gan: "辛", zhi: "酉", hideGan: ["辛"], isMonth: false },
      ],
      "木",
    );
    expect(r.verdict).toBe("身弱");
    expect(r.favorable).toEqual(["水", "木"]);
    expect(r.unfavorable).toEqual(["金", "火"]);
  });

  it("同党恰半 → 中和，补最弱（含 <15% 的次弱）", () => {
    // 手算：木200 水250 火215 土105 金130，总 900，同党(木水)=450 → 50%
    const r = analyzeStrength(
      [
        { gan: "甲", zhi: "卯", hideGan: ["乙"], isMonth: false },
        { gan: "壬", zhi: "午", hideGan: ["丁", "己"], isMonth: true },
        { gan: "丙", zhi: "子", hideGan: ["癸"], isMonth: false },
        { gan: "庚", zhi: "戌", hideGan: ["戊", "辛", "丁"], isMonth: false },
      ],
      "木",
    );
    expect(r.verdict).toBe("中和");
    expect(r.supportPct).toBeCloseTo(50, 0);
    expect(r.favorable).toEqual(["土", "金"]);
    expect(r.unfavorable).toEqual(["水"]);
  });

  it("加权占比合计 100%", () => {
    const pillar = { gan: "丙", zhi: "午", hideGan: ["丁", "己"] };
    const r = analyzeStrength(
      [
        { ...pillar, isMonth: false },
        { gan: "壬", zhi: "子", hideGan: ["癸"], isMonth: true },
        { gan: "甲", zhi: "寅", hideGan: ["甲", "丙", "戊"], isMonth: false },
        { gan: "庚", zhi: "申", hideGan: ["庚", "壬", "戊"], isMonth: false },
      ],
      "火",
    );
    const total = Object.values(r.weighted).reduce((a, b) => a + b, 0);
    expect(total).toBeCloseTo(100, 6);
  });

  it("月令加成：同一柱放在月柱位时影响更大", () => {
    const strong = { gan: "甲", zhi: "卯", hideGan: ["乙"] };
    const other = { gan: "庚", zhi: "申", hideGan: ["庚", "壬", "戊"] };
    const asMonth = analyzeStrength(
      [
        { ...other, isMonth: false },
        { ...strong, isMonth: true },
        { ...other, isMonth: false },
        { ...other, isMonth: false },
      ],
      "木",
    );
    const notMonth = analyzeStrength(
      [
        { ...strong, isMonth: false },
        { ...other, isMonth: true },
        { ...other, isMonth: false },
        { ...other, isMonth: false },
      ],
      "木",
    );
    expect(asMonth.weighted["木"]).toBeGreaterThan(notMonth.weighted["木"]);
  });
});
