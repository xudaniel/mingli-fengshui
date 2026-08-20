/** 神煞：天乙贵人、驿马、文昌、华盖、将星、羊刃、禄神。
 * 桃花另见 peachblossom.ts（本模块在展示层与其合并为「神煞」总卡片）。
 * 均为传统命理的静态查表法，仅供文化参考。 */

export interface ShenShaHit {
  name: string;
  auspicious: boolean;
  meaning: string;
  /** 命中的柱下标（0 年 1 月 2 日 3 时） */
  pillars: number[];
}

const TIAN_YI_GUI_REN: Record<string, string[]> = {
  甲: ["丑", "未"], 戊: ["丑", "未"], 庚: ["丑", "未"],
  乙: ["子", "申"], 己: ["子", "申"],
  丙: ["亥", "酉"], 丁: ["亥", "酉"],
  壬: ["巳", "卯"], 癸: ["巳", "卯"],
  辛: ["寅", "午"],
};

const WEN_CHANG: Record<string, string> = {
  甲: "巳", 乙: "午", 丙: "申", 丁: "酉", 戊: "申",
  己: "酉", 庚: "亥", 辛: "子", 壬: "寅", 癸: "卯",
};

/** 阳干羊刃（阴干传统上不取羊刃，此处从略） */
const YANG_REN: Record<string, string> = {
  甲: "卯", 丙: "午", 戊: "午", 庚: "酉", 壬: "子",
};

const LU_SHEN: Record<string, string> = {
  甲: "寅", 乙: "卯", 丙: "巳", 丁: "午", 戊: "巳",
  己: "午", 庚: "申", 辛: "酉", 壬: "亥", 癸: "子",
};

/** 三合局：[组成员...], 驿马位, 将星位（帝旺）, 华盖位（墓库） */
const SAN_HE_STARS: [string[], string, string, string][] = [
  [["申", "子", "辰"], "寅", "子", "辰"],
  [["寅", "午", "戌"], "申", "午", "戌"],
  [["巳", "酉", "丑"], "亥", "酉", "丑"],
  [["亥", "卯", "未"], "巳", "卯", "未"],
];

function findPillars(branches: string[], zhi: string): number[] {
  return branches.map((b, i) => (b === zhi ? i : -1)).filter((i) => i >= 0);
}

function branchGroupLookup(baseZhi: string, pick: 1 | 2 | 3): string | null {
  for (const group of SAN_HE_STARS) {
    if (group[0].includes(baseZhi)) return group[pick];
  }
  return null;
}

/** dayGan：日干；yearZhi/dayZhi：年支/日支（驿马、将星、华盖的查法基准）；
 * branches：四柱地支（年月日时）。 */
export function detectShenSha(dayGan: string, yearZhi: string, dayZhi: string, branches: string[]): ShenShaHit[] {
  const hits: ShenShaHit[] = [];

  const guiRenZhis = TIAN_YI_GUI_REN[dayGan] ?? [];
  const guiRenPillars = guiRenZhis.flatMap((z) => findPillars(branches, z));
  if (guiRenPillars.length) {
    hits.push({
      name: "天乙贵人",
      auspicious: true,
      meaning: "命中贵人星，遇事多有他人相助、逢凶化吉",
      pillars: [...new Set(guiRenPillars)].sort((a, b) => a - b),
    });
  }

  const wenChangZhi = WEN_CHANG[dayGan];
  if (wenChangZhi) {
    const pillars = findPillars(branches, wenChangZhi);
    if (pillars.length) {
      hits.push({ name: "文昌", auspicious: true, meaning: "利读书考试、才思敏捷，宜文职学术方向", pillars });
    }
  }

  const luShenZhi = LU_SHEN[dayGan];
  if (luShenZhi) {
    const pillars = findPillars(branches, luShenZhi);
    if (pillars.length) {
      hits.push({ name: "禄神", auspicious: true, meaning: "主衣食丰足、财禄稳健，利本职收入", pillars });
    }
  }

  const yangRenZhi = YANG_REN[dayGan];
  if (yangRenZhi) {
    const pillars = findPillars(branches, yangRenZhi);
    if (pillars.length) {
      hits.push({ name: "羊刃", auspicious: false, meaning: "性格刚烈果断，行事易过刚，宜留意冲动与人际冲突", pillars });
    }
  }

  const seen = new Set<string>();
  for (const baseZhi of [yearZhi, dayZhi]) {
    const yiMa = branchGroupLookup(baseZhi, 1);
    if (yiMa && !seen.has(`驿马${yiMa}`)) {
      const pillars = findPillars(branches, yiMa);
      if (pillars.length) {
        hits.push({ name: "驿马", auspicious: true, meaning: "主奔波变动、外出发展，利出差、搬迁、异地机遇", pillars });
        seen.add(`驿马${yiMa}`);
      }
    }
    const jiangXing = branchGroupLookup(baseZhi, 2);
    if (jiangXing && !seen.has(`将星${jiangXing}`)) {
      const pillars = findPillars(branches, jiangXing);
      if (pillars.length) {
        hits.push({ name: "将星", auspicious: true, meaning: "主领导才能、掌权任事，利管理与统筹角色", pillars });
        seen.add(`将星${jiangXing}`);
      }
    }
    const huaGai = branchGroupLookup(baseZhi, 3);
    if (huaGai && !seen.has(`华盖${huaGai}`)) {
      const pillars = findPillars(branches, huaGai);
      if (pillars.length) {
        hits.push({ name: "华盖", auspicious: true, meaning: "主聪慧有艺术/宗教缘分，但性喜清静，人缘稍显孤高", pillars });
        seen.add(`华盖${huaGai}`);
      }
    }
  }

  return hits;
}
