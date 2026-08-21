/** 今日速览：把已有的择吉评分、犯太岁检测、奇门局数三处已验证过的计算
 * 组合成一份「今天对这份命盘而言如何」的简短结论，供首页个性化卡片使用。
 * 不引入新的排盘算法，纯粹是既有 lib 函数的组合。 */

import type { BaziResult } from "./bazi";
import { computeDateRangeCalendar, type DayScore } from "./calendar";
import { detectTaiSui, type TaiSuiHit } from "./taisui";
import { computeQiMen } from "./qimen";
import type { Lang } from "./i18n/state";

export type TodayVerdict = "favorable" | "neutral" | "unfavorable";

export interface TodayBrief {
  dayScore: DayScore;
  taiSuiHit: TaiSuiHit | null;
  qimenLabel: string;
  verdict: TodayVerdict;
  verdictText: string;
}

function verdictOf(score: number): TodayVerdict {
  if (score >= 2) return "favorable";
  if (score <= -2) return "unfavorable";
  return "neutral";
}

const VERDICT_TEXT: Record<Lang, Record<TodayVerdict, string>> = {
  zh: {
    favorable: "今日整体有利，宜把握机会。",
    neutral: "今日整体平顺，无特别宜忌。",
    unfavorable: "今日诸事需谨慎，宜稳健行事。",
  },
  en: {
    favorable: "A favorable day overall — a good one to act on plans.",
    neutral: "An unremarkable day — nothing especially favorable or unfavorable.",
    unfavorable: "A day to move carefully — best to stay steady rather than push forward.",
  },
};

function taiSuiNote(hit: TaiSuiHit, lang: Lang): string {
  if (lang === "zh") return `今年是您的${hit.kind}年：${hit.meaning}`;
  return `This year is a ${hit.kind} year for you: ${hit.meaning}`;
}

export function computeTodayBrief(bazi: BaziResult, lang: Lang = "zh", today: Date = new Date()): TodayBrief {
  const ownDayZhi = bazi.pillars[2].zhi;
  const birthYearZhi = bazi.pillars[0].zhi;
  const dayScore = computeDateRangeCalendar(today, 1, ownDayZhi, bazi.strength.favorable, bazi.strength.unfavorable)[0];

  const taiSuiHit = detectTaiSui(birthYearZhi, today.getFullYear(), 1)[0] ?? null;
  const qimen = computeQiMen({ date: today });

  const verdict = verdictOf(dayScore.score);
  const parts = [VERDICT_TEXT[lang][verdict]];
  if (taiSuiHit) parts.push(taiSuiNote(taiSuiHit, lang));

  return {
    dayScore,
    taiSuiHit,
    qimenLabel: qimen.label,
    verdict,
    verdictText: parts.join(lang === "zh" ? " " : " "),
  };
}
