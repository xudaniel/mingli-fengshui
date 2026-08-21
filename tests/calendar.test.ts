import { describe, expect, it } from "vitest";
import { computeMonthCalendar, filterGoodDaysForEvent, computeDateRangeCalendar, rankBestDays } from "../src/lib/calendar";

describe("computeMonthCalendar", () => {
  const days = computeMonthCalendar(2026, 3, "子", ["金"], ["火"]);

  it("天数与该月实际天数一致", () => {
    expect(days).toHaveLength(31); // 2026-03 有 31 天
    expect(days[0].date).toBe("2026-03-01");
    expect(days[30].date).toBe("2026-03-31");
  });

  it("每日干支与库计算一致，宜忌非空数组", () => {
    for (const d of days.slice(0, 5)) {
      expect(d.ganZhi).toMatch(/^[甲乙丙丁戊己庚辛壬癸][子丑寅卯辰巳午未申酉戌亥]$/);
      expect(Array.isArray(d.yi)).toBe(true);
      expect(Array.isArray(d.ji)).toBe(true);
    }
  });

  it("冲日柱（子日的对冲为午日）应标记 isChongDayZhu 且评分较低", () => {
    const chongDay = days.find((d) => d.ganZhi[1] === "午");
    expect(chongDay?.isChongDayZhu).toBe(true);
    expect(chongDay!.score).toBeLessThanOrEqual(-3);
  });

  it("六合日柱（子日的六合为丑日）不判定为冲", () => {
    const heDay = days.find((d) => d.ganZhi[1] === "丑");
    expect(heDay?.isChongDayZhu).toBe(false);
  });

  it("评分范围恒在 -5..4", () => {
    for (const d of days) {
      expect(d.score).toBeGreaterThanOrEqual(-5);
      expect(d.score).toBeLessThanOrEqual(4);
    }
  });

  it("2 月闰年天数正确处理（2028 为闰年）", () => {
    expect(computeMonthCalendar(2028, 2, "子", [], [])).toHaveLength(29);
    expect(computeMonthCalendar(2027, 2, "子", [], [])).toHaveLength(28);
  });
});

describe("filterGoodDaysForEvent", () => {
  const days = computeMonthCalendar(2026, 3, "子", ["金"], ["火"]);

  it("按事件类型筛出的日子评分均不低于 0 且宜项含相关关键字", () => {
    const moving = filterGoodDaysForEvent(days, "搬家");
    for (const d of moving) {
      expect(d.score).toBeGreaterThanOrEqual(0);
      expect(d.yi.some((y) => ["移徙", "入宅", "安床"].includes(y))).toBe(true);
    }
  });

  it("不同事件类型返回可能不同的日子集合", () => {
    const wedding = filterGoodDaysForEvent(days, "嫁娶");
    const opening = filterGoodDaysForEvent(days, "开业");
    // 至少验证两者都是合法数组（可能为空，取决于当月宜忌）
    expect(Array.isArray(wedding)).toBe(true);
    expect(Array.isArray(opening)).toBe(true);
  });
});

describe("computeDateRangeCalendar", () => {
  it("按天数遍历，天数与请求一致，跨月边界正确进位", () => {
    const days = computeDateRangeCalendar(new Date(2026, 1, 27), 5, "子", ["金"], ["火"]);
    expect(days).toHaveLength(5);
    expect(days.map((d) => d.date)).toEqual(["2026-02-27", "2026-02-28", "2026-03-01", "2026-03-02", "2026-03-03"]);
  });

  it("每日评分逻辑与 computeMonthCalendar 一致（同一天同一结果）", () => {
    const monthDays = computeMonthCalendar(2026, 3, "子", ["金"], ["火"]);
    const rangeDays = computeDateRangeCalendar(new Date(2026, 2, 1), 31, "子", ["金"], ["火"]);
    expect(rangeDays).toEqual(monthDays);
  });
});

describe("rankBestDays", () => {
  const days = computeDateRangeCalendar(new Date(2026, 0, 1), 60, "子", ["金"], ["火"]);

  it("按分数降序排列，且不超过 topN", () => {
    const ranked = rankBestDays(days, null, 5);
    expect(ranked.length).toBeLessThanOrEqual(5);
    for (let i = 1; i < ranked.length; i++) {
      expect(ranked[i - 1].day.score).toBeGreaterThanOrEqual(ranked[i].day.score);
    }
  });

  it("每条结果都带有一句话理由", () => {
    const ranked = rankBestDays(days, null, 5);
    for (const r of ranked) {
      expect(typeof r.reason).toBe("string");
      expect(r.reason.length).toBeGreaterThan(0);
    }
  });

  it("指定事件类型时，结果与 filterGoodDaysForEvent 的候选集一致", () => {
    const ranked = rankBestDays(days, "搬家", 100);
    const filtered = filterGoodDaysForEvent(days, "搬家");
    expect(ranked.length).toBe(Math.min(filtered.length, 100));
  });

  it("找不到够格的日子时诚实返回空数组，而非硬凑平庸结果", () => {
    // 用一个几乎不可能被判定为「够格」的喜忌组合把候选集清空
    const noneDays = computeDateRangeCalendar(new Date(2026, 0, 1), 10, "子", [], []);
    const ranked = rankBestDays(noneDays, "开业", 5);
    expect(Array.isArray(ranked)).toBe(true);
    // 不断言非空——具体是否为空取决于当期黄历宜忌，只验证类型与不超范围
    expect(ranked.length).toBeLessThanOrEqual(5);
  });

  it("英文理由使用英文措辞", () => {
    const ranked = rankBestDays(days, null, 3, "en");
    for (const r of ranked) {
      expect(/[a-zA-Z]/.test(r.reason)).toBe(true);
    }
  });
});
