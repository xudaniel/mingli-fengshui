/** 个人择吉日历：结合通用黄历宜忌与命主本身的日柱冲合关系及喜用神，
 * 对某个公历月份的每一天给出个性化的吉凶评分。 */

import { Solar } from "lunar-javascript";
import { ganElement, type Element } from "./analysis";
import { pairwiseZhiRelation } from "./relations";

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
    const solar = Solar.fromYmdHms(year, month, d, 12, 0, 0);
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

    days.push({
      date: `${year}-${String(month).padStart(2, "0")}-${String(d).padStart(2, "0")}`,
      day: d,
      lunarLabel: `${lunar.getMonthInChinese()}月${lunar.getDayInChinese()}`,
      ganZhi,
      isChongDayZhu,
      isXingOrHaiDayZhu,
      ganFavorable,
      ganUnfavorable,
      yi: lunar.getDayYi(2),
      ji: lunar.getDayJi(2),
      score,
    });
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
