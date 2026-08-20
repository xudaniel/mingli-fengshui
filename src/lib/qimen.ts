/** 奇门遁甲（时家奇门·地盘简化版）：排出局数、阴阳遁与九宫地盘的
 * 三奇六仪本位、八门本位、九星本位。
 *
 * ⚠️ 范围说明：完整时家奇门还需按值符值使转盘排出动态的天盘/人盘/神盘，
 * 这一步骤流派差异大、规则链条长，本实现暂不涵盖，仅排出地盘（基础盘）。
 * 局数选取（超神接气/置闰）也采用简化推算，未完全实现传统置闰规则，
 * 仅供结构参考，请勿作为实际择时决策的唯一依据。 */

import { Solar } from "lunar-javascript";

export type Palace = "坎" | "坤" | "震" | "巽" | "中" | "乾" | "兑" | "艮" | "离";

const FLY_SEQUENCE: Palace[] = ["中", "乾", "兑", "艮", "离", "坎", "坤", "震", "巽"];
const PALACE_DIRECTION: Record<Palace, string> = {
  坎: "北", 坤: "西南", 震: "东", 巽: "东南", 中: "中", 乾: "西北", 兑: "西", 艮: "东北", 离: "南",
};

/** 六仪三奇按洛书数 1-9 的本位分布：戊己庚辛壬癸（六仪）+ 丁丙乙（三奇）。 */
const YI_QI_BY_NUMBER: Record<number, string> = {
  1: "戊", 2: "己", 3: "庚", 4: "辛", 5: "壬", 6: "癸", 7: "丁", 8: "丙", 9: "乙",
};

/** 八门本位（按洛书数对应宫位，中宫寄坤）。 */
const MEN_BY_NUMBER: Record<number, string> = {
  1: "休门", 2: "死门", 3: "伤门", 4: "杜门", 6: "开门", 7: "惊门", 8: "生门", 9: "景门",
};

/** 九星本位（天禽寄于坤二宫，此处单独标注中宫）。 */
const XING_BY_NUMBER: Record<number, string> = {
  1: "天蓬", 2: "天芮", 3: "天冲", 4: "天辅", 5: "天禽", 6: "天心", 7: "天柱", 8: "天任", 9: "天英",
};

function luoshuNumberOfPalace(p: Palace): number {
  const map: Record<Palace, number> = { 坎: 1, 坤: 2, 震: 3, 巽: 4, 中: 5, 乾: 6, 兑: 7, 艮: 8, 离: 9 };
  return map[p];
}

export interface QiMenInput {
  date: Date;
}

export interface QiMenPalace {
  palace: Palace;
  direction: string;
  yiQi: string; // 六仪三奇本位
  men: string | null; // 八门本位（中宫无门，寄坤）
  xing: string; // 九星本位
}

export interface QiMenChart {
  isYangDun: boolean;
  ju: number; // 1-9
  label: string; // 如「阳遁三局」
  palaces: QiMenPalace[];
}

/** 简化局数推算：以冬至/夏至为阴阳遁分界（高置信度的历法事实），
 * 局数在 1-9 间按遁内天数近似循环（简化版，非传统超神接气精确置闰）。 */
function jieQiMs(probeYear: number, name: string): number {
  const probe = Solar.fromYmdHms(probeYear, 6, 1, 12, 0, 0).getLunar().getJieQiTable();
  const jq = probe[name];
  return Date.UTC(jq.getYear(), jq.getMonth() - 1, jq.getDay());
}

/** lunar-javascript 的节气表把「冬至」计入其所在农历年的前一个阳历年
 * （即用 probeYear 查表返回的冬至实际落在阳历 probeYear-1 年 12 月），
 * 而「夏至」无此偏移。故取阳历 Y 年 12 月的冬至需探年份 Y+1。 */
function dongZhiOfCalendarYear(calendarYear: number): number {
  return jieQiMs(calendarYear + 1, "冬至");
}
function xiaZhiOfCalendarYear(calendarYear: number): number {
  return jieQiMs(calendarYear, "夏至");
}

export function computeQiMen({ date }: QiMenInput): QiMenChart {
  const nowMs = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
  const year = date.getFullYear();

  // 冬至固定在当年 12 月，夏至固定在当年 6 月；分别取「本年」与「上一年」
  // 的冬至/夏至，挑出小于等于 nowMs 的最近一个作为当前阴阳遁的起点。
  const candidates: { label: "冬至" | "夏至"; ms: number }[] = [
    { label: "冬至" as const, ms: dongZhiOfCalendarYear(year) },
    { label: "冬至" as const, ms: dongZhiOfCalendarYear(year - 1) },
    { label: "夏至" as const, ms: xiaZhiOfCalendarYear(year) },
    { label: "夏至" as const, ms: xiaZhiOfCalendarYear(year - 1) },
  ].filter((c) => c.ms <= nowMs);

  candidates.sort((a, b) => b.ms - a.ms);
  const latest = candidates[0];
  const isYangDun = latest.label === "冬至";
  const periodStartMs = latest.ms;

  const daysSincePeriodStart = Math.max(0, Math.round((nowMs - periodStartMs) / 86400000));
  const ju = (daysSincePeriodStart % 9) + 1;

  // 六仪三奇随局数整体偏移（局数即中宫起始洛书数，其余按 FLY_SEQUENCE 顺/逆排布）
  const yiQiPlate: Record<Palace, string> = {} as Record<Palace, string>;
  const menPlate: Record<Palace, string | null> = {} as Record<Palace, string | null>;
  FLY_SEQUENCE.forEach((palace, i) => {
    const num = isYangDun ? (((ju - 1 + i) % 9) + 1) : (((ju - 1 - i + 900) % 9) + 1);
    yiQiPlate[palace] = YI_QI_BY_NUMBER[num];
    // 五宫无门，传统「寄坤二宫」：凡飞泊到数 5 的非中宫位置，借用二宫（坤）之门
    menPlate[palace] = palace === "中" ? null : MEN_BY_NUMBER[num] ?? MEN_BY_NUMBER[2];
  });

  const palaces: QiMenPalace[] = FLY_SEQUENCE.map((palace) => ({
    palace,
    direction: PALACE_DIRECTION[palace],
    yiQi: yiQiPlate[palace],
    men: menPlate[palace],
    xing: XING_BY_NUMBER[luoshuNumberOfPalace(palace)],
  }));

  return {
    isYangDun,
    ju,
    label: `${isYangDun ? "阳遁" : "阴遁"}${["一", "二", "三", "四", "五", "六", "七", "八", "九"][ju - 1]}局`,
    palaces,
  };
}
