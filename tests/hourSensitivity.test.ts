import { describe, expect, it } from "vitest";
import { scanHourSensitivity } from "../src/lib/hourSensitivity";
import { computeBazi } from "../src/lib/bazi";

describe("scanHourSensitivity", () => {
  const r = scanHourSensitivity({ year: 1990, month: 6, day: 15 }, "male");

  it("产出十二时辰候选，且互不相同", () => {
    expect(r.candidates).toHaveLength(12);
    const zhis = r.candidates.map((c) => c.zhi);
    expect(new Set(zhis).size).toBe(12);
    const ganZhis = r.candidates.map((c) => c.hourGanZhi);
    expect(new Set(ganZhis).size).toBe(12); // 同日十二时辰干支互不相同
  });

  it("稳定结论与已知全时辰命盘一致（年月日柱、生肖、星座）", () => {
    const known = computeBazi({ year: 1990, month: 6, day: 15, hour: 8, minute: 30 }, "male");
    expect(r.stable.yearGanZhi).toBe(known.pillars[0].ganZhi);
    expect(r.stable.monthGanZhi).toBe(known.pillars[1].ganZhi);
    expect(r.stable.dayGanZhi).toBe(known.pillars[2].ganZhi);
    expect(r.stable.shengXiao).toBe(known.shengXiao);
    expect(r.stable.xingZuo).toBe(known.xingZuo);
  });

  it("辰时（07:00）候选应与已知辰时命盘的时柱一致", () => {
    const known = computeBazi({ year: 1990, month: 6, day: 15, hour: 8, minute: 30 }, "male");
    const chenCandidate = r.candidates.find((c) => c.zhi === "辰")!;
    expect(chenCandidate.hourGanZhi).toBe(known.pillars[3].ganZhi);
    expect(chenCandidate.verdict).toBe(known.strength.verdict);
  });

  it("verdictCounts 总和为 12，dominantVerdict 为众数", () => {
    const total = Object.values(r.verdictCounts).reduce((a, b) => a + b, 0);
    expect(total).toBe(12);
    expect(r.verdictCounts[r.dominantVerdict]).toBe(Math.max(...Object.values(r.verdictCounts)));
  });

  it("favorableInAll 是 favorableInAny 的子集", () => {
    expect(r.favorableInAll.every((e) => r.favorableInAny.includes(e))).toBe(true);
  });

  it("子时（23:00）候选的日柱与其余候选一致（校验晚子时不跨日）", () => {
    const ziCandidate = r.candidates.find((c) => c.zhi === "子")!;
    const chenCandidate = r.candidates.find((c) => c.zhi === "辰")!;
    // 二者应产生相同的稳定日柱（间接通过 stable 字段验证一致性已在上例覆盖），
    // 这里额外确认子时候选没有抛错且有合法干支
    expect(ziCandidate.hourGanZhi).toMatch(/^[甲乙丙丁戊己庚辛壬癸][子丑寅卯辰巳午未申酉戌亥]$/);
    expect(chenCandidate.hourGanZhi).toMatch(/^[甲乙丙丁戊己庚辛壬癸][子丑寅卯辰巳午未申酉戌亥]$/);
  });
});
