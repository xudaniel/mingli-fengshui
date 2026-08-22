/** 痣相知识词典：传统民俗痣相说法的白话归纳，纯文化娱乐参考。
 * ⚠️ 本词典只谈民俗寓意，不涉及任何医学判断；形状颜色异常、快速变化的
 * 痣应尽早就医检查，切勿以民俗说法代替医学意见。 */

export type MoleCategory = "额面" | "眉眼" | "鼻唇" | "耳颊" | "颈肩手臂" | "躯干腿足";

export interface MoleEntry {
  keywords: string[];
  category: MoleCategory;
  meaning: string;
}

export const MOLES: MoleEntry[] = [
  // 额面
  { keywords: ["额头正中", "天庭"], category: "额面", meaning: "天庭有痣，传统主早年多波折、离乡发展反而有成，宜自立自强。" },
  { keywords: ["额头左侧"], category: "额面", meaning: "额左有痣，民俗主得长辈助力，但早年财来财去，宜养成储蓄习惯。" },
  { keywords: ["额头右侧"], category: "额面", meaning: "额右有痣，主行动力强、适合外出闯荡，中年后渐入佳境。" },
  { keywords: ["发际线", "发际"], category: "额面", meaning: "发际有痣多为隐痣，传统认为主贵人暗中相助，逢凶化吉。" },
  { keywords: ["太阳穴", "迁移宫"], category: "额面", meaning: "太阳穴（迁移宫）有痣，主远行与变动多，外出发展机遇大于留守。" },
  { keywords: ["印堂", "两眉之间"], category: "额面", meaning: "印堂有痣，男女说法各异，总体主个性强、大起大落，宜修心养性。" },
  { keywords: ["下巴", "地阁"], category: "额面", meaning: "下巴有痣，主晚运与不动产缘分，痣色润泽者传统认为老来安稳。" },
  { keywords: ["下巴左侧"], category: "额面", meaning: "下巴左侧有痣，民俗主住所常变动，安定后运势转稳。" },
  { keywords: ["脸颊法令纹"], category: "额面", meaning: "法令纹上有痣，主事业中会遇职权相关的考验，宜按规矩行事。" },

  // 眉眼
  { keywords: ["眉毛里", "眉中"], category: "眉眼", meaning: "眉里藏痣，是传统痣相中的吉痣之一，主聪慧有才艺、暗中有贵人。" },
  { keywords: ["眉上"], category: "眉眼", meaning: "眉上有痣，主早年经济起伏，宜防他人牵累钱财，慎作担保。" },
  { keywords: ["眉尾"], category: "眉眼", meaning: "眉尾有痣，主感情丰富、人缘佳，也需在感情中多些界限感。" },
  { keywords: ["两眉之外", "眉骨"], category: "眉眼", meaning: "眉骨有痣，主个性执着，认定之事不轻易回头，成也在此败也在此。" },
  { keywords: ["上眼皮", "眼皮"], category: "眉眼", meaning: "上眼皮有痣，主住所与工作变动较多，喜新鲜感，宜求稳中带变。" },
  { keywords: ["下眼睑", "泪堂", "眼下"], category: "眉眼", meaning: "眼下泪堂有痣，俗称泪痣，主重感情、易为情所困，宜学会情绪疏导。" },
  { keywords: ["眼角", "眼尾", "奸门"], category: "眉眼", meaning: "眼尾（奸门）有痣，主异性缘旺，感情选择宜格外慎重。" },
  { keywords: ["眼头", "内眼角"], category: "眉眼", meaning: "内眼角有痣，主心思细腻敏锐，善察人意，宜善用而不多疑。" },

  // 鼻唇
  { keywords: ["鼻头", "准头"], category: "鼻唇", meaning: "鼻头有痣，传统主财来财去、易为钱财操心，理财宜保守。" },
  { keywords: ["鼻翼"], category: "鼻唇", meaning: "鼻翼有痣，民俗视为「财库有漏」，宜开源节流、避免冲动消费。" },
  { keywords: ["鼻梁"], category: "鼻唇", meaning: "鼻梁有痣，主中年前后健康与事业需多加打理，忌操劳过度。" },
  { keywords: ["山根", "鼻根"], category: "鼻唇", meaning: "山根有痣，主早年离家或与配偶聚少离多，感情需多经营。" },
  { keywords: ["人中"], category: "鼻唇", meaning: "人中有痣，传统与子女缘、健康相关，说法多样，平常心看待即可。" },
  { keywords: ["上唇", "嘴唇上"], category: "鼻唇", meaning: "上唇有痣，主重情重义、口福佳，也提示饮食宜有节制。" },
  { keywords: ["下唇"], category: "鼻唇", meaning: "下唇有痣，主劳碌命里带口福，一生与吃喝打交道的缘分深。" },
  { keywords: ["嘴角"], category: "鼻唇", meaning: "嘴角有痣，俗称美人痣/食禄痣，主人缘好、衣食无忧。" },
  { keywords: ["嘴唇下方", "颏上"], category: "鼻唇", meaning: "唇下有痣，主意志坚定但偶有口舌是非，说话宜留三分。" },

  // 耳颊
  { keywords: ["耳垂"], category: "耳颊", meaning: "耳垂有痣，传统视为福痣，主福气财气俱佳，人缘和顺。" },
  { keywords: ["耳轮", "耳廓"], category: "耳颊", meaning: "耳轮有痣，主聪明伶俐、有主见，少年运佳。" },
  { keywords: ["耳后"], category: "耳颊", meaning: "耳后藏痣，主暗中有靠山，遇事常有人默默相助。" },
  { keywords: ["耳内"], category: "耳颊", meaning: "耳内有痣，传统主长寿之兆，亦主善于倾听、得人信任。" },
  { keywords: ["颧骨"], category: "耳颊", meaning: "颧骨有痣，主掌权欲与责任心强，宜带人以宽，免招怨言。" },
  { keywords: ["脸颊", "面颊"], category: "耳颊", meaning: "脸颊有痣，主行动派、闲不住，一生多为事业奔波。" },
  { keywords: ["腮边", "腮部"], category: "耳颊", meaning: "腮边有痣，主意志顽强、越挫越勇，中晚年渐见积累之功。" },

  // 颈肩手臂
  { keywords: ["脖子前", "颈前"], category: "颈肩手臂", meaning: "颈前有痣，民俗称「事业痣」，主肯干敢拼，机会偏爱主动的人。" },
  { keywords: ["脖子后", "颈后"], category: "颈肩手臂", meaning: "颈后有痣，俗称「靠山痣」，主背后有贵人扶持，做事有依托。" },
  { keywords: ["肩膀"], category: "颈肩手臂", meaning: "肩上有痣，主一生责任较重、能挑担子，是可托付之人。" },
  { keywords: ["锁骨"], category: "颈肩手臂", meaning: "锁骨有痣，主性情温和、人际圆融，广结善缘。" },
  { keywords: ["手臂外侧"], category: "颈肩手臂", meaning: "手臂外侧有痣，主善交际、在外得人缘，工作中易获协作。" },
  { keywords: ["手臂内侧"], category: "颈肩手臂", meaning: "手臂内侧有痣，主内秀藏财，善于默默积累。" },
  { keywords: ["手心", "掌心"], category: "颈肩手臂", meaning: "掌心有痣，传统视为难得的吉痣，主心思缜密、理财有方。" },
  { keywords: ["手背"], category: "颈肩手臂", meaning: "手背有痣，主善于管事、家中多由其操持，能者多劳。" },
  { keywords: ["手指"], category: "颈肩手臂", meaning: "手指有痣，主手巧心细，适合精细手艺与专业技能。" },

  // 躯干腿足
  { keywords: ["胸口", "胸前"], category: "躯干腿足", meaning: "胸前有痣，俗话「胸怀大志」，主抱负不小，宜配以踏实行动。" },
  { keywords: ["背部", "后背"], category: "躯干腿足", meaning: "背上有痣，俗称「背负痣」，主早年辛劳、中晚年有成，先苦后甜。" },
  { keywords: ["腰部", "腰间"], category: "躯干腿足", meaning: "腰间有痣，主性格豁达、财库随身，宜注意腰身劳损。" },
  { keywords: ["肚脐", "脐部"], category: "躯干腿足", meaning: "脐上有痣，传统视为福禄之兆，主生活富足、心宽体泰。" },
  { keywords: ["大腿"], category: "躯干腿足", meaning: "大腿有痣，主奔波中得财，动则有利、静则平平。" },
  { keywords: ["小腿"], category: "躯干腿足", meaning: "小腿有痣，主勤快耐劳，一生闲不下来，劳有所得。" },
  { keywords: ["脚底", "足底"], category: "躯干腿足", meaning: "脚底有痣，传统相学中的贵痣，主脚踏实地、越走越高。" },
  { keywords: ["脚背", "足背"], category: "躯干腿足", meaning: "脚背有痣，主一生多行走奔波，宜从事与外勤、旅行相关的事。" },
  { keywords: ["脚踝"], category: "躯干腿足", meaning: "脚踝有痣，主行动敏捷、闲不住，出行机会多。" },
];

export const MOLE_CATEGORIES: MoleCategory[] = ["额面", "眉眼", "鼻唇", "耳颊", "颈肩手臂", "躯干腿足"];

/** 关键字模糊匹配，逻辑与 dreams.ts 的 searchDreams 一致。 */
export function searchMoles(query: string): MoleEntry[] {
  const q = query.trim();
  if (!q) return [];
  const scored = MOLES.map((entry) => {
    let score = 0;
    for (const kw of entry.keywords) {
      if (kw === q) score += 100;
      else if (kw.includes(q) || q.includes(kw)) score += 10;
    }
    return { entry, score };
  }).filter((s) => s.score > 0);
  scored.sort((a, b) => b.score - a.score);
  return scored.map((s) => s.entry);
}

export function molesByCategory(category: MoleCategory): MoleEntry[] {
  return MOLES.filter((m) => m.category === category);
}
