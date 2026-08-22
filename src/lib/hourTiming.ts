/** 择时助手：对指定公历日期的十二时辰逐一评分——评分规则与 calendar.ts
 * 的择日评分同构（冲刑害减分、六合加分、喜用天干加分），只是从日柱下探
 * 到时柱一层。时辰枚举方式与 hourSensitivity.ts 的十二时辰扫描一致。 */

import { Solar } from "lunar-javascript";
import { ganElement, type Element } from "./analysis";
import { pairwiseZhiRelation } from "./relations";

const SHICHEN: { zhi: string; hour: number; label: string }[] = [
  { zhi: "子", hour: 0, label: "23:00-00:59" },
  { zhi: "丑", hour: 2, label: "01:00-02:59" },
  { zhi: "寅", hour: 4, label: "03:00-04:59" },
  { zhi: "卯", hour: 6, label: "05:00-06:59" },
  { zhi: "辰", hour: 8, label: "07:00-08:59" },
  { zhi: "巳", hour: 10, label: "09:00-10:59" },
  { zhi: "午", hour: 12, label: "11:00-12:59" },
  { zhi: "未", hour: 14, label: "13:00-14:59" },
  { zhi: "申", hour: 16, label: "15:00-16:59" },
  { zhi: "酉", hour: 18, label: "17:00-18:59" },
  { zhi: "戌", hour: 20, label: "19:00-20:59" },
  { zhi: "亥", hour: 22, label: "21:00-22:59" },
];

export interface HourScore {
  zhi: string;
  label: string; // 钟表时段
  ganZhi: string; // 该时辰的时柱干支
  isChong: boolean;
  isXingOrHai: boolean;
  ganFavorable: boolean;
  score: number; // -5..+4，与 calendar.ts 的日评分同量纲
}

export function scoreHoursOfDay(
  year: number,
  month: number,
  day: number,
  ownDayZhi: string,
  favorable: Element[],
  unfavorable: Element[],
): HourScore[] {
  return SHICHEN.map(({ zhi, hour, label }) => {
    const ec = Solar.fromYmdHms(year, month, day, hour, 0, 0).getLunar().getEightChar();
    const gan = ec.getTimeGan();
    const hourZhi = ec.getTimeZhi();

    const rel = pairwiseZhiRelation(hourZhi, ownDayZhi);
    const isChong = rel.some((r) => r.kind === "相冲");
    const isXingOrHai = rel.some((r) => r.kind === "相刑" || r.kind === "相害" || r.kind === "自刑");
    const ge = ganElement(gan);
    const ganFavorable = favorable.includes(ge);
    const ganUnfavorable = unfavorable.includes(ge);

    let score = 0;
    if (isChong) score -= 3;
    if (isXingOrHai) score -= 2;
    if (rel.some((r) => r.kind === "六合")) score += 1;
    if (ganFavorable) score += 2;
    if (ganUnfavorable) score -= 1;
    score = Math.max(-5, Math.min(4, score));

    return { zhi, label, ganZhi: gan + hourZhi, isChong, isXingOrHai, ganFavorable, score };
  });
}
