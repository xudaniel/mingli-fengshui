/** 六爻（三枚铜钱法）与梅花易数起卦。 */

import { TRIGRAM_ORDER, findHexagram, trigramFromLines, type Hexagram } from "./ichingData";

export type LineValue = 6 | 7 | 8 | 9; // 老阴 少阳 少阴 老阳

export interface CastLine {
  value: LineValue;
  /** 本卦此爻是否为阳 */
  yang: boolean;
  /** 6、9 为动爻（老阴/老阳），变卦时此爻阴阳互换 */
  moving: boolean;
}

export interface LiuYaoResult {
  lines: CastLine[]; // 下至上共 6 爻
  original: Hexagram;
  changed: Hexagram | null; // 无动爻时为 null
  movingIndices: number[]; // 动爻位置（0-5，下至上）
}

/** 单次摇三枚铜钱：正面(3)反面(2)，六次摇卦得六爻（下至上）。
 * coinTosses 可选注入，便于测试；默认用 Math.random 模拟真实摇卦。 */
export function castLiuYao(coinTosses?: LineValue[]): LiuYaoResult {
  const values: LineValue[] =
    coinTosses ??
    Array.from({ length: 6 }, () => {
      let sum = 0;
      for (let i = 0; i < 3; i++) sum += Math.random() < 0.5 ? 2 : 3;
      return sum as LineValue;
    });

  const lines: CastLine[] = values.map((value) => ({
    value,
    yang: value === 7 || value === 9,
    moving: value === 6 || value === 9,
  }));

  const originalLines = lines.map((l) => l.yang) as boolean[];
  const originalUpper = trigramFromLines([originalLines[3], originalLines[4], originalLines[5]]);
  const originalLower = trigramFromLines([originalLines[0], originalLines[1], originalLines[2]]);
  const original = findHexagram(originalUpper, originalLower);

  const movingIndices = lines.map((l, i) => (l.moving ? i : -1)).filter((i) => i >= 0);

  let changed: Hexagram | null = null;
  if (movingIndices.length > 0) {
    const changedLines = originalLines.map((yang, i) => (lines[i].moving ? !yang : yang));
    const changedUpper = trigramFromLines([changedLines[3], changedLines[4], changedLines[5]]);
    const changedLower = trigramFromLines([changedLines[0], changedLines[1], changedLines[2]]);
    changed = findHexagram(changedUpper, changedLower);
  }

  return { lines, original, changed, movingIndices };
}

export interface MeiHuaResult {
  upperNumber: number;
  lowerNumber: number;
  movingLine: number; // 1-6
  upperTrigram: string;
  lowerTrigram: string;
  ti: "upper" | "lower"; // 体卦：动爻在下卦则体在上卦，反之亦然（简化：视动爻归属而定）
  hexagram: Hexagram;
}

/** 梅花易数数字起卦：任意两个正整数分别定上卦、下卦，两数之和定动爻。 */
export function castMeiHuaByNumbers(numA: number, numB: number): MeiHuaResult {
  const a = Math.abs(Math.trunc(numA));
  const b = Math.abs(Math.trunc(numB));
  const upperIdx = ((a - 1) % 8 + 8) % 8;
  const lowerIdx = ((b - 1) % 8 + 8) % 8;
  // 动爻 = (上卦数+下卦数) mod 6，余 0 记为第 6 爻
  const movingLine = (((a + b - 1) % 6) + 6) % 6 + 1;

  const upperTrigram = TRIGRAM_ORDER[upperIdx];
  const lowerTrigram = TRIGRAM_ORDER[lowerIdx];
  const hexagram = findHexagram(upperTrigram, lowerTrigram);
  const ti: "upper" | "lower" = movingLine <= 3 ? "upper" : "lower";

  return { upperNumber: numA, lowerNumber: numB, movingLine, upperTrigram, lowerTrigram, ti, hexagram };
}

const ZHI_ORDER = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];

/** 以时间起卦（梅花易数经典时间起卦法）：年支数 + 农历月 + 农历日定上卦，
 * 上卦数再加时辰数定下卦。年支须为已按立春/农历正确推算的地支
 * （调用方通常直接复用 bazi.ts 的 yearGanZhi 结果，避免重复实现历法计算）。 */
export function castMeiHuaByTime(
  yearZhi: string,
  lunarMonth: number,
  lunarDay: number,
  shiChenIndex: number,
): MeiHuaResult {
  const yearZhiIndex = ZHI_ORDER.indexOf(yearZhi);
  if (yearZhiIndex < 0) throw new Error(`非法地支：${yearZhi}`);
  const numA = yearZhiIndex + 1 + lunarMonth + lunarDay;
  const numB = numA + shiChenIndex + 1;
  return castMeiHuaByNumbers(numA, numB);
}
