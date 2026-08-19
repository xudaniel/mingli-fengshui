/** 干支、十神、五行等术语的拼音与通行英译，供英文界面显示汉字旁注使用。 */

export const GAN_PINYIN: Record<string, string> = {
  甲: "jiǎ", 乙: "yǐ", 丙: "bǐng", 丁: "dīng", 戊: "wù",
  己: "jǐ", 庚: "gēng", 辛: "xīn", 壬: "rén", 癸: "guǐ",
};

export const GAN_EN: Record<string, string> = {
  甲: "Yang Wood", 乙: "Yin Wood", 丙: "Yang Fire", 丁: "Yin Fire", 戊: "Yang Earth",
  己: "Yin Earth", 庚: "Yang Metal", 辛: "Yin Metal", 壬: "Yang Water", 癸: "Yin Water",
};

export const ZHI_PINYIN: Record<string, string> = {
  子: "zǐ", 丑: "chǒu", 寅: "yín", 卯: "mǎo", 辰: "chén", 巳: "sì",
  午: "wǔ", 未: "wèi", 申: "shēn", 酉: "yǒu", 戌: "xū", 亥: "hài",
};

/** 地支对应生肖，是通行的英文旁注 */
export const ZHI_EN: Record<string, string> = {
  子: "Rat", 丑: "Ox", 寅: "Tiger", 卯: "Rabbit", 辰: "Dragon", 巳: "Snake",
  午: "Horse", 未: "Goat", 申: "Monkey", 酉: "Rooster", 戌: "Dog", 亥: "Pig",
};

export const SHISHEN_EN: Record<string, string> = {
  日主: "Day Master",
  比肩: "Companion",
  劫财: "Rob Wealth",
  食神: "Eating God",
  伤官: "Hurting Officer",
  偏财: "Indirect Wealth",
  正财: "Direct Wealth",
  七杀: "Seven Killings",
  偏官: "Seven Killings",
  正官: "Direct Officer",
  偏印: "Indirect Seal",
  正印: "Direct Seal",
};

export const WUXING_EN: Record<string, string> = {
  木: "Wood", 火: "Fire", 土: "Earth", 金: "Metal", 水: "Water",
};

export const GUA_EN: Record<string, string> = {
  坎: "Kan", 坤: "Kun", 震: "Zhen", 巽: "Xun", 乾: "Qian", 兑: "Dui", 艮: "Gen", 离: "Li",
};

export const STAR_EN: Record<string, string> = {
  生气: "Vitality", 天医: "Heavenly Doctor", 延年: "Longevity", 伏位: "Stability",
  祸害: "Misfortune", 五鬼: "Five Ghosts", 六煞: "Six Killings", 绝命: "Life-Ending",
};

export const RELATION_EN: Record<string, string> = {
  六合: "Six Harmony", 三合: "Trine", 半合: "Half-Trine", 三会: "Directional Assembly",
  相冲: "Clash", 相刑: "Punishment", 自刑: "Self-Punishment", 相害: "Harm",
};

/** 汉字 + 拼音 + 英译的简短旁注，用于英文界面。 */
export function ganGloss(gan: string): string {
  const py = GAN_PINYIN[gan] ?? "";
  const en = GAN_EN[gan] ?? "";
  return `${gan} (${py}, ${en})`;
}

export function zhiGloss(zhi: string): string {
  const py = ZHI_PINYIN[zhi] ?? "";
  const en = ZHI_EN[zhi] ?? "";
  return `${zhi} (${py}, ${en})`;
}

export function shishenGloss(shishen: string): string {
  const en = SHISHEN_EN[shishen];
  return en ? `${shishen} (${en})` : shishen;
}

export function wuxingGloss(el: string): string {
  const en = WUXING_EN[el];
  return en ? `${el} (${en})` : el;
}
