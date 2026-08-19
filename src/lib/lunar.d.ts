declare module "lunar-javascript" {
  export interface EightChar {
    getYear(): string;
    getYearGan(): string;
    getYearZhi(): string;
    getYearWuXing(): string;
    getYearNaYin(): string;
    getYearShiShenGan(): string;
    getMonth(): string;
    getMonthGan(): string;
    getMonthZhi(): string;
    getMonthWuXing(): string;
    getMonthNaYin(): string;
    getMonthShiShenGan(): string;
    getDay(): string;
    getDayGan(): string;
    getDayZhi(): string;
    getDayWuXing(): string;
    getDayNaYin(): string;
    getTime(): string;
    getTimeGan(): string;
    getTimeZhi(): string;
    getTimeWuXing(): string;
    getTimeNaYin(): string;
    getTimeShiShenGan(): string;
    getYun(gender: 1 | 0, sect?: 1 | 2): Yun;
  }

  export interface DaYun {
    getIndex(): number;
    getStartYear(): number;
    getEndYear(): number;
    getStartAge(): number;
    getEndAge(): number;
    getGanZhi(): string;
  }

  export interface Yun {
    getDaYun(n?: number): DaYun[];
  }

  export interface Lunar {
    getYearInChinese(): string;
    getMonthInChinese(): string;
    getDayInChinese(): string;
    getEightChar(): EightChar;
    getSolar(): Solar;
  }

  export interface Solar {
    getYear(): number;
    getMonth(): number;
    getDay(): number;
    toYmd(): string;
    toYmdHms(): string;
    getLunar(): Lunar;
  }

  export const Solar: {
    fromYmdHms(
      year: number,
      month: number,
      day: number,
      hour: number,
      minute: number,
      second: number,
    ): Solar;
  };
}
