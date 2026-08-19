/** 从一份档案推算出完整的排盘结果，供主排盘流程、合婚、日历等场景复用。 */

import type { Profile } from "./profiles";
import { toTrueSolarTime, shiftCivilMinutes, type CivilMoment } from "./solarTime";
import { inChinaDst } from "./historicalTime";
import { computeBazi, type BaziResult } from "./bazi";
import { computeGua } from "./bagua";
import type { GuaInfo } from "./bagua";

export interface ProfileComputation {
  bazi: BaziResult;
  gua: GuaInfo;
  effectiveCivil: CivilMoment;
}

/** hourUnknown 档案以正午 12:00 作为占位时辰（时柱及强弱判定仅供参考，
 * 完整分析请使用「十二时辰扫描」）。 */
export function computeFromProfile(p: Profile): ProfileComputation {
  const [year, month, day] = p.date.split("-").map(Number);
  const [hour, minute] = p.hourUnknown ? [12, 0] : p.time.split(":").map(Number);
  let civil: CivilMoment = { year, month, day, hour, minute };

  if (!p.hourUnknown && p.utcOffset === 8 && inChinaDst(civil)) {
    civil = shiftCivilMinutes(civil, -60);
  }

  if (p.useTrueSolar && !p.hourUnknown) {
    const solar = toTrueSolarTime(civil, {
      longitude: p.longitude,
      utcOffsetHours: p.utcOffset,
      applyEquationOfTime: p.useEot,
    });
    civil = solar.corrected;
  }

  const bazi = computeBazi(civil, p.gender);
  const gua = computeGua(bazi.fengshuiYear, p.gender);
  return { bazi, gua, effectiveCivil: civil };
}
