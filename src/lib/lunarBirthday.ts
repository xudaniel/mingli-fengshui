/** 农历生日：把档案的公历生日换算为农历月日，并找出该农历月日下一次
 * 对应的公历日期（含倒计时）。闰月出生按当月序数处理（与紫微斗数一致）；
 * 目标年份无该农历日（如三十日遇小月）时顺延到下一年查找。 */

import { Solar } from "lunar-javascript";

export interface LunarBirthdayInfo {
  lunarMonth: number; // 1-12（闰月取绝对值）
  lunarDay: number; // 1-30
  lunarLabel: string; // 如「五月廿三」
  /** 下一次农历生日对应的公历日期（yyyy-mm-dd） */
  nextSolarDate: string;
  /** 距下一次农历生日的天数（当天为 0） */
  daysUntil: number;
}

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

/** 在 fromYear 起的若干年内查找 lunarMonth/lunarDay 对应的公历日期。
 * 逐日扫描目标年份前后各约 13 个月的窗口，避免自行实现农历置闰规则。 */
function findNextOccurrence(lunarMonth: number, lunarDay: number, after: Date): Date | null {
  // 农历年长最多约 384 天，扫两年窗口必能覆盖下一次生日（除非该月日几乎不出现）
  for (let offset = 0; offset <= 800; offset++) {
    const d = new Date(after.getFullYear(), after.getMonth(), after.getDate() + offset);
    const lunar = Solar.fromYmdHms(d.getFullYear(), d.getMonth() + 1, d.getDate(), 12, 0, 0).getLunar();
    if (Math.abs(lunar.getMonth()) === lunarMonth && lunar.getDay() === lunarDay) return d;
  }
  return null;
}

export function computeLunarBirthday(solarBirthDate: string, today: Date = new Date()): LunarBirthdayInfo | null {
  const [y, m, d] = solarBirthDate.split("-").map(Number);
  if (!y || !m || !d) return null;
  const birthLunar = Solar.fromYmdHms(y, m, d, 12, 0, 0).getLunar();
  const lunarMonth = Math.abs(birthLunar.getMonth());
  const lunarDay = birthLunar.getDay();
  const lunarLabel = `${birthLunar.getMonthInChinese()}月${birthLunar.getDayInChinese()}`;

  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const next = findNextOccurrence(lunarMonth, lunarDay, todayStart);
  if (!next) return null;

  const daysUntil = Math.round((next.getTime() - todayStart.getTime()) / 86400000);
  return {
    lunarMonth,
    lunarDay,
    lunarLabel,
    nextSolarDate: `${next.getFullYear()}-${pad(next.getMonth() + 1)}-${pad(next.getDate())}`,
    daysUntil,
  };
}
