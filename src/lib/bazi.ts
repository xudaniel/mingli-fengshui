import { Solar } from "lunar-javascript";
import type { CivilMoment } from "./solarTime";

export type Element = "木" | "火" | "土" | "金" | "水";
export const ELEMENTS: Element[] = ["木", "火", "土", "金", "水"];

export interface Pillar {
  label: string;
  gan: string;
  zhi: string;
  ganZhi: string;
  wuXing: string;
  naYin: string;
  shiShen: string;
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
  pillars: Pillar[];
  elementCounts: Record<Element, number>;
  dayMaster: { gan: string; element: Element };
  daYun: DaYunEntry[];
}

function ganElement(gan: string): Element {
  if ("甲乙".includes(gan)) return "木";
  if ("丙丁".includes(gan)) return "火";
  if ("戊己".includes(gan)) return "土";
  if ("庚辛".includes(gan)) return "金";
  return "水"; // 壬癸
}

function zhiElement(zhi: string): Element {
  if ("寅卯".includes(zhi)) return "木";
  if ("巳午".includes(zhi)) return "火";
  if ("辰戌丑未".includes(zhi)) return "土";
  if ("申酉".includes(zhi)) return "金";
  return "水"; // 子亥
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

  const pillars: Pillar[] = [
    {
      label: "年柱",
      gan: ec.getYearGan(),
      zhi: ec.getYearZhi(),
      ganZhi: ec.getYear(),
      wuXing: ec.getYearWuXing(),
      naYin: ec.getYearNaYin(),
      shiShen: ec.getYearShiShenGan(),
    },
    {
      label: "月柱",
      gan: ec.getMonthGan(),
      zhi: ec.getMonthZhi(),
      ganZhi: ec.getMonth(),
      wuXing: ec.getMonthWuXing(),
      naYin: ec.getMonthNaYin(),
      shiShen: ec.getMonthShiShenGan(),
    },
    {
      label: "日柱",
      gan: ec.getDayGan(),
      zhi: ec.getDayZhi(),
      ganZhi: ec.getDay(),
      wuXing: ec.getDayWuXing(),
      naYin: ec.getDayNaYin(),
      shiShen: "日主",
    },
    {
      label: "时柱",
      gan: ec.getTimeGan(),
      zhi: ec.getTimeZhi(),
      ganZhi: ec.getTime(),
      wuXing: ec.getTimeWuXing(),
      naYin: ec.getTimeNaYin(),
      shiShen: ec.getTimeShiShenGan(),
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
    elementCounts[zhiElement(p.zhi)]++;
  }

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
    pillars,
    elementCounts,
    dayMaster: { gan: ec.getDayGan(), element: ganElement(ec.getDayGan()) },
    daYun,
  };
}
