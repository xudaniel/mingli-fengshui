/** 个人择吉日历：结合通用黄历宜忌与命主本身的日柱冲合关系及喜用神，
 * 对某个公历月份的每一天给出个性化的吉凶评分。 */

import { Solar } from "lunar-javascript";
import { ganElement, type Element } from "./analysis";
import { pairwiseZhiRelation } from "./relations";
import type { Lang } from "./i18n/state";

export interface DayScore {
  date: string; // yyyy-mm-dd
  day: number;
  lunarLabel: string; // 农历几月几
  ganZhi: string;
  isChongDayZhu: boolean;
  isXingOrHaiDayZhu: boolean;
  ganFavorable: boolean;
  ganUnfavorable: boolean;
  yi: string[];
  ji: string[];
  score: number; // -5..+4，越高越吉
}

function daysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

function scoreDay(year: number, month: number, day: number, ownDayZhi: string, favorable: Element[], unfavorable: Element[]): DayScore {
  const solar = Solar.fromYmdHms(year, month, day, 12, 0, 0);
  const lunar = solar.getLunar();
  const ganZhi = lunar.getDayInGanZhi();
  const gan = ganZhi[0];
  const zhi = ganZhi[1];

  const rel = pairwiseZhiRelation(zhi, ownDayZhi);
  const isChongDayZhu = rel.some((r) => r.kind === "相冲");
  const isXingOrHaiDayZhu = rel.some((r) => r.kind === "相刑" || r.kind === "相害" || r.kind === "自刑");

  const ge = ganElement(gan);
  const ganFavorable = favorable.includes(ge);
  const ganUnfavorable = unfavorable.includes(ge);

  let score = 0;
  if (isChongDayZhu) score -= 3;
  if (isXingOrHaiDayZhu) score -= 2;
  if (rel.some((r) => r.kind === "六合")) score += 1;
  if (ganFavorable) score += 2;
  if (ganUnfavorable) score -= 1;
  score = Math.max(-5, Math.min(4, score));

  return {
    date: `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
    day,
    lunarLabel: `${lunar.getMonthInChinese()}月${lunar.getDayInChinese()}`,
    ganZhi,
    isChongDayZhu,
    isXingOrHaiDayZhu,
    ganFavorable,
    ganUnfavorable,
    yi: lunar.getDayYi(2),
    ji: lunar.getDayJi(2),
    score,
  };
}

export function computeMonthCalendar(
  year: number,
  month: number,
  ownDayZhi: string,
  favorable: Element[],
  unfavorable: Element[],
): DayScore[] {
  const total = daysInMonth(year, month);
  const days: DayScore[] = [];
  for (let d = 1; d <= total; d++) {
    days.push(scoreDay(year, month, d, ownDayZhi, favorable, unfavorable));
  }
  return days;
}

/** 同 computeMonthCalendar，但按任意起始日期 + 天数遍历，不受公历月份边界限制
 * （供「择吉区间搜索」跨月查找使用）。 */
export function computeDateRangeCalendar(
  startDate: Date,
  numDays: number,
  ownDayZhi: string,
  favorable: Element[],
  unfavorable: Element[],
): DayScore[] {
  const days: DayScore[] = [];
  for (let i = 0; i < numDays; i++) {
    const d = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() + i);
    days.push(scoreDay(d.getFullYear(), d.getMonth() + 1, d.getDate(), ownDayZhi, favorable, unfavorable));
  }
  return days;
}

export type EventType = "签约" | "搬家" | "开业" | "嫁娶";

const EVENT_KEYWORDS: Record<EventType, string[]> = {
  签约: ["订盟", "立券", "交易", "纳财", "会亲友"],
  搬家: ["移徙", "入宅", "安床"],
  开业: ["开市", "开业", "纳财", "开仓"],
  嫁娶: ["嫁娶", "订盟", "纳采", "结婚姻"],
};

/** 筛选某类事件在「宜」中命中关键字、且个性化评分不低于 0 的日子。 */
export function filterGoodDaysForEvent(days: DayScore[], event: EventType): DayScore[] {
  const keywords = EVENT_KEYWORDS[event];
  return days.filter((d) => d.score >= 0 && d.yi.some((y) => keywords.some((k) => y.includes(k))));
}

export interface RankedDay {
  day: DayScore;
  reason: string;
}

/** 不选事件类型时，「真正值得推荐」的门槛比 filterGoodDaysForEvent 的 >=0 更高——
 * 没有具体事件的宜忌关键字佐证，只凭综合评分本身判断。 */
const GENERAL_GOOD_THRESHOLD = 2;

function describeDayReason(d: DayScore, lang: Lang): string {
  const reasons: string[] = [];
  if (lang === "zh") {
    if (d.ganFavorable) reasons.push("天干为喜用神");
    if (!d.isChongDayZhu && !d.isXingOrHaiDayZhu) reasons.push("与日柱无冲刑害");
    if (d.yi.length > 0) reasons.push(`宜：${d.yi.slice(0, 3).join("、")}`);
    return reasons.length > 0 ? reasons.join("；") : "综合评分较高";
  }
  if (d.ganFavorable) reasons.push("day stem is a favorable element");
  if (!d.isChongDayZhu && !d.isXingOrHaiDayZhu) reasons.push("no clash/punishment/harm with your day pillar");
  if (d.yi.length > 0) reasons.push(`favorable for: ${d.yi.slice(0, 3).join(", ")}`);
  return reasons.length > 0 ? reasons.join("; ") : "solid overall score";
}

/** 在一批已评分的日子中，按事件类型（或不限）挑出评分最高的若干天，附一句话理由。
 * 找不到够格的日子时诚实返回空数组，而不是硬凑出平庸的 top-N。 */
export function rankBestDays(days: DayScore[], event: EventType | null, topN: number, lang: Lang = "zh"): RankedDay[] {
  const candidates = event ? filterGoodDaysForEvent(days, event) : days.filter((d) => d.score >= GENERAL_GOOD_THRESHOLD);
  return candidates
    .slice()
    .sort((a, b) => b.score - a.score)
    .slice(0, topN)
    .map((day) => ({ day, reason: describeDayReason(day, lang) }));
}
