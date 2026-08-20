/** 完整命书：把已计算好的各模块结构化数据串成带过渡语的长文，
 * 不重新计算任何数据，只负责编排叙事。 */

import type { BaziResult } from "./bazi";
import type { GuaInfo } from "./bagua";
import { interpretChart } from "./interpret";
import { detectTaiSui } from "./taisui";
import type { Lang } from "./i18n/state";

export interface ReportChapter {
  title: string;
  paragraphs: string[];
}

export interface ReportMeta {
  name: string;
  gender: "male" | "female";
  cityLabel: string;
  civilLabel: string;
}

export function buildReport(bazi: BaziResult, gua: GuaInfo, meta: ReportMeta, lang: Lang = "zh"): ReportChapter[] {
  const who = meta.name || (lang === "zh" ? "命主" : "This chart");
  const genderWord = lang === "zh" ? (meta.gender === "male" ? "男" : "女") : meta.gender === "male" ? "male" : "female";

  const overview: ReportChapter = {
    title: lang === "zh" ? "总论" : "Overview",
    paragraphs:
      lang === "zh"
        ? [
            `${who}，${genderWord}命，${meta.civilLabel}生于${meta.cityLabel}。四柱排定为「${bazi.pillars.map((p) => p.ganZhi).join(" ")}」，日主${bazi.dayMaster.gan}（${bazi.dayMaster.element}），农历${bazi.lunarYear}年${bazi.lunarMonth}${bazi.lunarDay}，生肖属${bazi.shengXiao}，星座${bazi.xingZuo}。`,
            `综观全局，命局判为「${bazi.strength.verdict}」，同党力量约占${bazi.strength.supportPct.toFixed(0)}%，以下逐章详解四柱、五行、性格事业、大运流年与风水方位，供综合参考。`,
          ]
        : [
            `${who} was born ${meta.civilLabel} in ${meta.cityLabel} (${genderWord}). The Four Pillars are ${bazi.pillars.map((p) => p.ganZhi).join(" ")}, with Day Master ${bazi.dayMaster.gan} (${bazi.dayMaster.element}); lunar date ${bazi.lunarYear} ${bazi.lunarMonth}${bazi.lunarDay}, zodiac ${bazi.shengXiao}, star sign ${bazi.xingZuo}.`,
            `Overall the chart reads as "${bazi.strength.verdict}", with peer/resource support around ${bazi.strength.supportPct.toFixed(0)}%. The chapters below cover the pillars, element balance, personality and career, luck cycles, and feng shui directions in turn.`,
          ],
  };

  const pillarsChapter: ReportChapter = {
    title: lang === "zh" ? "四柱详解" : "The Four Pillars",
    paragraphs: bazi.pillars.map((p) => {
      const hidden = p.hiddenStems.map((h) => `${h.gan}（${h.shiShen}）`).join("、");
      return lang === "zh"
        ? `${p.label}为「${p.ganZhi}」，五行${p.wuXing}，纳音${p.naYin}，空亡${p.xunKong}；地支藏干${hidden}，此柱十神为${p.shiShen}。`
        : `The ${p.label} is "${p.ganZhi}" (${p.wuXing}), Nayin ${p.naYin}, Void ${p.xunKong}; hidden stems ${hidden}; Ten God role ${p.shiShen}.`;
    }),
  };

  const tiaoHouNote = bazi.tiaoHou.stems.length
    ? lang === "zh"
      ? `另依《穷通宝鉴》调候之法，本命宜取「${bazi.tiaoHou.stems.join("、")}」（${bazi.tiaoHou.elements.join("、")}）以调寒暖燥湿。`
      : `The seasonal-adjustment (调候) table further suggests ${bazi.tiaoHou.stems.join(", ")} (${bazi.tiaoHou.elements.join(", ")}).`
    : "";

  const strengthChapter: ReportChapter = {
    title: lang === "zh" ? "五行喜忌" : "Element Balance",
    paragraphs: [
      bazi.strength.reasoning,
      tiaoHouNote,
      lang === "zh"
        ? `综合喜用神为「${bazi.strength.favorable.join("、")}」，忌神为「${bazi.strength.unfavorable.join("、")}」，日常可从方位、颜色、材质等方面顺应喜用、节制忌神。`
        : `Overall favorable elements: ${bazi.strength.favorable.join(", ")}; unfavorable: ${bazi.strength.unfavorable.join(", ")}. Lean into the favorable through direction, color, and material choices, and temper the unfavorable.`,
    ].filter(Boolean),
  };

  const interp = interpretChart(bazi, lang);
  const personalityChapter: ReportChapter = {
    title: lang === "zh" ? "性格事业" : "Personality & Career",
    paragraphs: interp.paragraphs,
  };

  const taiSuiHits = detectTaiSui(bazi.pillars[0].zhi, new Date().getFullYear(), 12);
  const taiSuiSummary =
    taiSuiHits.length > 0
      ? lang === "zh"
        ? `未来十二年中，${taiSuiHits.map((h) => `${h.year}年${h.kind}`).join("、")}，宜提前留意、稳健行事。`
        : `Over the next twelve years: ${taiSuiHits.map((h) => `${h.year} ${h.kind}`).join(", ")} — worth planning around.`
      : lang === "zh"
        ? "未来十二年内暂无犯太岁之年，运势相对平顺。"
        : "No Tai Sui conflicts in the next twelve years — a relatively smooth stretch.";

  const luckChapter: ReportChapter = {
    title: lang === "zh" ? "大运流年" : "Luck Cycles & Annual Pillar",
    paragraphs: [
      lang === "zh"
        ? `八步大运依次为「${bazi.daYun.map((d) => `${d.startAge}岁${d.ganZhi}`).join("、")}」，各阶段宜对照喜忌五行综合研判顺逆。`
        : `The luck cycles run ${bazi.daYun.map((d) => `age ${d.startAge} ${d.ganZhi}`).join(", ")} — compare each against the favorable/unfavorable elements for a phase-by-phase read.`,
      lang === "zh"
        ? `当前流年${bazi.liuNian.year}年为「${bazi.liuNian.ganZhi}」。${taiSuiSummary}`
        : `The current annual pillar (${bazi.liuNian.year}) is "${bazi.liuNian.ganZhi}". ${taiSuiSummary}`,
    ],
  };

  const goodStars = gua.stars.filter((s) => s.auspicious).map((s) => `${s.name}${s.direction}`).join("、");
  const badStars = gua.stars.filter((s) => !s.auspicious).map((s) => `${s.name}${s.direction}`).join("、");
  const fengshuiChapter: ReportChapter = {
    title: lang === "zh" ? "风水方位" : "Feng Shui Directions",
    paragraphs: [
      lang === "zh"
        ? `按出生年与性别推得命卦为「${gua.name}」（${gua.group}）。四吉方为${goodStars}，四凶方为${badStars}，居家可尽量把大门、卧室、书房安排在吉方。`
        : `Based on birth year and gender, the life gua is "${gua.name}" (${gua.group}). Auspicious directions: ${goodStars}; inauspicious: ${badStars}. Where possible, place the main door, bedroom, and study in the favorable directions.`,
    ],
  };

  return [overview, pillarsChapter, strengthChapter, personalityChapter, luckChapter, fengshuiChapter];
}
