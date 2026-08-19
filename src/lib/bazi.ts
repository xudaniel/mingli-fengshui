import { Solar } from "lunar-javascript";
import type { CivilMoment } from "./solarTime";
import {
  analyzeStrength,
  ganElement,
  type Element,
  type StrengthAnalysis,
} from "./analysis";
import { getTiaoHou, type TiaoHou } from "./tiaohou";
import { detectRelations, type Relation } from "./relations";

export { ELEMENTS, type Element } from "./analysis";

export interface HiddenStem {
  gan: string;
  shiShen: string;
}

export interface Pillar {
  label: string;
  gan: string;
  zhi: string;
  ganZhi: string;
  wuXing: string;
  naYin: string;
  shiShen: string;
  hiddenStems: HiddenStem[];
  xunKong: string;
}

export interface DaYunEntry {
  ganZhi: string;
  startAge: number;
  endAge: number;
  startYear: number;
  endYear: number;
}

export interface BaziResult {
  lunarYear: string;
  lunarMonth: string;
  lunarDay: string;
  shengXiao: string;
  xingZuo: string;
  pillars: Pillar[];
  elementCounts: Record<Element, number>;
  dayMaster: { gan: string; element: Element };
  strength: StrengthAnalysis;
  tiaoHou: TiaoHou;
  relations: Relation[];
  taiYuan: string;
  taiYuanNaYin: string;
  mingGong: string;
  mingGongNaYin: string;
  shenGong: string;
  /** 以立春为界修正后的年份，用于命卦等按年推算的体系 */
  fengshuiYear: number;
  /** 当前流年干支及其与喜忌的关系说明 */
  liuNian: { year: number; ganZhi: string };
  daYun: DaYunEntry[];
}

const XING_ZUO = [
  { name: "摩羯座", from: [12, 22] },
  { name: "水瓶座", from: [1, 20] },
  { name: "双鱼座", from: [2, 19] },
  { name: "白羊座", from: [3, 21] },
  { name: "金牛座", from: [4, 20] },
  { name: "双子座", from: [5, 21] },
  { name: "巨蟹座", from: [6, 22] },
  { name: "狮子座", from: [7, 23] },
  { name: "处女座", from: [8, 23] },
  { name: "天秤座", from: [9, 23] },
  { name: "天蝎座", from: [10, 24] },
  { name: "射手座", from: [11, 23] },
];

function xingZuoOf(month: number, day: number): string {
  for (let i = XING_ZUO.length - 1; i >= 0; i--) {
    const [m, d] = XING_ZUO[i].from;
    if (month > m || (month === m && day >= d)) return XING_ZUO[i].name;
  }
  return "摩羯座";
}

export function computeBazi(
  civil: CivilMoment,
  gender: "male" | "female",
): BaziResult {
  const solar = Solar.fromYmdHms(
    civil.year,
    civil.month,
    civil.day,
    civil.hour,
    civil.minute,
    0,
  );
  const lunar = solar.getLunar();
  const ec = lunar.getEightChar();

  const mkHidden = (gans: string[], shiShens: string[]): HiddenStem[] =>
    gans.map((g, i) => ({ gan: g, shiShen: shiShens[i] ?? "" }));

  const pillars: Pillar[] = [
    {
      label: "年柱",
      gan: ec.getYearGan(),
      zhi: ec.getYearZhi(),
      ganZhi: ec.getYear(),
      wuXing: ec.getYearWuXing(),
      naYin: ec.getYearNaYin(),
      shiShen: ec.getYearShiShenGan(),
      hiddenStems: mkHidden(ec.getYearHideGan(), ec.getYearShiShenZhi()),
      xunKong: ec.getYearXunKong(),
    },
    {
      label: "月柱",
      gan: ec.getMonthGan(),
      zhi: ec.getMonthZhi(),
      ganZhi: ec.getMonth(),
      wuXing: ec.getMonthWuXing(),
      naYin: ec.getMonthNaYin(),
      shiShen: ec.getMonthShiShenGan(),
      hiddenStems: mkHidden(ec.getMonthHideGan(), ec.getMonthShiShenZhi()),
      xunKong: ec.getMonthXunKong(),
    },
    {
      label: "日柱",
      gan: ec.getDayGan(),
      zhi: ec.getDayZhi(),
      ganZhi: ec.getDay(),
      wuXing: ec.getDayWuXing(),
      naYin: ec.getDayNaYin(),
      shiShen: "日主",
      hiddenStems: mkHidden(ec.getDayHideGan(), ec.getDayShiShenZhi()),
      xunKong: ec.getDayXunKong(),
    },
    {
      label: "时柱",
      gan: ec.getTimeGan(),
      zhi: ec.getTimeZhi(),
      ganZhi: ec.getTime(),
      wuXing: ec.getTimeWuXing(),
      naYin: ec.getTimeNaYin(),
      shiShen: ec.getTimeShiShenGan(),
      hiddenStems: mkHidden(ec.getTimeHideGan(), ec.getTimeShiShenZhi()),
      xunKong: ec.getTimeXunKong(),
    },
  ];

  const elementCounts: Record<Element, number> = {
    木: 0,
    火: 0,
    土: 0,
    金: 0,
    水: 0,
  };
  for (const p of pillars) {
    elementCounts[ganElement(p.gan)]++;
    elementCounts[ganElement(p.hiddenStems[0].gan)]++; // 地支以本气计
  }

  const dayMasterElement = ganElement(ec.getDayGan());
  const strength = analyzeStrength(
    pillars.map((p, i) => ({
      gan: p.gan,
      zhi: p.zhi,
      hideGan: p.hiddenStems.map((h) => h.gan),
      isMonth: i === 1,
    })),
    dayMasterElement,
  );

  // 立春为界的年份：早于当年立春则归上一年
  const liChun = lunar.getJieQiTable()["立春"];
  const beforeLiChun =
    civil.month < liChun.getMonth() ||
    (civil.month === liChun.getMonth() &&
      (civil.day < liChun.getDay() ||
        (civil.day === liChun.getDay() &&
          (civil.hour < liChun.getHour() ||
            (civil.hour === liChun.getHour() && civil.minute < liChun.getMinute())))));
  const fengshuiYear = beforeLiChun ? civil.year - 1 : civil.year;

  // 当前流年（按浏览器本地日期）
  const now = new Date();
  const nowEc = Solar.fromYmdHms(
    now.getFullYear(),
    now.getMonth() + 1,
    now.getDate(),
    12,
    0,
    0,
  )
    .getLunar()
    .getEightChar();

  const yun = ec.getYun(gender === "male" ? 1 : 0);
  const daYun: DaYunEntry[] = yun
    .getDaYun(9)
    .filter((d) => d.getIndex() >= 1)
    .map((d) => ({
      ganZhi: d.getGanZhi(),
      startAge: d.getStartAge(),
      endAge: d.getEndAge(),
      startYear: d.getStartYear(),
      endYear: d.getEndYear(),
    }));

  return {
    lunarYear: lunar.getYearInChinese(),
    lunarMonth: lunar.getMonthInChinese(),
    lunarDay: lunar.getDayInChinese(),
    shengXiao: lunar.getYearShengXiaoExact(),
    xingZuo: xingZuoOf(civil.month, civil.day),
    pillars,
    elementCounts,
    dayMaster: { gan: ec.getDayGan(), element: dayMasterElement },
    strength,
    tiaoHou: getTiaoHou(ec.getDayGan(), ec.getMonthZhi()),
    relations: detectRelations(pillars.map((p) => p.zhi)),
    taiYuan: ec.getTaiYuan(),
    taiYuanNaYin: ec.getTaiYuanNaYin(),
    mingGong: ec.getMingGong(),
    mingGongNaYin: ec.getMingGongNaYin(),
    shenGong: ec.getShenGong(),
    fengshuiYear,
    liuNian: { year: now.getFullYear(), ganZhi: nowEc.getYear() },
    daYun,
  };
}
