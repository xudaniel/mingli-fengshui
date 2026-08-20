/** 今日老黄历：不依赖出生信息的每日黄历，直接调用 lunar-javascript
 * 已内置的十二值神、二十八宿、黄道黑道日、吉神方位、彭祖百忌与宜忌数据。 */

import { Solar } from "lunar-javascript";

export interface DailyAlmanac {
  solarDate: string; // yyyy-MM-dd
  weekday: string;
  lunarLabel: string; // 农历几月几
  yearGanZhi: string;
  monthGanZhi: string;
  dayGanZhi: string;
  shengXiao: string;
  zhiXing: string; // 十二值神：建除满平定执破危成收开闭
  xiu: {
    name: string; // 二十八宿
    luck: string; // 吉/凶
    animal: string;
    gong: string; // 东西南北四宫
    zheng: string; // 对应五行
  };
  tianShen: {
    name: string;
    type: string; // 黄道/黑道
    luck: string;
  };
  positions: {
    xi: string; // 喜神
    fu: string; // 福神
    cai: string; // 财神
    taiSui: string; // 太岁方
  };
  pengZu: string;
  yi: string[];
  ji: string[];
}

export function getDailyAlmanac(date: Pick<Date, "getFullYear" | "getMonth" | "getDate">): DailyAlmanac {
  const solar = Solar.fromYmdHms(date.getFullYear(), date.getMonth() + 1, date.getDate(), 12, 0, 0);
  const lunar = solar.getLunar();

  return {
    solarDate: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`,
    weekday: lunar.getWeekInChinese(),
    lunarLabel: `${lunar.getYearInChinese()}年 ${lunar.getMonthInChinese()}月${lunar.getDayInChinese()}`,
    yearGanZhi: lunar.getYearInGanZhiExact(),
    monthGanZhi: lunar.getMonthInGanZhiExact(),
    dayGanZhi: lunar.getDayInGanZhi(),
    shengXiao: lunar.getYearShengXiaoExact(),
    zhiXing: lunar.getZhiXing(),
    xiu: {
      name: lunar.getXiu(),
      luck: lunar.getXiuLuck(),
      animal: lunar.getAnimal(),
      gong: lunar.getGong(),
      zheng: lunar.getZheng(),
    },
    tianShen: {
      name: lunar.getDayTianShen(),
      type: lunar.getDayTianShenType(),
      luck: lunar.getDayTianShenLuck(),
    },
    positions: {
      xi: lunar.getDayPositionXiDesc(),
      fu: lunar.getDayPositionFuDesc(),
      cai: lunar.getDayPositionCaiDesc(),
      taiSui: lunar.getDayPositionTaiSuiDesc(),
    },
    pengZu: `${lunar.getPengZuGan()} ${lunar.getPengZuZhi()}`,
    yi: lunar.getDayYi(2),
    ji: lunar.getDayJi(2),
  };
}

/** 未来 n 天（含当天）的黄历列表，供切换查看。 */
export function getAlmanacRange(startDate: Date, days: number): DailyAlmanac[] {
  const list: DailyAlmanac[] = [];
  for (let i = 0; i < days; i++) {
    const d = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() + i);
    list.push(getDailyAlmanac(d));
  }
  return list;
}
