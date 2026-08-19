/** 中国历史时制提示：1986–1991 夏令时与 1949 年前五时区。
 * 只做提醒与可选校正，不擅自修改用户输入。 */

import type { CivilMoment } from "./solarTime";

/** 中国夏令时各年起止（当日 02:00 起 / 02:00 止，期间钟表拨快 1 小时至 UTC+9）。
 * 依据国务院历年通知（与 tzdata Asia/Shanghai 一致）：
 * 起：1986-05-04，其后各年 4 月中旬周日；止：9 月中旬周日。 */
export const CHINA_DST_PERIODS: { start: [number, number, number]; end: [number, number, number] }[] = [
  { start: [1986, 5, 4], end: [1986, 9, 14] },
  { start: [1987, 4, 12], end: [1987, 9, 13] },
  { start: [1988, 4, 10], end: [1988, 9, 11] },
  { start: [1989, 4, 16], end: [1989, 9, 17] },
  { start: [1990, 4, 15], end: [1990, 9, 16] },
  { start: [1991, 4, 14], end: [1991, 9, 15] },
];

function toMs(y: number, m: number, d: number, hour = 0, minute = 0): number {
  return Date.UTC(y, m - 1, d, hour, minute);
}

/** 该钟表时刻是否落在中国夏令时期间（[起日 02:00, 止日 02:00)）。 */
export function inChinaDst(civil: CivilMoment): boolean {
  const t = toMs(civil.year, civil.month, civil.day, civil.hour, civil.minute);
  return CHINA_DST_PERIODS.some(({ start, end }) => {
    return t >= toMs(start[0], start[1], start[2], 2) && t < toMs(end[0], end[1], end[2], 2);
  });
}

/** 中国大致经度范围（含港澳台），用于历史时制提示的适用判断。 */
export function isChinaLongitude(longitude: number): boolean {
  return longitude >= 73 && longitude <= 135;
}

/** 1949 年前出生且出生地在中国经度范围内 → 提示五时区历史背景。 */
export function isPre1949China(civil: CivilMoment, longitude: number): boolean {
  return civil.year < 1949 && isChinaLongitude(longitude);
}

export const DST_WARNING_TEXT =
  "出生时刻落在中国夏令时期间（1986–1991 年 4 月中旬至 9 月中旬，钟表拨快 1 小时）。若出生证明记录的是当时的钟表时间，建议回拨 1 小时排盘。";

export const PRE_1949_HINT_TEXT =
  "1949 年前的中国曾使用昆仑、新藏、陇蜀、中原、长白五个时区，各地钟表时间不统一。请核实出生记录当时所用的时制，必要时手动调整 UTC 偏移。";
