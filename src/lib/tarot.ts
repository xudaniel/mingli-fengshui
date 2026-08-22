/** 塔罗牌单张占卜：78 张（大阿卡纳 22 + 小阿卡纳 56），正逆位含义为
 * 本应用原创白话概括，不引用任何特定出版牌册的原文，仅作娱乐参考。 */

export type Arcana = "major" | "minor";

export interface TarotCard {
  name: string;
  nameEn: string;
  arcana: Arcana;
  upright: string;
  reversed: string;
}

const MAJOR: TarotCard[] = [
  { name: "愚者", nameEn: "The Fool", arcana: "major", upright: "崭新的开始与无畏的冒险精神，放下包袱轻装上路。", reversed: "鲁莽冲动、缺乏计划，提醒你三思而后行。" },
  { name: "魔术师", nameEn: "The Magician", arcana: "major", upright: "资源与才能俱备，正是化想法为现实的时刻。", reversed: "才能被浪费或用于取巧，提防言过其实之人。" },
  { name: "女祭司", nameEn: "The High Priestess", arcana: "major", upright: "相信直觉与内在智慧，答案在安静中浮现。", reversed: "忽视内心声音，被表象迷惑，宜静心倾听自己。" },
  { name: "女皇", nameEn: "The Empress", arcana: "major", upright: "丰饶与滋养，感情家庭温暖，创造力旺盛。", reversed: "过度依赖或溺爱，创造力受阻，宜先照顾好自己。" },
  { name: "皇帝", nameEn: "The Emperor", arcana: "major", upright: "秩序、权威与担当，宜建立规则、稳固根基。", reversed: "控制欲过强或权威受挑战，宜刚柔并济。" },
  { name: "教皇", nameEn: "The Hierophant", arcana: "major", upright: "传统与良师指引，遵循成熟路径有益。", reversed: "教条束缚创新，或需质疑权威、走自己的路。" },
  { name: "恋人", nameEn: "The Lovers", arcana: "major", upright: "情感和谐与重要抉择，跟随真心方向。", reversed: "关系失衡或选择摇摆，需诚实面对内心。" },
  { name: "战车", nameEn: "The Chariot", arcana: "major", upright: "意志坚定、克服阻力，胜利属于专注前行者。", reversed: "方向失控或动力涣散，先驾驭好自己的情绪。" },
  { name: "力量", nameEn: "Strength", arcana: "major", upright: "以柔克刚的内在力量，耐心与温和能驯服困难。", reversed: "自信不足或强撑硬扛，宜承认脆弱、恢复元气。" },
  { name: "隐者", nameEn: "The Hermit", arcana: "major", upright: "独处反思的时期，向内探寻能找到答案。", reversed: "过度封闭或逃避人群，别把独处变成孤立。" },
  { name: "命运之轮", nameEn: "Wheel of Fortune", arcana: "major", upright: "时运转动，好机会随变化而来，顺势而为。", reversed: "时运暂时不济，勿强求，静待轮盘再转。" },
  { name: "正义", nameEn: "Justice", arcana: "major", upright: "公平与因果，诚实行事将得公正结果。", reversed: "有失公允或逃避责任，正视问题方能解开。" },
  { name: "倒吊人", nameEn: "The Hanged Man", arcana: "major", upright: "换个角度看问题，暂时的停顿带来新领悟。", reversed: "无谓的牺牲与拖延，该放手时就放手。" },
  { name: "死神", nameEn: "Death", arcana: "major", upright: "旧阶段的彻底结束与新生，不破不立。", reversed: "抗拒必要的改变，越拖越耗，宜主动告别过去。" },
  { name: "节制", nameEn: "Temperance", arcana: "major", upright: "平衡与调和，耐心融合各方能成佳酿。", reversed: "失衡与极端，宜节制欲望、恢复中道。" },
  { name: "恶魔", nameEn: "The Devil", arcana: "major", upright: "被欲望或依赖束缚，看清枷锁是解脱第一步。", reversed: "挣脱束缚的转机已现，宜果断切断不良牵绊。" },
  { name: "高塔", nameEn: "The Tower", arcana: "major", upright: "突发的动荡打破旧结构，震荡后见真实。", reversed: "勉强维持将倾之局，主动变革好过被动崩塌。" },
  { name: "星星", nameEn: "The Star", arcana: "major", upright: "希望与疗愈，黑暗后的曙光，值得相信未来。", reversed: "信心低落、灵感枯竭，宜先休养再谈远方。" },
  { name: "月亮", nameEn: "The Moon", arcana: "major", upright: "迷雾与不安，直觉可用但真相未明，谨慎前行。", reversed: "迷雾渐散、疑虑澄清，恐惧多为想象。" },
  { name: "太阳", nameEn: "The Sun", arcana: "major", upright: "光明喜悦、成功在望，尽情展现真实自我。", reversed: "快乐被乌云暂时遮挡，成功延迟但并未取消。" },
  { name: "审判", nameEn: "Judgement", arcana: "major", upright: "觉醒与召唤，过往的努力迎来总结算。", reversed: "自我怀疑拖住脚步，宽恕过去才能应答召唤。" },
  { name: "世界", nameEn: "The World", arcana: "major", upright: "圆满达成与阶段完成，享受成果并展望新程。", reversed: "临门一脚未竟，找出缺口补上即可圆满。" },
];

interface SuitSpec {
  zh: string;
  en: string;
  theme: string;
}

const SUITS: SuitSpec[] = [
  { zh: "权杖", en: "Wands", theme: "行动与热情" },
  { zh: "圣杯", en: "Cups", theme: "情感与关系" },
  { zh: "宝剑", en: "Swords", theme: "思维与挑战" },
  { zh: "星币", en: "Pentacles", theme: "财务与现实" },
];

const RANKS: { zh: string; en: string; upright: string; reversed: string }[] = [
  { zh: "一", en: "Ace", upright: "此领域一个纯粹的新起点，能量充沛", reversed: "起步受阻或时机未熟，先蓄力再出发" },
  { zh: "二", en: "Two", upright: "面临抉择或建立平衡，宜权衡后落子", reversed: "犹豫拖延或失衡，久拖不决反成损耗" },
  { zh: "三", en: "Three", upright: "初步成果显现，协作与扩展正当时", reversed: "进展不如预期，检查配合与计划的缝隙" },
  { zh: "四", en: "Four", upright: "稳定与巩固，暂时的安定值得珍惜", reversed: "停滞或守成过度，安逸中暗藏僵化" },
  { zh: "五", en: "Five", upright: "冲突与失落的考验，磨砺中见真章", reversed: "纷争渐息、损失见底，修复期开始" },
  { zh: "六", en: "Six", upright: "度过难关后的顺流，善意与馈赠流动", reversed: "给予与接受失衡，注意公平与边界" },
  { zh: "七", en: "Seven", upright: "坚持立场或盘点评估，考验耐力眼光", reversed: "防御疲惫或评估失准，宜求外部视角" },
  { zh: "八", en: "Eight", upright: "快速进展或勤勉精进，动能正强", reversed: "忙而无功或自困原地，检视方向再发力" },
  { zh: "九", en: "Nine", upright: "接近目标的最后坚持，成果初尝", reversed: "身心俱疲或患得患失，别在最后关头松劲" },
  { zh: "十", en: "Ten", upright: "此领域一个周期的圆满达成", reversed: "圆满背后的负重或收尾拖延，宜卸下再启程" },
  { zh: "侍从", en: "Page", upright: "新消息与学习机会，保持好奇心", reversed: "消息延迟或心浮气躁，基本功再扎实些" },
  { zh: "骑士", en: "Knight", upright: "果敢行动、全速推进的行动力", reversed: "冲过头或半途转向，节奏需要调校" },
  { zh: "王后", en: "Queen", upright: "成熟包容的掌控力，以滋养带动局面", reversed: "情绪内耗或过度操心，先安顿好自己" },
  { zh: "国王", en: "King", upright: "此领域的成熟权威，运筹帷幄", reversed: "刚愎自用或权责失衡，多听少断为宜" },
];

const MINOR: TarotCard[] = SUITS.flatMap((suit) =>
  RANKS.map((rank) => ({
    name: `${suit.zh}${rank.zh}`,
    nameEn: `${rank.en} of ${suit.en}`,
    arcana: "minor" as const,
    upright: `${suit.theme}方面：${rank.upright}。`,
    reversed: `${suit.theme}方面：${rank.reversed}。`,
  })),
);

export const TAROT_DECK: TarotCard[] = [...MAJOR, ...MINOR];

export interface TarotDraw {
  card: TarotCard;
  reversed: boolean;
}

/** 抽一张牌：cardIndex/isReversed 可注入便于测试，默认均匀随机。 */
export function drawCard(cardIndex?: number, isReversed?: boolean): TarotDraw {
  const idx = cardIndex ?? Math.floor(Math.random() * TAROT_DECK.length);
  const card = TAROT_DECK[idx];
  if (!card) throw new Error(`牌序号超出范围：${idx}`);
  return { card, reversed: isReversed ?? Math.random() < 0.5 };
}
