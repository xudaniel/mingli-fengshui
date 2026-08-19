/** 犯太岁：本命年支与流年支的值/冲/刑/害/破关系检测。 */

const ZHI = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];

const CHONG: Record<string, string> = {
  子: "午", 午: "子", 丑: "未", 未: "丑", 寅: "申", 申: "寅",
  卯: "酉", 酉: "卯", 辰: "戌", 戌: "辰", 巳: "亥", 亥: "巳",
};

/** 六害 */
const HAI: Record<string, string> = {
  子: "未", 未: "子", 丑: "午", 午: "丑", 寅: "巳", 巳: "寅",
  卯: "辰", 辰: "卯", 申: "亥", 亥: "申", 酉: "戌", 戌: "酉",
};

/** 六破 */
const PO: Record<string, string> = {
  子: "酉", 酉: "子", 午: "卯", 卯: "午", 辰: "丑", 丑: "辰",
  戌: "未", 未: "戌", 寅: "亥", 亥: "寅", 申: "巳", 巳: "申",
};

/** 两两相刑（含三刑组内的两两关系），不含六冲重叠的丑未/寅巳等自成一类 */
const XING: Record<string, string[]> = {
  寅: ["巳"], 巳: ["寅", "申"], 申: ["巳"],
  丑: ["戌"], 戌: ["未"], 未: ["丑"],
  子: ["卯"], 卯: ["子"],
};

export type TaiSuiKind = "值太岁" | "冲太岁" | "刑太岁" | "害太岁" | "破太岁";

export interface TaiSuiHit {
  year: number;
  liuNianZhi: string;
  kind: TaiSuiKind;
  meaning: string;
}

const MEANING: Record<TaiSuiKind, string> = {
  值太岁: "本命年，太岁当值，运势起伏较大，宜稳健行事、避免冒进决策",
  冲太岁: "流年支与本命年支相冲，变动较大，宜谨慎处理搬迁、变动之事",
  刑太岁: "流年支与本命年支相刑，易有纠纷磨合，宜多忍让、避免争执",
  害太岁: "流年支与本命年支相害，人际易生暗中妨害，宜谨慎交往、防小人",
  破太岁: "流年支与本命年支相破，计划易生变数，宜留有余地、不宜强求",
};

/** 检测未来 n 年（含当年）内的犯太岁情况，yearZhi 为本命年支。 */
export function detectTaiSui(birthYearZhi: string, startYear: number, years = 12): TaiSuiHit[] {
  const startIdx = ZHI.indexOf(birthYearZhi);
  const hits: TaiSuiHit[] = [];
  for (let i = 0; i < years; i++) {
    const year = startYear + i;
    // 生肖循环 12 年一轮，流年支按年份对齐（以已知锚点 2020=庚子 子年）
    const zhiIdx = (((year - 2020) % 12) + 12) % 12; // 2020 -> 子(index 0)
    const liuNianZhi = ZHI[zhiIdx];

    if (startIdx < 0) continue;
    if (liuNianZhi === birthYearZhi) {
      hits.push({ year, liuNianZhi, kind: "值太岁", meaning: MEANING.值太岁 });
      continue; // 值太岁优先，同年不重复标注其他类型
    }
    if (CHONG[birthYearZhi] === liuNianZhi) {
      hits.push({ year, liuNianZhi, kind: "冲太岁", meaning: MEANING.冲太岁 });
      continue;
    }
    if (XING[birthYearZhi]?.includes(liuNianZhi)) {
      hits.push({ year, liuNianZhi, kind: "刑太岁", meaning: MEANING.刑太岁 });
      continue;
    }
    if (HAI[birthYearZhi] === liuNianZhi) {
      hits.push({ year, liuNianZhi, kind: "害太岁", meaning: MEANING.害太岁 });
      continue;
    }
    if (PO[birthYearZhi] === liuNianZhi) {
      hits.push({ year, liuNianZhi, kind: "破太岁", meaning: MEANING.破太岁 });
    }
  }
  return hits;
}
