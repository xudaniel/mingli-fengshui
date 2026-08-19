import { describe, expect, it } from "vitest";
import { inChinaDst, isPre1949China, isChinaLongitude } from "../src/lib/historicalTime";

const at = (year: number, month: number, day: number, hour = 12, minute = 0) => ({
  year,
  month,
  day,
  hour,
  minute,
});

describe("inChinaDst 夏令时区间", () => {
  it("六个年份的区间内为真", () => {
    expect(inChinaDst(at(1986, 7, 1))).toBe(true);
    expect(inChinaDst(at(1987, 6, 15))).toBe(true);
    expect(inChinaDst(at(1988, 5, 1))).toBe(true);
    expect(inChinaDst(at(1989, 8, 8))).toBe(true);
    expect(inChinaDst(at(1990, 9, 1))).toBe(true);
    expect(inChinaDst(at(1991, 4, 20))).toBe(true);
  });

  it("边界：起日 02:00 起算、止日 02:00 截止", () => {
    expect(inChinaDst(at(1986, 5, 4, 1, 59))).toBe(false);
    expect(inChinaDst(at(1986, 5, 4, 2, 0))).toBe(true);
    expect(inChinaDst(at(1986, 9, 14, 1, 59))).toBe(true);
    expect(inChinaDst(at(1986, 9, 14, 2, 0))).toBe(false);
    expect(inChinaDst(at(1991, 9, 15, 1, 0))).toBe(true);
    expect(inChinaDst(at(1991, 9, 15, 3, 0))).toBe(false);
  });

  it("区间外与非夏令时年份为假", () => {
    expect(inChinaDst(at(1986, 4, 30))).toBe(false);
    expect(inChinaDst(at(1985, 7, 1))).toBe(false);
    expect(inChinaDst(at(1992, 7, 1))).toBe(false);
    expect(inChinaDst(at(1990, 1, 15))).toBe(false);
  });
});

describe("1949 年前提示", () => {
  it("年份与经度联合判断", () => {
    expect(isPre1949China(at(1945, 3, 1), 116.4)).toBe(true);
    expect(isPre1949China(at(1949, 3, 1), 116.4)).toBe(false);
    expect(isPre1949China(at(1945, 3, 1), -74.0)).toBe(false);
  });

  it("中国经度范围", () => {
    expect(isChinaLongitude(87.6)).toBe(true);
    expect(isChinaLongitude(121.5)).toBe(true);
    expect(isChinaLongitude(139.7)).toBe(false); // 东京
    expect(isChinaLongitude(-118.2)).toBe(false);
  });
});
