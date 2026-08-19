import { describe, expect, it } from "vitest";
import { getTiaoHou } from "../src/lib/tiaohou";

const GANS = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"];
const MONTH_ZHIS = ["寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥", "子", "丑"];

describe("getTiaoHou 调候用神", () => {
  it("经典条目抽查", () => {
    // 甲木寅月：丙癸
    const jia = getTiaoHou("甲", "寅");
    expect(jia.stems).toEqual(["丙", "癸"]);
    expect(jia.primaryElement).toBe("火");
    expect(jia.elements).toEqual(["火", "水"]);

    // 辛金子月（冬金喜暖）：首取丙火
    const xin = getTiaoHou("辛", "子");
    expect(xin.primaryStem).toBe("丙");
    expect(xin.primaryElement).toBe("火");

    // 癸水巳月：专用辛金
    const gui = getTiaoHou("癸", "巳");
    expect(gui.stems).toEqual(["辛"]);
    expect(gui.elements).toEqual(["金"]);

    // 丙火夏月（午）：首取壬水
    expect(getTiaoHou("丙", "午").primaryStem).toBe("壬");
  });

  it("十干 × 十二月支全表覆盖，主用不缺", () => {
    for (const g of GANS) {
      for (const z of MONTH_ZHIS) {
        const t = getTiaoHou(g, z);
        expect(t.stems.length, `${g}日${z}月`).toBeGreaterThan(0);
        expect(t.primaryStem).toBe(t.stems[0]);
        expect(t.elements.length).toBeGreaterThan(0);
      }
    }
  });

  it("五行去重且保持优先顺序", () => {
    // 庚金寅月：戊甲壬丙丁 → 土木水火（丙丁同火，只出现一次）
    const t = getTiaoHou("庚", "寅");
    expect(t.elements).toEqual(["土", "木", "水", "火"]);
  });

  it("未知输入返回空表而不抛错", () => {
    expect(getTiaoHou("X", "寅").stems).toEqual([]);
  });
});
