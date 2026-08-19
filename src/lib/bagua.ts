/** 八宅派命卦：由出生年（以立春为界）与性别推得本命卦，
 * 进而得出四吉方与四凶方。这是风水中直接依赖出生信息的经典体系。 */

import type { Element } from "./analysis";

export type Direction = "北" | "东北" | "东" | "东南" | "南" | "西南" | "西" | "西北";

export const DIRECTIONS: Direction[] = ["北", "东北", "东", "东南", "南", "西南", "西", "西北"];

export interface GuaStar {
  name: string;
  direction: Direction;
  auspicious: boolean;
  meaning: string;
}

export interface GuaInfo {
  number: number;
  name: string;
  element: Element;
  group: "东四命" | "西四命";
  stars: GuaStar[];
}

interface GuaDef {
  name: string;
  element: Element;
  group: "东四命" | "西四命";
  /** 生气 天医 延年 伏位 祸害 五鬼 六煞 绝命 的方位，按此顺序 */
  dirs: [Direction, Direction, Direction, Direction, Direction, Direction, Direction, Direction];
}

const STAR_META: { name: string; auspicious: boolean; meaning: string }[] = [
  { name: "生气", auspicious: true, meaning: "最吉，主活力、事业与发展，宜作大门、办公位" },
  { name: "天医", auspicious: true, meaning: "次吉，主健康、贵人，宜作卧室、厨房" },
  { name: "延年", auspicious: true, meaning: "中吉，主和谐、感情与寿元，宜作卧室、餐厅" },
  { name: "伏位", auspicious: true, meaning: "小吉，主平稳、文昌，宜作书房、静修处" },
  { name: "祸害", auspicious: false, meaning: "小凶，主是非口舌，宜作储物、卫浴等次要空间" },
  { name: "五鬼", auspicious: false, meaning: "大凶，主破财是非，宜作厨房（火压之）或杂物间" },
  { name: "六煞", auspicious: false, meaning: "次凶，主纠纷桃花，宜作卫浴、走道" },
  { name: "绝命", auspicious: false, meaning: "至凶，主健康受损，最忌作卧室、大门" },
];

const GUA_TABLE: Record<number, GuaDef> = {
  1: { name: "坎", element: "水", group: "东四命", dirs: ["东南", "东", "南", "北", "西", "东北", "西北", "西南"] },
  2: { name: "坤", element: "土", group: "西四命", dirs: ["东北", "西", "西北", "西南", "东", "东南", "南", "北"] },
  3: { name: "震", element: "木", group: "东四命", dirs: ["南", "北", "东南", "东", "西南", "西北", "东北", "西"] },
  4: { name: "巽", element: "木", group: "东四命", dirs: ["北", "南", "东", "东南", "西北", "西南", "西", "东北"] },
  6: { name: "乾", element: "金", group: "西四命", dirs: ["西", "东北", "西南", "西北", "东南", "东", "北", "南"] },
  7: { name: "兑", element: "金", group: "西四命", dirs: ["西北", "西南", "东北", "西", "北", "南", "东南", "东"] },
  8: { name: "艮", element: "土", group: "西四命", dirs: ["西南", "西北", "西", "东北", "南", "北", "东", "东南"] },
  9: { name: "离", element: "火", group: "东四命", dirs: ["东", "东南", "北", "南", "东北", "西", "西南", "西北"] },
};

function digitSum(n: number): number {
  let s = n;
  while (s > 9) {
    s = String(s)
      .split("")
      .reduce((acc, d) => acc + Number(d), 0);
  }
  return s;
}

/**
 * 计算本命卦。year 须为以立春为界修正后的年份。
 * 通用公式：年份数字根 s；男命 11−s，女命 4+s，再取数字根；
 * 得 5 者男归坤（2）、女归艮（8）。
 */
/** 由卦数（1/2/3/4/6/7/8/9）构建完整的卦信息，供命卦与宅卦共用。 */
export function buildGuaInfo(guaNumber: number): GuaInfo {
  const def = GUA_TABLE[guaNumber];
  const stars: GuaStar[] = STAR_META.map((m, i) => ({
    name: m.name,
    direction: def.dirs[i],
    auspicious: m.auspicious,
    meaning: m.meaning,
  }));
  return { number: guaNumber, name: def.name, element: def.element, group: def.group, stars };
}

export function computeGua(year: number, gender: "male" | "female"): GuaInfo {
  const s = digitSum(year);
  let g = gender === "male" ? 11 - s : 4 + s;
  g = digitSum(g);
  if (g === 5) g = gender === "male" ? 2 : 8;
  return buildGuaInfo(g);
}
