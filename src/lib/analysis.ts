export type Element = "木" | "火" | "土" | "金" | "水";
export const ELEMENTS: Element[] = ["木", "火", "土", "金", "水"];

/** 天干 → 五行 */
export function ganElement(gan: string): Element {
  if ("甲乙".includes(gan)) return "木";
  if ("丙丁".includes(gan)) return "火";
  if ("戊己".includes(gan)) return "土";
  if ("庚辛".includes(gan)) return "金";
  return "水"; // 壬癸
}

/** 地支 → 本气五行 */
export function zhiElement(zhi: string): Element {
  if ("寅卯".includes(zhi)) return "木";
  if ("巳午".includes(zhi)) return "火";
  if ("辰戌丑未".includes(zhi)) return "土";
  if ("申酉".includes(zhi)) return "金";
  return "水"; // 子亥
}

/** 相生: 木→火→土→金→水→木 */
const SHENG_NEXT: Record<Element, Element> = { 木: "火", 火: "土", 土: "金", 金: "水", 水: "木" };
const SHENG_PREV: Record<Element, Element> = { 火: "木", 土: "火", 金: "土", 水: "金", 木: "水" };
/** 相克: 木克土 土克水 水克火 火克金 金克木 */
const KE_NEXT: Record<Element, Element> = { 木: "土", 土: "水", 水: "火", 火: "金", 金: "木" };
const KE_PREV: Record<Element, Element> = { 土: "木", 水: "土", 火: "水", 金: "火", 木: "金" };

export const shengOf = (e: Element) => SHENG_NEXT[e]; // 我生（食伤）
export const shengBy = (e: Element) => SHENG_PREV[e]; // 生我（印星）
export const keOf = (e: Element) => KE_NEXT[e]; // 我克（财星）
export const keBy = (e: Element) => KE_PREV[e]; // 克我（官杀）

export interface PillarInput {
  gan: string;
  zhi: string;
  hideGan: string[]; // 藏干，本气在前
  isMonth: boolean;
}

export type StrengthVerdict = "身强" | "身弱" | "中和";

export interface StrengthAnalysis {
  /** 加权五行力量，含藏干与月令加成，归一化为百分比（合计 100） */
  weighted: Record<Element, number>;
  /** 同党（印+比劫）占比，0–100 */
  supportPct: number;
  verdict: StrengthVerdict;
  /** 喜用五行 */
  favorable: Element[];
  /** 忌讳五行 */
  unfavorable: Element[];
  /** 判断过程的中文说明 */
  reasoning: string;
}

/** 藏干在一支 100 分中的权重分配（按藏干个数，本气在前） */
const HIDE_WEIGHTS: Record<number, number[]> = {
  1: [100],
  2: [70, 30],
  3: [60, 30, 10],
};

/** 月令（月支）对力量的加成倍数 —— 得令者旺 */
const MONTH_MULTIPLIER = 1.5;

/**
 * 加权五行强弱分析（简化版子平法）：
 * 天干各计 100 分；地支按藏干本气/中气/余气拆分 100 分；月支整体乘以
 * 1.5 倍以体现「月令司权」。同党 = 与日主同行（比劫）+ 生日主（印星），
 * 占比 ≥55% 判身强，≤45% 判身弱，其余中和。
 * 身弱喜印比，身强喜食伤/财/官杀，中和取最弱者补之。
 */
export function analyzeStrength(
  pillars: PillarInput[],
  dayMaster: Element,
): StrengthAnalysis {
  const raw: Record<Element, number> = { 木: 0, 火: 0, 土: 0, 金: 0, 水: 0 };

  for (const p of pillars) {
    const mult = p.isMonth ? MONTH_MULTIPLIER : 1;
    raw[ganElement(p.gan)] += 100 * mult;
    const weights = HIDE_WEIGHTS[p.hideGan.length] ?? [100];
    p.hideGan.forEach((hg, i) => {
      raw[ganElement(hg)] += (weights[i] ?? 0) * mult;
    });
  }

  const total = ELEMENTS.reduce((s, e) => s + raw[e], 0);
  const weighted: Record<Element, number> = { 木: 0, 火: 0, 土: 0, 金: 0, 水: 0 };
  for (const e of ELEMENTS) weighted[e] = (raw[e] / total) * 100;

  const supportPct = weighted[dayMaster] + weighted[shengBy(dayMaster)];

  let verdict: StrengthVerdict;
  if (supportPct >= 55) verdict = "身强";
  else if (supportPct <= 45) verdict = "身弱";
  else verdict = "中和";

  let favorable: Element[];
  let unfavorable: Element[];
  let reasoning: string;

  if (verdict === "身弱") {
    favorable = [shengBy(dayMaster), dayMaster];
    unfavorable = [keBy(dayMaster), shengOf(dayMaster)];
    reasoning =
      `日主${dayMaster}的同党（比劫 + 印星）力量约占 ${supportPct.toFixed(0)}%，不足半数，判为身弱。` +
      `宜以生扶为主：喜${shengBy(dayMaster)}（印星生身）与${dayMaster}（比劫帮身），` +
      `忌${keBy(dayMaster)}（官杀克身）与${shengOf(dayMaster)}（食伤泄身）。`;
  } else if (verdict === "身强") {
    favorable = [shengOf(dayMaster), keOf(dayMaster), keBy(dayMaster)];
    unfavorable = [shengBy(dayMaster), dayMaster];
    reasoning =
      `日主${dayMaster}的同党（比劫 + 印星）力量约占 ${supportPct.toFixed(0)}%，过半而旺，判为身强。` +
      `宜以克泄耗为用：喜${shengOf(dayMaster)}（食伤泄秀）、${keOf(dayMaster)}（财星耗身）与${keBy(dayMaster)}（官杀制身），` +
      `忌${shengBy(dayMaster)}（印星）再生扶、${dayMaster}（比劫）再帮身。`;
  } else {
    const sorted = [...ELEMENTS].sort((a, b) => weighted[a] - weighted[b]);
    favorable = [sorted[0]];
    if (weighted[sorted[1]] < 15) favorable.push(sorted[1]);
    unfavorable = [sorted[4]];
    reasoning =
      `日主${dayMaster}的同党力量约占 ${supportPct.toFixed(0)}%，接近半数，判为中和。` +
      `五行以流通均衡为贵，可适度补最弱的${favorable.join("、")}，避免再加强已偏旺的${sorted[4]}。`;
  }

  return { weighted, supportPct, verdict, favorable, unfavorable, reasoning };
}
