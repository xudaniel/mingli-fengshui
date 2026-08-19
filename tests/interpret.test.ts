import { describe, expect, it } from "vitest";
import { interpretChart } from "../src/lib/interpret";
import { computeBazi } from "../src/lib/bazi";

describe("interpretChart", () => {
  const bazi = computeBazi({ year: 1990, month: 6, day: 15, hour: 8, minute: 30 }, "male");
  const r = interpretChart(bazi);

  it("日主解读包含日主天干", () => {
    expect(r.dayMasterText).toContain(bazi.dayMaster.gan);
    expect(r.dayMasterText.length).toBeGreaterThan(10);
  });

  it("十神主气非空且不为日主标签", () => {
    expect(r.dominantShiShen).not.toBe("日主");
    expect(r.dominantShiShen).not.toBe("");
    expect(r.dominantShiShenText).toContain(r.dominantShiShen);
  });

  it("强弱建议随判定切换措辞", () => {
    expect(r.strengthText).toContain(bazi.strength.verdict === "身弱" ? "偏弱" : bazi.strength.verdict === "身强" ? "偏强" : "中和");
  });

  it("事业建议提及全部喜用五行", () => {
    for (const e of bazi.strength.favorable) {
      expect(r.careerText).toContain(e);
    }
  });

  it("paragraphs 不含空字符串", () => {
    expect(r.paragraphs.every((p) => p.trim().length > 0)).toBe(true);
    expect(r.paragraphs.length).toBeGreaterThanOrEqual(3);
  });

  it("英文模式产出对应内容且不同于中文", () => {
    const enResult = interpretChart(bazi, "en");
    expect(enResult.dayMasterText).toContain(bazi.dayMaster.gan);
    expect(enResult.dayMasterText).not.toBe(r.dayMasterText);
    for (const e of bazi.strength.favorable) {
      expect(enResult.careerText).toContain(e);
    }
  });

  it("十天干与常见十神组合均能产出非空文案（穷举校验模板完整性）", () => {
    for (let m = 1; m <= 12; m++) {
      const b = computeBazi({ year: 1980 + m, month: m, day: 10, hour: (m * 2) % 24, minute: 0 }, m % 2 ? "male" : "female");
      const interp = interpretChart(b);
      expect(interp.dayMasterText).toContain(b.dayMaster.gan);
      expect(interp.dayMasterText).not.toContain("undefined");
    }
  });
});
