/** 数字吉凶查询（手机号/车牌号）：传统做法取号码的末 2/3/4 位数字之和
 * 所成的数，查 81 数理吉凶表（与五格剖象法共用同一张表，见 wuge.ts）。
 * 民俗娱乐参考，与运营商/车管部门无任何关联。 */

import { getShuLi, type Luck } from "./wuge";

export interface NumberGroupReading {
  label: string; // 如「末四位」
  digits: string; // 参与计算的数字串
  sum: number; // 数字之和
  shuLi: { number: number; luck: Luck; meaning: string };
}

export interface NumberLuckResult {
  input: string;
  groups: NumberGroupReading[];
  /** 依各组吉凶折算的 0-100 总评分 */
  overallScore: number;
  overallLuck: Luck;
}

const LUCK_SCORE: Record<Luck, number> = { 大吉: 100, 吉: 80, 半吉: 55, 凶: 30, 大凶: 10 };

const GROUP_SPECS: { label: string; take: number }[] = [
  { label: "末二位", take: 2 },
  { label: "末三位", take: 3 },
  { label: "末四位", take: 4 },
];

function sumDigits(digits: string): number {
  return [...digits].reduce((acc, d) => acc + Number(d), 0);
}

export function analyzeNumberLuck(raw: string): NumberLuckResult {
  const input = raw.replace(/[\s-]/g, "");
  if (!/^\d+$/.test(input)) throw new Error("请输入纯数字（可含空格或连字符分隔）");
  if (input.length < 2) throw new Error("号码至少需要 2 位数字");
  if (input.length > 20) throw new Error("号码过长（最多 20 位）");

  const groups: NumberGroupReading[] = GROUP_SPECS.filter((g) => input.length >= g.take).map((g) => {
    const digits = input.slice(-g.take);
    const sum = sumDigits(digits);
    return { label: g.label, digits, sum, shuLi: getShuLi(sum) };
  });

  const avg = groups.reduce((acc, g) => acc + LUCK_SCORE[g.shuLi.luck], 0) / groups.length;
  const overallScore = Math.round(avg);
  const overallLuck: Luck =
    overallScore >= 85 ? "大吉" : overallScore >= 65 ? "吉" : overallScore >= 45 ? "半吉" : overallScore >= 25 ? "凶" : "大凶";

  return { input, groups, overallScore, overallLuck };
}
