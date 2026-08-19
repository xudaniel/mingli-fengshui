/** 合婚配对：综合日柱干支关系、生肖关系、五行互补与命卦分组，
 * 给出简化的民俗式合婚参考（非专业合婚排盘，仅供娱乐参考）。 */

import type { BaziResult } from "./bazi";
import type { GuaInfo } from "./bagua";
import { pairwiseZhiRelation, SAN_HE, type PairwiseRelation } from "./relations";
import type { Element } from "./analysis";

/** 天干五合：甲己合土 乙庚合金 丙辛合水 丁壬合木 戊癸合火 */
const GAN_HE: Record<string, [string, Element]> = {
  甲: ["己", "土"], 己: ["甲", "土"],
  乙: ["庚", "金"], 庚: ["乙", "金"],
  丙: ["辛", "水"], 辛: ["丙", "水"],
  丁: ["壬", "木"], 壬: ["丁", "木"],
  戊: ["癸", "火"], 癸: ["戊", "火"],
};

export interface DayGanRelation {
  hasHe: boolean;
  element?: Element;
  summary: string;
}

export function dayGanRelation(ganA: string, ganB: string): DayGanRelation {
  const pair = GAN_HE[ganA];
  const hasHe = !!pair && pair[0] === ganB;
  return {
    hasHe,
    element: hasHe ? pair[1] : undefined,
    summary: hasHe
      ? `日干${ganA}与${ganB}天干五合，化${pair[1]}，主两人性情相吸、易生默契。`
      : `日干${ganA}与${ganB}之间无天干五合关系，性情差异需靠日常磨合。`,
  };
}

export interface ZhiRelationResult {
  relations: PairwiseRelation[];
  sanHe: boolean;
  summary: string;
}

function isSanHePair(a: string, b: string): boolean {
  return SAN_HE.some(([x, y, z]) => [x, y, z].includes(a) && [x, y, z].includes(b) && a !== b);
}

export function dayZhiRelation(zhiA: string, zhiB: string): ZhiRelationResult {
  const relations = pairwiseZhiRelation(zhiA, zhiB);
  const sanHe = isSanHePair(zhiA, zhiB);
  const parts: string[] = [];
  if (relations.some((r) => r.kind === "六合")) parts.push("日支六合，居家关系和睦融洽");
  if (sanHe) parts.push("日支三合，彼此相处轻松投缘");
  if (relations.some((r) => r.kind === "相冲")) parts.push("日支相冲，生活习惯差异较大，需多包容");
  if (relations.some((r) => r.kind === "相刑")) parts.push("日支相刑，相处中易生摩擦，需多沟通");
  if (relations.some((r) => r.kind === "自刑")) parts.push("日支同支自刑，双方都需留意各自的固执之处");
  if (relations.some((r) => r.kind === "相害")) parts.push("日支相害，需留意日常中的猜忌与误会");
  const summary = parts.length ? parts.join("；") + "。" : "日支之间无明显合冲刑害，关系相对平顺。";
  return { relations, sanHe, summary };
}

export type ZodiacRelationResult = ZhiRelationResult;

export function zodiacRelation(yearZhiA: string, yearZhiB: string): ZodiacRelationResult {
  return dayZhiRelation(yearZhiA, yearZhiB);
}

export interface ElementComplement {
  aSuppliesB: Element[]; // A 偏旺之行恰是 B 的喜用
  bSuppliesA: Element[];
  summary: string;
}

export function elementComplement(a: BaziResult, b: BaziResult): ElementComplement {
  const aStrongest = Object.entries(a.strength.weighted).sort((x, y) => y[1] - x[1])[0][0] as Element;
  const bStrongest = Object.entries(b.strength.weighted).sort((x, y) => y[1] - x[1])[0][0] as Element;

  const aSuppliesB = b.strength.favorable.includes(aStrongest) ? [aStrongest] : [];
  const bSuppliesA = a.strength.favorable.includes(bStrongest) ? [bStrongest] : [];

  const parts: string[] = [];
  if (aSuppliesB.length) parts.push(`甲方偏旺的「${aStrongest}」正是乙方所喜用，甲方的性格特质对乙方有正面助益`);
  if (bSuppliesA.length) parts.push(`乙方偏旺的「${bStrongest}」正是甲方所喜用，乙方的性格特质对甲方有正面助益`);
  const summary = parts.length ? parts.join("；") + "。" : "两人五行旺弱之间暂无直接互补关系，属中性搭配。";

  return { aSuppliesB, bSuppliesA, summary };
}

export interface GuaMatch {
  sameGroup: boolean;
  summary: string;
}

export function guaGroupMatch(guaA: GuaInfo, guaB: GuaInfo): GuaMatch {
  const sameGroup = guaA.group === guaB.group;
  return {
    sameGroup,
    summary: sameGroup
      ? `双方命卦同属${guaA.group}，居家风水偏好较为一致，选房装修容易达成共识。`
      : `甲方为${guaA.group}、乙方为${guaB.group}，居家风水偏好不同，选房装修时可分区兼顾双方吉方。`,
  };
}

export interface CompatibilityReport {
  dayGan: DayGanRelation;
  dayZhi: ZhiRelationResult;
  zodiac: ZodiacRelationResult;
  element: ElementComplement;
  gua: GuaMatch;
  /** 0-100 的简化综合评分，仅供参考排序，非精确算命结论 */
  score: number;
  summary: string;
}

export function computeCompatibility(a: BaziResult, guaA: GuaInfo, b: BaziResult, guaB: GuaInfo): CompatibilityReport {
  const dayGan = dayGanRelation(a.dayMaster.gan, b.dayMaster.gan);
  const dayZhi = dayZhiRelation(a.pillars[2].zhi, b.pillars[2].zhi);
  const zodiac = zodiacRelation(a.pillars[0].zhi, b.pillars[0].zhi);
  const element = elementComplement(a, b);
  const gua = guaGroupMatch(guaA, guaB);

  let score = 60;
  if (dayGan.hasHe) score += 10;
  if (dayZhi.relations.some((r) => r.kind === "六合")) score += 10;
  if (dayZhi.sanHe) score += 8;
  if (dayZhi.relations.some((r) => r.kind === "相冲")) score -= 10;
  if (dayZhi.relations.some((r) => r.kind === "相刑" || r.kind === "自刑")) score -= 6;
  if (dayZhi.relations.some((r) => r.kind === "相害")) score -= 5;
  if (zodiac.relations.some((r) => r.kind === "六合") || zodiac.sanHe) score += 8;
  if (zodiac.relations.some((r) => r.kind === "相冲")) score -= 8;
  if (element.aSuppliesB.length) score += 5;
  if (element.bSuppliesA.length) score += 5;
  if (gua.sameGroup) score += 4;
  score = Math.max(5, Math.min(95, score));

  const summary =
    score >= 80
      ? "整体配合度较高，性情与五行都有相互扶持之处，是较为和谐的一对。"
      : score >= 60
        ? "整体配合度中等偏上，存在一些需要磨合之处，但基础较为稳固。"
        : score >= 40
          ? "整体配合度中等，双方差异较明显，需要更多沟通与包容。"
          : "整体配合度偏低，日柱与生肖均有相冲相刑之象，建议多花时间彼此了解、避免仓促决定。";

  return { dayGan, dayZhi, zodiac, element, gua, score, summary };
}
