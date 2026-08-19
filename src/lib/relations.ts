/** 四柱地支之间的合冲刑害关系检测。
 * 仅做盘面展示，不改动五行计分（合化并入计分留待后续）。 */

import type { Element } from "./analysis";

export type RelationKind = "六合" | "三合" | "半合" | "三会" | "相冲" | "相刑" | "自刑" | "相害";

export interface Relation {
  kind: RelationKind;
  /** 参与的柱下标（0 年 1 月 2 日 3 时），升序 */
  pillars: number[];
  /** 参与的地支（与 pillars 对应） */
  branches: string[];
  /** 合化/会成之五行（仅合会类） */
  element?: Element;
  meaning: string;
}

const PILLAR_NAMES = ["年", "月", "日", "时"];

/** 六合及其合化五行 */
const LIU_HE: [string, string, Element][] = [
  ["子", "丑", "土"],
  ["寅", "亥", "木"],
  ["卯", "戌", "火"],
  ["辰", "酉", "金"],
  ["巳", "申", "水"],
  ["午", "未", "土"],
];

/** 三合局：[长生, 帝旺, 墓库] → 化气 */
export const SAN_HE: [string, string, string, Element][] = [
  ["申", "子", "辰", "水"],
  ["寅", "午", "戌", "火"],
  ["亥", "卯", "未", "木"],
  ["巳", "酉", "丑", "金"],
];

/** 三会方：→ 会成之气 */
const SAN_HUI: [string, string, string, Element][] = [
  ["寅", "卯", "辰", "木"],
  ["巳", "午", "未", "火"],
  ["申", "酉", "戌", "金"],
  ["亥", "子", "丑", "水"],
];

/** 六冲 */
const LIU_CHONG: [string, string][] = [
  ["子", "午"],
  ["丑", "未"],
  ["寅", "申"],
  ["卯", "酉"],
  ["辰", "戌"],
  ["巳", "亥"],
];

/** 六害 */
const LIU_HAI: [string, string][] = [
  ["子", "未"],
  ["丑", "午"],
  ["寅", "巳"],
  ["卯", "辰"],
  ["申", "亥"],
  ["酉", "戌"],
];

/** 两两相刑（寅申、丑未归入冲，不重复报刑） */
const XING_PAIRS: [string, string][] = [
  ["寅", "巳"],
  ["巳", "申"],
  ["丑", "戌"],
  ["戌", "未"],
  ["子", "卯"],
];

/** 三刑组 */
const XING_TRIOS: [string, string, string, string][] = [
  ["寅", "巳", "申", "无恩之刑"],
  ["丑", "戌", "未", "恃势之刑"],
];

const ZI_XING = ["辰", "午", "酉", "亥"];

function pillarLabel(indices: number[]): string {
  return indices.map((i) => PILLAR_NAMES[i]).join("");
}

/** branches: 四柱地支，按 年月日时 顺序 */
export function detectRelations(branches: string[]): Relation[] {
  const rels: Relation[] = [];
  const idxOf = (zhi: string): number[] =>
    branches.map((b, i) => (b === zhi ? i : -1)).filter((i) => i >= 0);

  // 三会（优先级最高的会合类）
  for (const [a, b, c, el] of SAN_HUI) {
    const ia = idxOf(a);
    const ib = idxOf(b);
    const ic = idxOf(c);
    if (ia.length && ib.length && ic.length) {
      const ps = [ia[0], ib[0], ic[0]].sort((x, y) => x - y);
      rels.push({
        kind: "三会",
        pillars: ps,
        branches: ps.map((i) => branches[i]),
        element: el,
        meaning: `${pillarLabel(ps)}支${a}${b}${c}三会${el}方，${el}气汇聚一方，力量集中`,
      });
    }
  }

  // 三合与半合
  for (const [a, b, c, el] of SAN_HE) {
    const ia = idxOf(a);
    const ib = idxOf(b); // b 为帝旺中神
    const ic = idxOf(c);
    if (ia.length && ib.length && ic.length) {
      const ps = [ia[0], ib[0], ic[0]].sort((x, y) => x - y);
      rels.push({
        kind: "三合",
        pillars: ps,
        branches: ps.map((i) => branches[i]),
        element: el,
        meaning: `${pillarLabel(ps)}支${a}${b}${c}三合${el}局，气势专一，${el}的作用显著增强`,
      });
    } else if (ib.length) {
      // 半合须含帝旺中神
      for (const [other, pairName] of [
        [a, `${a}${b}`],
        [c, `${b}${c}`],
      ] as [string, string][]) {
        const io = idxOf(other);
        if (io.length) {
          const ps = [ib[0], io[0]].sort((x, y) => x - y);
          rels.push({
            kind: "半合",
            pillars: ps,
            branches: ps.map((i) => branches[i]),
            element: el,
            meaning: `${pillarLabel(ps)}支${pairName}半合${el}，有向${el}凝聚之势`,
          });
        }
      }
    }
  }

  // 两两关系：遍历所有柱位对
  const pairKinds: { table: [string, string][]; kind: RelationKind; describe: (a: string, b: string) => string; element?: (a: string, b: string) => Element | undefined }[] = [
    {
      table: LIU_HE.map(([a, b]) => [a, b] as [string, string]),
      kind: "六合",
      describe: (a, b) => `${a}${b}六合，主亲和融洽、关系紧密`,
      element: (a, b) => LIU_HE.find(([x, y]) => (x === a && y === b) || (x === b && y === a))?.[2],
    },
    {
      table: LIU_CHONG,
      kind: "相冲",
      describe: (a, b) => `${a}${b}相冲，主动荡变化、对立不安`,
    },
    {
      table: LIU_HAI,
      kind: "相害",
      describe: (a, b) => `${a}${b}相害，主暗中妨害、人事不睦`,
    },
    {
      table: XING_PAIRS,
      kind: "相刑",
      describe: (a, b) => (a === "子" || b === "子" ? `${a}${b}相刑（无礼之刑），主礼数纠纷` : `${a}${b}相刑，主刑克磨砺、纠缠反复`),
    },
  ];

  for (let i = 0; i < branches.length; i++) {
    for (let j = i + 1; j < branches.length; j++) {
      const a = branches[i];
      const b = branches[j];
      for (const { table, kind, describe, element } of pairKinds) {
        if (table.some(([x, y]) => (x === a && y === b) || (x === b && y === a))) {
          rels.push({
            kind,
            pillars: [i, j],
            branches: [a, b],
            element: element?.(a, b),
            meaning: `${pillarLabel([i, j])}支${describe(a, b)}`,
          });
        }
      }
      // 自刑
      if (a === b && ZI_XING.includes(a)) {
        rels.push({
          kind: "自刑",
          pillars: [i, j],
          branches: [a, b],
          meaning: `${pillarLabel([i, j])}支${a}${a}自刑，主自我纠结、内耗`,
        });
      }
    }
  }

  // 三刑成势（全三字到位时补充说明）
  for (const [a, b, c, name] of XING_TRIOS) {
    if (idxOf(a).length && idxOf(b).length && idxOf(c).length) {
      const ps = [idxOf(a)[0], idxOf(b)[0], idxOf(c)[0]].sort((x, y) => x - y);
      rels.push({
        kind: "相刑",
        pillars: ps,
        branches: ps.map((i) => branches[i]),
        meaning: `${pillarLabel(ps)}支${a}${b}${c}三刑俱全（${name}），刑象明显，行事宜留余地`,
      });
    }
  }

  return rels;
}

/** 每柱参与的关系种类徽标（如 合/冲/刑/害/会） */
export function pillarBadges(relations: Relation[]): string[][] {
  const badges: Set<string>[] = [new Set(), new Set(), new Set(), new Set()];
  const short: Record<RelationKind, string> = {
    六合: "合",
    三合: "合",
    半合: "合",
    三会: "会",
    相冲: "冲",
    相刑: "刑",
    自刑: "刑",
    相害: "害",
  };
  for (const r of relations) {
    for (const p of r.pillars) badges[p].add(short[r.kind]);
  }
  return badges.map((s) => [...s]);
}

export interface PairwiseRelation {
  kind: "六合" | "相冲" | "相刑" | "自刑" | "相害";
  element?: Element;
}

/** 两个孤立地支之间的两两关系（六合/冲/刑/害，不含需要三支的三合/三会）。
 * 供合婚等需要单独比较两个地支的场景复用。 */
export function pairwiseZhiRelation(a: string, b: string): PairwiseRelation[] {
  const hits: PairwiseRelation[] = [];
  const he = LIU_HE.find(([x, y]) => (x === a && y === b) || (x === b && y === a));
  if (he) hits.push({ kind: "六合", element: he[2] });
  if (LIU_CHONG.some(([x, y]) => (x === a && y === b) || (x === b && y === a))) hits.push({ kind: "相冲" });
  if (LIU_HAI.some(([x, y]) => (x === a && y === b) || (x === b && y === a))) hits.push({ kind: "相害" });
  if (XING_PAIRS.some(([x, y]) => (x === a && y === b) || (x === b && y === a))) hits.push({ kind: "相刑" });
  if (a === b && ZI_XING.includes(a)) hits.push({ kind: "自刑" });
  return hits;
}
