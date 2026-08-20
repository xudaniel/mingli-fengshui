/** 起名建议：结合宝宝喜用神与常用起名用字库，生成候选双字名，
 * 按五格数理的吉利程度排序。 */

import type { Element } from "./analysis";
import { charsByElement, type GivenCharEntry } from "./strokeData";
import { buildWuGeReport, type WuGeReport } from "./wuge";

export interface NameCandidate {
  chars: string; // 双字名
  elements: [Element, Element];
  report: WuGeReport;
}

/** surnameStrokes: 姓氏笔画（一或两字）；favorableElements: 喜用五行（按优先顺序）。
 * 返回按五格吉利程度（goodRatio 降序）排序的候选名，最多 limit 条。 */
export function suggestNames(
  surnameStrokes: number[],
  favorableElements: Element[],
  limit = 8,
): NameCandidate[] {
  const pool: GivenCharEntry[] = favorableElements.length
    ? favorableElements.flatMap((e) => charsByElement(e))
    : (["木", "火", "土", "金", "水"] as Element[]).flatMap((e) => charsByElement(e));

  const candidates: NameCandidate[] = [];
  const seen = new Set<string>();

  for (const first of pool) {
    for (const second of pool) {
      const chars = first.char + second.char;
      if (seen.has(chars)) continue;
      seen.add(chars);
      const report = buildWuGeReport(surnameStrokes, [first.strokes, second.strokes]);
      candidates.push({ chars, elements: [first.element, second.element], report });
    }
  }

  candidates.sort((a, b) => b.report.goodRatio - a.report.goodRatio);
  return candidates.slice(0, limit);
}
