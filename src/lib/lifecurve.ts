/** 人生五行走势图：把大运（十年段）与流年（逐年）干支对照喜用神计分，
 * 拼出一条可视化的人生曲线。评分仅计天干与地支本气，不计藏干/合冲，
 * 是对「顺逆」的粗略量化，非精确吉凶判断。 */

import { ganElement, zhiElement, type Element } from "./analysis";
import { yearGanZhi, type DaYunEntry } from "./bazi";

/** 单个干支对喜用神的契合度评分：天干 ±2，地支本气 ±1，范围 -3..+3。 */
export function scoreGanZhi(ganZhi: string, favorable: Element[], unfavorable: Element[]): number {
  const gan = ganZhi[0];
  const zhi = ganZhi[1];
  let score = 0;
  const ge = ganElement(gan);
  if (favorable.includes(ge)) score += 2;
  else if (unfavorable.includes(ge)) score -= 2;
  const ze = zhiElement(zhi);
  if (favorable.includes(ze)) score += 1;
  else if (unfavorable.includes(ze)) score -= 1;
  return score;
}

export interface YearPoint {
  age: number;
  year: number;
  ganZhi: string;
  score: number;
}

export interface DaYunSegment {
  startAge: number;
  endAge: number;
  startYear: number;
  endYear: number;
  ganZhi: string;
  score: number;
}

export interface LifeCurve {
  birthYear: number;
  years: YearPoint[];
  segments: DaYunSegment[];
}

export function computeLifeCurve(
  favorable: Element[],
  unfavorable: Element[],
  daYun: DaYunEntry[],
): LifeCurve {
  if (daYun.length === 0) return { birthYear: 0, years: [], segments: [] };

  const birthYear = daYun[0].startYear - daYun[0].startAge + 1;
  const lastEndYear = daYun[daYun.length - 1].endYear;

  const years: YearPoint[] = [];
  for (let y = daYun[0].startYear; y <= lastEndYear; y++) {
    const gz = yearGanZhi(y);
    years.push({ age: y - birthYear + 1, year: y, ganZhi: gz, score: scoreGanZhi(gz, favorable, unfavorable) });
  }

  const segments: DaYunSegment[] = daYun.map((d) => ({
    startAge: d.startAge,
    endAge: d.endAge,
    startYear: d.startYear,
    endYear: d.endYear,
    ganZhi: d.ganZhi,
    score: scoreGanZhi(d.ganZhi, favorable, unfavorable),
  }));

  return { birthYear, years, segments };
}
