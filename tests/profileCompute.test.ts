import { describe, expect, it } from "vitest";
import { computeFromProfile } from "../src/lib/profileCompute";
import type { Profile } from "../src/lib/profiles";

function mkProfile(overrides: Partial<Profile>): Profile {
  return {
    id: "x",
    label: "test",
    name: "test",
    gender: "male",
    date: "1990-06-15",
    time: "08:30",
    hourUnknown: false,
    city: "北京",
    longitude: 116.4074,
    utcOffset: 8,
    useTrueSolar: true,
    useEot: true,
    createdAt: 0,
    updatedAt: 0,
    ...overrides,
  };
}

describe("computeFromProfile", () => {
  it("产出与已知命盘一致的四柱（含真太阳时校正）", () => {
    const { bazi } = computeFromProfile(mkProfile({}));
    expect(bazi.pillars.map((p) => p.ganZhi).join(" ")).toBe("庚午 壬午 辛亥 壬辰");
  });

  it("hourUnknown 时使用正午占位且不做真太阳时校正", () => {
    const { bazi, effectiveCivil } = computeFromProfile(mkProfile({ hourUnknown: true, time: "" }));
    expect(effectiveCivil.hour).toBe(12);
    expect(effectiveCivil.minute).toBe(0);
    expect(bazi.pillars[2].ganZhi).toBe("辛亥"); // 日柱不受时辰影响
  });

  it("useTrueSolar 为假时不做经度校正（但仍自动处理夏令时）", () => {
    // 1990-06-15 落在当年夏令时区间内，自动回拨 1 小时是预期行为
    const { effectiveCivil } = computeFromProfile(mkProfile({ useTrueSolar: false }));
    expect(effectiveCivil).toEqual({ year: 1990, month: 6, day: 15, hour: 7, minute: 30 });
  });

  it("非夏令时年份且 useTrueSolar 为假时完全不校正", () => {
    const { effectiveCivil } = computeFromProfile(
      mkProfile({ date: "1995-06-15", useTrueSolar: false }),
    );
    expect(effectiveCivil).toEqual({ year: 1995, month: 6, day: 15, hour: 8, minute: 30 });
  });

  it("夏令时期间自动回拨 1 小时", () => {
    const { effectiveCivil } = computeFromProfile(
      mkProfile({ date: "1988-08-08", time: "12:30", useTrueSolar: false }),
    );
    expect(effectiveCivil.hour).toBe(11);
    expect(effectiveCivil.minute).toBe(30);
  });

  it("同时给出命卦", () => {
    const { gua } = computeFromProfile(mkProfile({}));
    expect(gua.name).toBe("坎");
  });
});
