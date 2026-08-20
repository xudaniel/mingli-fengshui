/** 紫微斗数核心排盘（中州派简化版）：十二宫定位、五行局、十四主星、四化。
 * 不含大限/流年、辅星全集与替卦等高阶内容。
 *
 * ⚠️ 已知置信度说明：十二宫定位、五行局、十四主星相对位置、天府起法、
 * 四化表均为高确定性的标准公式；唯独「安紫微星」按生日与局数定位的具体
 * 口诀存在多个略有出入的流传版本，本实现采用其中一种自洽版本，
 * 建议对重大用途交叉核对其他排盘工具。 */

const ZHI = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];
const GAN = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"];

export const PALACE_NAMES = [
  "命宫", "兄弟", "夫妻", "子女", "财帛", "疾厄", "迁移", "交友", "官禄", "田宅", "福德", "父母",
] as const;
export type PalaceName = (typeof PALACE_NAMES)[number];

/** 60 甲子纳音（与 lunar-javascript 内部所用表一致，用于定五行局）。 */
const NAYIN_60: string[] = [
  "海中金", "海中金", "炉中火", "炉中火", "大林木", "大林木", "路旁土", "路旁土", "剑锋金", "剑锋金",
  "山头火", "山头火", "涧下水", "涧下水", "城头土", "城头土", "白蜡金", "白蜡金", "杨柳木", "杨柳木",
  "泉中水", "泉中水", "屋上土", "屋上土", "霹雳火", "霹雳火", "松柏木", "松柏木", "长流水", "长流水",
  "沙中金", "沙中金", "山下火", "山下火", "平地木", "平地木", "壁上土", "壁上土", "金箔金", "金箔金",
  "覆灯火", "覆灯火", "天河水", "天河水", "大驿土", "大驿土", "钗钏金", "钗钏金", "桑柘木", "桑柘木",
  "大溪水", "大溪水", "沙中土", "沙中土", "天上火", "天上火", "石榴木", "石榴木", "大海水", "大海水",
];

/** 五虎遁：年干 → 寅月（正月）天干起点索引（0=甲）。 */
const WU_HU_DUN: Record<string, number> = {
  甲: 2, 己: 2, // 丙
  乙: 4, 庚: 4, // 戊
  丙: 6, 辛: 6, // 庚
  丁: 8, 壬: 8, // 壬
  戊: 0, 癸: 0, // 甲
};

const JU_BY_ELEMENT: Record<string, { number: number; name: string }> = {
  水: { number: 2, name: "水二局" },
  木: { number: 3, name: "木三局" },
  金: { number: 4, name: "金四局" },
  土: { number: 5, name: "土五局" },
  火: { number: 6, name: "火六局" },
};

export interface ZiWeiInput {
  yearGan: string; // 年干（复用 bazi.ts 已计算的四柱年干，避免重复实现历法）
  lunarMonth: number; // 农历月（1-12，闰月按当月处理）
  lunarDay: number; // 农历日（1-30）
  shiChenIndex: number; // 时辰索引 0-11（0=早子时/子时）
}

export interface StarPlacement {
  star: string;
  palaceIndex: number; // 0-11，对应 ZHI
}

export interface SiHua {
  star: string;
  type: "化禄" | "化权" | "化科" | "化忌";
}

export interface ZiWeiChart {
  lifePalaceIndex: number;
  bodyPalaceIndex: number;
  ju: { number: number; name: string };
  ziweiIndex: number;
  tianfuIndex: number;
  /** 十二宫：地支 → 宫名 */
  palaces: { zhiIndex: number; zhi: string; name: PalaceName; stars: string[] }[];
  siHua: SiHua[];
}

function mod12(n: number): number {
  return ((n % 12) + 12) % 12;
}

/** 安紫微星（见文件头注释：置信度较低的一步，best-effort 实现）。 */
function locateZiWei(ju: number, day: number): number {
  const q = Math.ceil(day / ju);
  const r = q * ju - day;
  const yinIndex = ZHI.indexOf("寅");
  const base = mod12(yinIndex + q - 1);
  if (r === 0) return base;
  if (r % 2 === 0) return mod12(base - r / 2);
  return mod12(base + (r + 1) / 2);
}

const ZIWEI_SERIES: [string, number][] = [
  ["紫微", 0], ["天机", -1], ["太阳", -3], ["武曲", -4], ["天同", -5], ["廉贞", -8],
];
const TIANFU_SERIES: [string, number][] = [
  ["天府", 0], ["太阴", 1], ["贪狼", 2], ["巨门", 3], ["天相", 4], ["天梁", 5], ["七杀", 6], ["破军", 10],
];

const SI_HUA_TABLE: Record<string, [string, string, string, string]> = {
  甲: ["廉贞", "破军", "武曲", "太阳"],
  乙: ["天机", "天梁", "紫微", "太阴"],
  丙: ["天同", "天机", "文昌", "廉贞"],
  丁: ["太阴", "天同", "天机", "巨门"],
  戊: ["贪狼", "太阴", "右弼", "天机"],
  己: ["武曲", "贪狼", "天梁", "文曲"],
  庚: ["太阳", "武曲", "太阴", "天同"],
  辛: ["巨门", "太阳", "文曲", "文昌"],
  壬: ["天梁", "紫微", "左辅", "武曲"],
  癸: ["破军", "巨门", "太阴", "贪狼"],
};

export function computeZiWei(input: ZiWeiInput): ZiWeiChart {
  const yinIndex = ZHI.indexOf("寅");
  const monthPalaceIndex = mod12(yinIndex + (input.lunarMonth - 1));
  const lifePalaceIndex = mod12(monthPalaceIndex - input.shiChenIndex);
  const bodyPalaceIndex = mod12(monthPalaceIndex + input.shiChenIndex);

  // 命宫干支纳音 -> 五行局：命宫的天干由五虎遁（同八字月干推法）从寅宫天干起算，
  // 之后每宫（每支）天干顺推 1；再用（干索引, 支索引）联合定位 60 甲子表查纳音。
  const startGanIndex = WU_HU_DUN[input.yearGan];
  if (startGanIndex === undefined) throw new Error(`未知年干：${input.yearGan}`);
  const lifeGanIndex = (startGanIndex + mod12(lifePalaceIndex - yinIndex)) % 10;
  let ganZhiCombined = 0;
  for (let i = 0; i < 60; i++) {
    if (i % 10 === lifeGanIndex && i % 12 === lifePalaceIndex) {
      ganZhiCombined = i;
      break;
    }
  }
  const nayin = NAYIN_60[ganZhiCombined];
  const element = nayin[nayin.length - 1];
  const ju = JU_BY_ELEMENT[element] ?? JU_BY_ELEMENT.水;

  const ziweiIndex = locateZiWei(ju.number, input.lunarDay);
  const tianfuIndex = mod12(4 - ziweiIndex);

  const placements: StarPlacement[] = [
    ...ZIWEI_SERIES.map(([star, offset]) => ({ star, palaceIndex: mod12(ziweiIndex + offset) })),
    ...TIANFU_SERIES.map(([star, offset]) => ({ star, palaceIndex: mod12(tianfuIndex + offset) })),
  ];

  const palaces = ZHI.map((zhi, zhiIndex) => {
    const nameIdx = mod12(zhiIndex - lifePalaceIndex);
    return {
      zhiIndex,
      zhi,
      name: PALACE_NAMES[nameIdx],
      stars: placements.filter((p) => p.palaceIndex === zhiIndex).map((p) => p.star),
    };
  });

  const siHuaStars = SI_HUA_TABLE[input.yearGan] ?? SI_HUA_TABLE.甲;
  const siHua: SiHua[] = [
    { star: siHuaStars[0], type: "化禄" },
    { star: siHuaStars[1], type: "化权" },
    { star: siHuaStars[2], type: "化科" },
    { star: siHuaStars[3], type: "化忌" },
  ];

  return { lifePalaceIndex, bodyPalaceIndex, ju, ziweiIndex, tianfuIndex, palaces, siHua };
}

export { GAN as ZIWEI_GAN, ZHI as ZIWEI_ZHI };
