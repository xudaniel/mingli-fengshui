import { describe, expect, it } from "vitest";
import { toTrueSolarTime, shiftCivilMinutes } from "../src/lib/solarTime";

describe("toTrueSolarTime 经度校正", () => {
  it("北京（116.41°E, UTC+8）约 -14.4 分钟", () => {
    const r = toTrueSolarTime(
      { year: 1990, month: 6, day: 15, hour: 8, minute: 30 },
      { longitude: 116.4074, utcOffsetHours: 8, applyEquationOfTime: false },
    );
    expect(r.longitudeCorrectionMinutes).toBeCloseTo(-14.37, 1);
    expect(r.equationOfTimeMinutes).toBe(0);
  });

  it("乌鲁木齐（87.62°E, UTC+8）约 -129.5 分钟，足以改变时辰", () => {
    const r = toTrueSolarTime(
      { year: 2000, month: 6, day: 1, hour: 10, minute: 0 },
      { longitude: 87.6168, utcOffsetHours: 8, applyEquationOfTime: false },
    );
    expect(r.longitudeCorrectionMinutes).toBeCloseTo(-129.53, 1);
    expect(r.corrected.hour).toBe(7);
  });

  it("中央经线以东为正（上海 121.47°E → 约 +5.9 分钟）", () => {
    const r = toTrueSolarTime(
      { year: 2000, month: 6, day: 1, hour: 10, minute: 0 },
      { longitude: 121.4737, utcOffsetHours: 8, applyEquationOfTime: false },
    );
    expect(r.longitudeCorrectionMinutes).toBeCloseTo(5.89, 1);
  });

  it("负校正跨日回退", () => {
    const r = toTrueSolarTime(
      { year: 2000, month: 1, day: 1, hour: 0, minute: 5 },
      { longitude: 112.5, utcOffsetHours: 8, applyEquationOfTime: false },
    );
    expect(r.longitudeCorrectionMinutes).toBeCloseTo(-30, 5);
    expect(r.corrected).toEqual({ year: 1999, month: 12, day: 31, hour: 23, minute: 35 });
  });

  it("均时差量级：11 月初约 +16 分钟、2 月中约 -14 分钟", () => {
    const nov = toTrueSolarTime(
      { year: 2001, month: 11, day: 3, hour: 12, minute: 0 },
      { longitude: 120, utcOffsetHours: 8, applyEquationOfTime: true },
    );
    expect(nov.equationOfTimeMinutes).toBeGreaterThan(15);
    expect(nov.equationOfTimeMinutes).toBeLessThan(17.5);

    const feb = toTrueSolarTime(
      { year: 2001, month: 2, day: 12, hour: 12, minute: 0 },
      { longitude: 120, utcOffsetHours: 8, applyEquationOfTime: true },
    );
    expect(feb.equationOfTimeMinutes).toBeLessThan(-13);
    expect(feb.equationOfTimeMinutes).toBeGreaterThan(-15.5);
  });
});

describe("shiftCivilMinutes", () => {
  it("回拨 60 分钟跨日", () => {
    expect(shiftCivilMinutes({ year: 1988, month: 8, day: 9, hour: 0, minute: 30 }, -60)).toEqual({
      year: 1988,
      month: 8,
      day: 8,
      hour: 23,
      minute: 30,
    });
  });

  it("前进跨月", () => {
    expect(shiftCivilMinutes({ year: 2000, month: 2, day: 29, hour: 23, minute: 50 }, 20)).toEqual({
      year: 2000,
      month: 3,
      day: 1,
      hour: 0,
      minute: 10,
    });
  });
});
