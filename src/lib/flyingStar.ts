/** 玄空飞星风水（下卦法，不含替卦）：由住宅坐山与建成/入住年份的三元九运，
 * 排出运盘、山盘、向盘三张九宫飞星图。采用沈氏玄空学通行的二十四山
 * 阴阳表与飞泊顺序，仅供文化参考，替卦、兼向等高阶情形暂未涵盖。 */

export type Palace = "坎" | "坤" | "震" | "巽" | "中" | "乾" | "兑" | "艮" | "离";

/** 24 山，按顺时针罗盘顺序排列（从正北壬开始）。 */
export const MOUNTAINS_24 = [
  "壬", "子", "癸", "丑", "艮", "寅", "甲", "卯", "乙", "辰", "巽", "巳",
  "丙", "午", "丁", "未", "坤", "申", "庚", "酉", "辛", "戌", "乾", "亥",
] as const;
export type Mountain = (typeof MOUNTAINS_24)[number];

/** 每山所属宫位（八宫，每宫 3 山）。 */
const MOUNTAIN_PALACE: Record<Mountain, Palace> = {
  壬: "坎", 子: "坎", 癸: "坎",
  丑: "艮", 艮: "艮", 寅: "艮",
  甲: "震", 卯: "震", 乙: "震",
  辰: "巽", 巽: "巽", 巳: "巽",
  丙: "离", 午: "离", 丁: "离",
  未: "坤", 坤: "坤", 申: "坤",
  庚: "兑", 酉: "兑", 辛: "兑",
  戌: "乾", 乾: "乾", 亥: "乾",
};

/** 二十四山阴阳（沈氏玄空学通行表，阳山顺飞、阴山逆飞）。 */
const MOUNTAIN_YANG: Record<Mountain, boolean> = {
  壬: true, 子: false, 癸: false,
  丑: false, 艮: true, 寅: true,
  甲: true, 卯: false, 乙: false,
  辰: false, 巽: true, 巳: true,
  丙: true, 午: false, 丁: false,
  未: false, 坤: true, 申: true,
  庚: true, 酉: false, 辛: false,
  戌: false, 乾: true, 亥: true,
};

/** 对宫（正对面的山，即「向」）。 */
export function oppositeMountain(m: Mountain): Mountain {
  const i = MOUNTAINS_24.indexOf(m);
  return MOUNTAINS_24[(i + 12) % 24];
}

/** 九宫飞泊固定顺序：从中宫起，依洛书数字 5→6→7→8→9→1→2→3→4 对应的空间路径。 */
const FLY_SEQUENCE: Palace[] = ["中", "乾", "兑", "艮", "离", "坎", "坤", "震", "巽"];

function normalize9(n: number): number {
  let x = n % 9;
  if (x <= 0) x += 9;
  return x;
}

/** 以 startNumber 入中，按 forward 顺/逆飞，得到 8 宫（不含中宫，中宫已知为 startNumber）+ 中宫 的完整 9 宫数字。 */
function flyFromCenter(startNumber: number, forward: boolean): Record<Palace, number> {
  const result = {} as Record<Palace, number>;
  FLY_SEQUENCE.forEach((palace, i) => {
    const n = forward ? startNumber + i : startNumber - i;
    result[palace] = normalize9(n);
  });
  return result;
}

/** 三元九运：1864 年立春起，每运 20 年，1-9 循环。 */
export function getPeriod(year: number): number {
  const epoch = 1864;
  const yearsSinceEpoch = year - epoch;
  const periodIndex = Math.floor(yearsSinceEpoch / 20) % 9;
  return normalize9(periodIndex + 1);
}

export function getPeriodLabel(period: number): string {
  const yuan = period <= 3 ? "上元" : period <= 6 ? "中元" : "下元";
  const cn = ["一", "二", "三", "四", "五", "六", "七", "八", "九"][period - 1];
  return `${yuan}${cn}运`;
}

export interface PalaceStars {
  palace: Palace;
  direction: string; // 中文方位名（中宫无方位）
  yunStar: number;
  shanStar: number;
  xiangStar: number;
}

export interface FlyingStarChart {
  period: number;
  periodLabel: string;
  sitting: Mountain; // 坐山
  facing: Mountain; // 向（坐山对宫）
  palaces: PalaceStars[];
  /** 旺山旺向：向星当运（等于运数）落于向宫，山星当运落于坐宫 */
  isWangShanWangXiang: boolean;
  /** 上山下水：山星落向宫、向星落坐宫（当运数），传统认为不利 */
  isShangShanXiaShui: boolean;
}

const PALACE_DIRECTION: Record<Palace, string> = {
  坎: "北", 坤: "西南", 震: "东", 巽: "东南", 中: "", 乾: "西北", 兑: "西", 艮: "东北", 离: "南",
};

export function computeFlyingStar(sitting: Mountain, year: number): FlyingStarChart {
  const period = getPeriod(year);
  const yunPlate = flyFromCenter(period, true);

  const sittingPalace = MOUNTAIN_PALACE[sitting];
  const facing = oppositeMountain(sitting);
  const facingPalace = MOUNTAIN_PALACE[facing];

  const shanStart = yunPlate[sittingPalace];
  const xiangStart = yunPlate[facingPalace];

  const shanPlate = flyFromCenter(shanStart, MOUNTAIN_YANG[sitting]);
  const xiangPlate = flyFromCenter(xiangStart, MOUNTAIN_YANG[facing]);

  const palaces: PalaceStars[] = FLY_SEQUENCE.map((palace) => ({
    palace,
    direction: PALACE_DIRECTION[palace],
    yunStar: yunPlate[palace],
    shanStar: shanPlate[palace],
    xiangStar: xiangPlate[palace],
  }));

  const atSitting = palaces.find((p) => p.palace === sittingPalace)!;
  const atFacing = palaces.find((p) => p.palace === facingPalace)!;

  const isWangShanWangXiang = atSitting.shanStar === period && atFacing.xiangStar === period;
  const isShangShanXiaShui = atFacing.shanStar === period && atSitting.xiangStar === period;

  return {
    period,
    periodLabel: getPeriodLabel(period),
    sitting,
    facing,
    palaces,
    isWangShanWangXiang,
    isShangShanXiaShui,
  };
}
