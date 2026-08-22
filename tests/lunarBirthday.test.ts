import { describe, expect, it } from "vitest";
import { Solar } from "lunar-javascript";
import { computeLunarBirthday } from "../src/lib/lunarBirthday";

describe("computeLunarBirthday", () => {
  it("converts a solar birth date to its lunar month/day", () => {
    // 1990-06-15 的农历为五月廿三（与 ziweiView 同一转换路径）
    const info = computeLunarBirthday("1990-06-15", new Date(2026, 7, 21))!;
    const lunar = Solar.fromYmdHms(1990, 6, 15, 12, 0, 0).getLunar();
    expect(info.lunarMonth).toBe(Math.abs(lunar.getMonth()));
    expect(info.lunarDay).toBe(lunar.getDay());
    expect(info.lunarLabel.length).toBeGreaterThan(0);
  });

  it("next occurrence is today-or-later and lands on the right lunar month/day", () => {
    const today = new Date(2026, 7, 21);
    const info = computeLunarBirthday("1990-06-15", today)!;
    expect(info.daysUntil).toBeGreaterThanOrEqual(0);
    const [ny, nm, nd] = info.nextSolarDate.split("-").map(Number);
    const nextLunar = Solar.fromYmdHms(ny, nm, nd, 12, 0, 0).getLunar();
    expect(Math.abs(nextLunar.getMonth())).toBe(info.lunarMonth);
    expect(nextLunar.getDay()).toBe(info.lunarDay);
  });

  it("daysUntil is 0 when today IS the lunar birthday", () => {
    const today = new Date(2026, 7, 21);
    const info = computeLunarBirthday("1990-06-15", today)!;
    const [ny, nm, nd] = info.nextSolarDate.split("-").map(Number);
    const onThatDay = computeLunarBirthday("1990-06-15", new Date(ny, nm - 1, nd))!;
    expect(onThatDay.daysUntil).toBe(0);
  });

  it("handles a birth date inside a leap month (2023 had leap month 2)", () => {
    // 2023-03-25 落在闰二月内
    const birthLunar = Solar.fromYmdHms(2023, 3, 25, 12, 0, 0).getLunar();
    expect(birthLunar.getMonth()).toBeLessThan(0); // 确认确实是闰月
    const info = computeLunarBirthday("2023-03-25", new Date(2026, 7, 21))!;
    expect(info.lunarMonth).toBe(Math.abs(birthLunar.getMonth()));
    expect(info.daysUntil).toBeGreaterThanOrEqual(0);
  });

  it("returns null for malformed input", () => {
    expect(computeLunarBirthday("not-a-date")).toBeNull();
  });
});
