/** 桃花星（咸池）检测：按年支、日支分别查三合局的「沐浴」位。
 * 传统口诀：申子辰见酉，寅午戌见卯，巳酉丑见午，亥卯未见子。 */

const GROUPS: [string[], string][] = [
  [["申", "子", "辰"], "酉"],
  [["寅", "午", "戌"], "卯"],
  [["巳", "酉", "丑"], "午"],
  [["亥", "卯", "未"], "子"],
];

function peachZhiFor(baseZhi: string): string | null {
  for (const [group, result] of GROUPS) {
    if (group.includes(baseZhi)) return result;
  }
  return null;
}

export type PeachBlossomMethod = "年支" | "日支";

export interface PeachBlossomHit {
  method: PeachBlossomMethod;
  peachZhi: string;
  /** 命中的柱下标（0 年 1 月 2 日 3 时） */
  pillars: number[];
}

export interface PeachBlossomResult {
  byYearZhi: string | null;
  byDayZhi: string | null;
  hits: PeachBlossomHit[];
}

/** branches: 四柱地支，按 年月日时 顺序。 */
export function detectPeachBlossom(branches: string[]): PeachBlossomResult {
  const yearZhi = branches[0];
  const dayZhi = branches[2];
  const byYearZhi = peachZhiFor(yearZhi);
  const byDayZhi = peachZhiFor(dayZhi);

  const findPillars = (zhi: string) => branches.map((b, i) => (b === zhi ? i : -1)).filter((i) => i >= 0);

  const hits: PeachBlossomHit[] = [];
  if (byYearZhi) {
    const pillars = findPillars(byYearZhi);
    if (pillars.length) hits.push({ method: "年支", peachZhi: byYearZhi, pillars });
  }
  if (byDayZhi && byDayZhi !== byYearZhi) {
    const pillars = findPillars(byDayZhi);
    if (pillars.length) hits.push({ method: "日支", peachZhi: byDayZhi, pillars });
  }

  return { byYearZhi, byDayZhi, hits };
}
