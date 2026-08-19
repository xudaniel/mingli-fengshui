/** 出生时辰不详时的敏感性扫描：对同一天的十二时辰逐一排盘，
 * 区分「与时辰无关的稳定结论」和「随时辰变化的敏感结论」。 */

import { computeBazi, ELEMENTS, type Element, type StrengthVerdict } from "./bazi";
import type { CivilMoment } from "./solarTime";

const SHICHEN: { zhi: string; hour: number; label: string }[] = [
  { zhi: "子", hour: 23, label: "23:00–00:59" },
  { zhi: "丑", hour: 1, label: "01:00–02:59" },
  { zhi: "寅", hour: 3, label: "03:00–04:59" },
  { zhi: "卯", hour: 5, label: "05:00–06:59" },
  { zhi: "辰", hour: 7, label: "07:00–08:59" },
  { zhi: "巳", hour: 9, label: "09:00–10:59" },
  { zhi: "午", hour: 11, label: "11:00–12:59" },
  { zhi: "未", hour: 13, label: "13:00–14:59" },
  { zhi: "申", hour: 15, label: "15:00–16:59" },
  { zhi: "酉", hour: 17, label: "17:00–18:59" },
  { zhi: "戌", hour: 19, label: "19:00–20:59" },
  { zhi: "亥", hour: 21, label: "21:00–22:59" },
];

export interface HourCandidate {
  zhi: string;
  label: string;
  hourGanZhi: string;
  verdict: StrengthVerdict;
  favorable: Element[];
  unfavorable: Element[];
  supportPct: number;
}

export interface StableFacts {
  yearGanZhi: string;
  monthGanZhi: string;
  dayGanZhi: string;
  shengXiao: string;
  xingZuo: string;
  fengshuiYear: number;
}

export interface HourSensitivityResult {
  candidates: HourCandidate[];
  stable: StableFacts;
  verdictCounts: Record<StrengthVerdict, number>;
  dominantVerdict: StrengthVerdict;
  favorableInAll: Element[];
  favorableInAny: Element[];
}

/** 扫描同一天（不含具体时辰）的十二时辰候选盘。日期须为民用日历日期，
 * 不做真太阳时校正（时辰未知时，经度校正的意义有限）。 */
export function scanHourSensitivity(
  dateOnly: Pick<CivilMoment, "year" | "month" | "day">,
  gender: "male" | "female",
): HourSensitivityResult {
  const candidates: HourCandidate[] = SHICHEN.map(({ zhi, hour, label }) => {
    const bazi = computeBazi({ ...dateOnly, hour, minute: 0 }, gender);
    return {
      zhi,
      label,
      hourGanZhi: bazi.pillars[3].ganZhi,
      verdict: bazi.strength.verdict,
      favorable: bazi.strength.favorable,
      unfavorable: bazi.strength.unfavorable,
      supportPct: bazi.strength.supportPct,
    };
  });

  const first = computeBazi({ ...dateOnly, hour: SHICHEN[0].hour, minute: 0 }, gender);
  const stable: StableFacts = {
    yearGanZhi: first.pillars[0].ganZhi,
    monthGanZhi: first.pillars[1].ganZhi,
    dayGanZhi: first.pillars[2].ganZhi,
    shengXiao: first.shengXiao,
    xingZuo: first.xingZuo,
    fengshuiYear: first.fengshuiYear,
  };

  const verdictCounts: Record<StrengthVerdict, number> = { 身强: 0, 身弱: 0, 中和: 0 };
  for (const c of candidates) verdictCounts[c.verdict]++;
  const dominantVerdict = (Object.entries(verdictCounts).sort((a, b) => b[1] - a[1])[0][0]) as StrengthVerdict;

  const favorableInAll = ELEMENTS.filter((e) => candidates.every((c) => c.favorable.includes(e)));
  const favorableInAny = ELEMENTS.filter((e) => candidates.some((c) => c.favorable.includes(e)));

  return { candidates, stable, verdictCounts, dominantVerdict, favorableInAll, favorableInAny };
}
