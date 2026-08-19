/** 十神性格与事业方向：规则驱动的中英双语命盘解读文本生成（非 AI 生成）。
 * 全部文案为预写模板，仅依据结构化数据选择拼装，结论透明可控。 */

import type { BaziResult } from "./bazi";
import type { Element } from "./analysis";
import type { Lang } from "./i18n/state";

const GAN_PERSONALITY: Record<Lang, Record<string, string>> = {
  zh: {
    甲: "为人正直向上，有主见、敢担当，做事讲原则，如参天大树般坚韧挺拔，但有时略显固执少变通。",
    乙: "性情柔韧随和，善于变通与协调，亲和力强，如花草藤蔓般懂得借势生长，但有时显得不够果断。",
    丙: "热情开朗、光明磊落，表达欲强、行动力足，如烈日当空般感染他人，但需留意过于急躁外露。",
    丁: "心思细腻、体贴周到，外柔内韧、持久发光，如烛火灯光般默默照亮身边人，但有时想得太多。",
    戊: "为人稳重踏实、诚信可靠，包容大度、值得信赖，如高山厚土般承载力强，但有时略显保守迟缓。",
    己: "心思细致谨慎，善于经营与积累，脚踏实地、注重细节，如田园沃土般滋养万物，但有时优柔寡断。",
    庚: "性格果断刚毅、重情重义，做事雷厉风行、敢作敢当，如刀剑锋芒般锐利，但需防过于强势。",
    辛: "追求精致完美、心思细腻敏感，审美出众、自尊心强，如珠玉首饰般讲究，但有时略显挑剔。",
    壬: "聪明豁达、思维活跃，善于交际、适应力强，如江河奔流般包容并蓄，但有时略显散漫多变。",
    癸: "性情温和细腻、直觉敏锐，善于洞察人心、心思绵密，如雨露渗透般润物无声，但有时优柔多虑。",
  },
  en: {
    甲: "principled and upright, a natural leader who takes responsibility, steady as a tall tree — though sometimes too stubborn to bend.",
    乙: "flexible and accommodating, good at adapting and mediating, warm and well-liked like a climbing vine — though sometimes indecisive.",
    丙: "warm, open, and expressive, with strong drive and presence like the midday sun — though prone to impatience.",
    丁: "thoughtful and considerate, quietly resilient like candlelight, giving warmth to those around them — though prone to overthinking.",
    戊: "steady, trustworthy, and dependable, with the broad tolerance of a mountain — though sometimes overly cautious.",
    己: "meticulous and careful, skilled at steady accumulation like fertile soil nurturing crops — though sometimes indecisive.",
    庚: "decisive and resolute, loyal and quick to act like a sharpened blade — though prone to being overbearing.",
    辛: "refined and detail-oriented, with strong aesthetic sense and pride like polished jade — though sometimes overly critical.",
    壬: "clever and open-minded, sociable and adaptable like a flowing river — though sometimes scattered or inconsistent.",
    癸: "gentle and perceptive, with sharp intuition that quietly influences others like rain soaking the earth — though sometimes overly hesitant.",
  },
};

const SHISHEN_TRAIT: Record<Lang, Record<string, string>> = {
  zh: {
    比肩: "自我意识强、独立自主，重视平等合作与个人空间，行事有主见但有时略显固执。",
    劫财: "行动力强、敢于争取，重情重义、朋友缘佳，但需留意财务与冲动决策上的风险。",
    食神: "才华外露、性情乐观随和，善于表达与享受生活，人缘颇佳，适合创作与分享型工作。",
    伤官: "聪明机敏、个性张扬，创造力与表现欲强，但言辞犀利，需留意人际分寸与情绪管理。",
    偏财: "眼光敏锐、善于把握机会，慷慨大方、人脉广，适合多元化、灵活的收入来源。",
    正财: "踏实勤俭、责任心强，善于积累与规划，重视稳定与安全感，是可靠的持家理财之人。",
    七杀: "果敢坚毅、抗压能力强，有冲劲与魄力，适合竞争激烈的环境，但需防急躁冒进。",
    正官: "循规蹈矩、重视名誉与责任，办事稳妥有条理，适合体制内或规范化的发展路径。",
    偏印: "思维独特、善于钻研，直觉敏锐、兴趣广泛，但有时显得特立独行、不易亲近。",
    正印: "温和善良、重视学习与传承，心思细腻、悟性高，容易得师长贵人相助。",
  },
  en: {
    比肩: "strongly independent with a clear sense of self, values fairness and personal space, opinionated but occasionally stubborn.",
    劫财: "action-oriented and assertive, loyal to friends, but should watch for impulsive financial decisions.",
    食神: "visibly talented, easygoing and optimistic, expressive and well-liked — suited to creative or hospitality-driven work.",
    伤官: "sharp and outspoken, highly creative with strong self-expression, but should mind bluntness in social settings.",
    偏财: "sharp-eyed and opportunistic, generous with a wide network — suited to diverse, flexible income streams.",
    正财: "steady and thrifty, highly responsible, good at accumulating and planning — a reliable, security-minded provider.",
    七杀: "bold and resilient under pressure, driven and forceful — suited to competitive environments, but should guard against rashness.",
    正官: "rule-abiding and reputation-conscious, methodical and dependable — suited to institutional or structured career paths.",
    偏印: "an original, research-minded thinker with sharp intuition and broad interests, though sometimes aloof.",
    正印: "gentle and kind, values learning and tradition, perceptive and easily supported by mentors.",
  },
};

const CAREER_BY_ELEMENT: Record<Lang, Record<Element, string>> = {
  zh: {
    木: "教育培训、出版传媒、文化创意、园艺林业、中医药、纺织服装等行业",
    火: "能源电力、电子科技、餐饮娱乐、影视传媒、美妆时尚、互联网等行业",
    土: "房地产建筑、农业种植、陶瓷矿产、行政管理、中介咨询等行业",
    金: "金融投资、机械制造、五金机电、法律、军警安防等行业",
    水: "物流贸易、旅游酒店、渔业航运、信息网络、酒水饮品等行业",
  },
  en: {
    木: "education, publishing/media, creative industries, horticulture and forestry, traditional medicine, textiles",
    火: "energy, electronics, food and entertainment, film/media, beauty and fashion, internet/tech",
    土: "real estate and construction, agriculture, ceramics and mining, administration, consulting",
    金: "finance and investment, machinery manufacturing, hardware, law, security and defense",
    水: "logistics and trade, travel and hospitality, fisheries and shipping, networking/IT, beverages",
  },
};

export interface Interpretation {
  dayMasterText: string;
  dominantShiShen: string;
  dominantShiShenText: string;
  strengthText: string;
  careerText: string;
  paragraphs: string[];
}

function countShiShen(bazi: BaziResult): Record<string, number> {
  const counts: Record<string, number> = {};
  const bump = (s: string) => {
    if (!s || s === "日主") return;
    counts[s] = (counts[s] || 0) + 1;
  };
  for (const p of bazi.pillars) {
    bump(p.shiShen);
    for (const h of p.hiddenStems) bump(h.shiShen);
  }
  return counts;
}

const STRENGTH_TEXT: Record<Lang, Record<"身弱" | "身强" | "中和", string>> = {
  zh: {
    身弱: "命局偏弱，宜多依托团队与外力，稳步积累后再图进取；行事不宜过于逞强，量力而行更能长久。",
    身强: "命局偏强，自身能量充足，宜主动作为、多加历练；同时需留意适度收敛锋芒，避免过刚易折。",
    中和: "命局五行中和，个性相对均衡，进退皆宜；宜保持灵活，视具体情境调整策略。",
  },
  en: {
    身弱: "A weak chart favors relying on teams and external support, building up steadily before pushing forward — avoid overextending yourself.",
    身强: "A strong chart has plenty of drive and self-reliance — take initiative and seek challenges, but temper excess force to avoid overreaching.",
    中和: "A balanced chart makes for an even temperament, equally at ease advancing or holding back — stay flexible and adapt to context.",
  },
};

export function interpretChart(bazi: BaziResult, lang: Lang = "zh"): Interpretation {
  const dayGan = bazi.dayMaster.gan;
  const dayMasterText =
    lang === "zh"
      ? `日主为${dayGan}（${bazi.dayMaster.element}），${GAN_PERSONALITY.zh[dayGan] ?? ""}`
      : `Your Day Master is ${dayGan} (${bazi.dayMaster.element}) — ${GAN_PERSONALITY.en[dayGan] ?? ""}`;

  const counts = countShiShen(bazi);
  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  const dominantShiShen = sorted[0]?.[0] ?? "";
  const dominantShiShenText = dominantShiShen
    ? lang === "zh"
      ? `八字中「${dominantShiShen}」气最旺，${SHISHEN_TRAIT.zh[dominantShiShen] ?? ""}`
      : `The dominant Ten God in your chart is ${dominantShiShen} — you are ${SHISHEN_TRAIT.en[dominantShiShen] ?? ""}`
    : "";

  const strengthText = STRENGTH_TEXT[lang][bazi.strength.verdict];

  const careerTable = CAREER_BY_ELEMENT[lang];
  const careerList = bazi.strength.favorable.map((e) => careerTable[e]).filter(Boolean);
  const careerText = careerList.length
    ? lang === "zh"
      ? `结合喜用神「${bazi.strength.favorable.join("、")}」，可留意${careerList.join("；")}等方向，未必要转行，也可在现有工作中向这些属性靠拢（如选择相关的项目、客户或职能）。`
      : `Given your favorable elements (${bazi.strength.favorable.join(", ")}), consider directions in ${careerList.join("; ")}. This doesn't require a career change — you can lean into these areas within your current role (projects, clients, or functions).`
    : "";

  const paragraphs = [dayMasterText, dominantShiShenText, strengthText, careerText].filter(Boolean);

  return { dayMasterText, dominantShiShen, dominantShiShenText, strengthText, careerText, paragraphs };
}
