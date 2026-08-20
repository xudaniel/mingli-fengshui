/** 姓名测算（五格剖象法）：天格/人格/地格/外格/总格，配合 81 数理吉凶表。
 * 笔画采用姓名学惯用的康熙字典笔画（与简体书写笔画可能不同）。
 * 数理吉凶表为民间广泛流传的版本，仅供文化参考，重大命名决策请另询专业人士。 */

export type Luck = "大吉" | "吉" | "半吉" | "凶" | "大凶";

/** 81 数理吉凶（1-81），来自民间通行的「熊崎氏姓名学」数理表简化版。 */
const SHU_LI: Record<number, { luck: Luck; meaning: string }> = {
  1: { luck: "大吉", meaning: "太极之数，万物开泰，首领之运" },
  2: { luck: "凶", meaning: "分离之数，根基不稳，进退维谷" },
  3: { luck: "大吉", meaning: "进取之数，名利双收，福运自来" },
  4: { luck: "凶", meaning: "破败之数，多灾多难，宜谨慎行事" },
  5: { luck: "大吉", meaning: "阴阳和合，福禄长寿，家门余庆" },
  6: { luck: "吉", meaning: "安稳之数，天德地祥，继承基业" },
  7: { luck: "吉", meaning: "刚毅之数，独立成功，贵人相助" },
  8: { luck: "吉", meaning: "勤勉之数，意志坚定，努力有成" },
  9: { luck: "凶", meaning: "穷通之数，虽有才华，成败起伏大" },
  10: { luck: "凶", meaning: "终结之数，万事欠缺，宜守成待时" },
  11: { luck: "大吉", meaning: "再起之数，稳健踏实，得享安泰" },
  12: { luck: "凶", meaning: "薄弱之数，意志难达，多陷孤立" },
  13: { luck: "大吉", meaning: "智谋之数，才华出众，能成大器" },
  14: { luck: "凶", meaning: "破财之数，家运不济，宜量入为出" },
  15: { luck: "大吉", meaning: "福寿之数，德高望重，众人推崇" },
  16: { luck: "大吉", meaning: "厚德之数，贵人提携，事业有成" },
  17: { luck: "吉", meaning: "刚健之数，排除万难，突破自立" },
  18: { luck: "吉", meaning: "铁镜之数，权威显达，才略过人" },
  19: { luck: "凶", meaning: "多难之数，虽有才智，命运多舛" },
  20: { luck: "凶", meaning: "空虚之数，事与愿违，宜韬光养晦" },
  21: { luck: "大吉", meaning: "明月之数，独立权威，女性得此尤需刚柔并济" },
  22: { luck: "凶", meaning: "秋草逢霜，志望难伸，宜静待时机" },
  23: { luck: "大吉", meaning: "旭日之数，功名显达，众望所归" },
  24: { luck: "大吉", meaning: "余庆之数，白手成家，财源渐丰" },
  25: { luck: "吉", meaning: "英俊之数，资性英敏，唯need收敛锋芒" },
  26: { luck: "半吉", meaning: "变怪之数，波澜起伏，侠义有为但辛劳" },
  27: { luck: "半吉", meaning: "增长之数，中年得志，晚运宜防意外" },
  28: { luck: "凶", meaning: "阔水浮萍，志高才疏，宜脚踏实地" },
  29: { luck: "吉", meaning: "智谋之数，财力归集，如得权势更佳" },
  30: { luck: "半吉", meaning: "沉浮之数，凭借实力可转危为安" },
  31: { luck: "大吉", meaning: "春日花开，德望兼备，成功可期" },
  32: { luck: "吉", meaning: "侥幸之数，意外得助，宜把握机遇" },
  33: { luck: "大吉", meaning: "旺盛之数，家门隆昌，才华横溢" },
  34: { luck: "凶", meaning: "破家之数，灾难重重，宜谨慎守成" },
  35: { luck: "吉", meaning: "温和之数，才艺出众，宜专精一艺" },
  36: { luck: "半吉", meaning: "波澜之数，义侠心肠但辛苦奔波" },
  37: { luck: "大吉", meaning: "权威之数，独立开创，忠信得人望" },
  38: { luck: "半吉", meaning: "平凡之数，才华虽有，成就有限" },
  39: { luck: "大吉", meaning: "富贵之数，苦尽甘来，权威兼备" },
  40: { luck: "凶", meaning: "退安之数，盛衰无常，宜见好就收" },
  41: { luck: "大吉", meaning: "有德之数，德望兼备，众人敬仰" },
  42: { luck: "半吉", meaning: "苦难之数，多才多艺但专精为要" },
  43: { luck: "半吉", meaning: "散财之数，外表华美，内心多虑" },
  44: { luck: "凶", meaning: "破家之数，多灾多难，宜谨言慎行" },
  45: { luck: "大吉", meaning: "顺风之数，才略英明，克服困难得成功" },
  46: { luck: "凶", meaning: "载宝之数，若无坚忍毅力难渡难关" },
  47: { luck: "大吉", meaning: "开花之数，权威旺盛，事事如意" },
  48: { luck: "吉", meaning: "德智之数，堪为师表，德望兼备" },
  49: { luck: "凶", meaning: "遇难之数，吉凶参半，成败无常" },
  50: { luck: "半吉", meaning: "小舟入海，一成一败，先甲后乙" },
  51: { luck: "半吉", meaning: "盛衰交加，浮沉不定，宜守成待时" },
  52: { luck: "大吉", meaning: "达眼之数，先见之明，事业成功" },
  53: { luck: "半吉", meaning: "外美内苦，表面顺遂，内心多有隐忧" },
  54: { luck: "凶", meaning: "多难之数，纵有才华，命运坎坷" },
  55: { luck: "半吉", meaning: "外美内苦，克服万难方能有成" },
  56: { luck: "凶", meaning: "浪费之数，事与愿违，宜量力而行" },
  57: { luck: "吉", meaning: "努力之数，寒雪逢春，先难后易" },
  58: { luck: "半吉", meaning: "先苦后甘，晚年发达，中年宜坚持" },
  59: { luck: "凶", meaning: "遇难之数，欠缺勇气，难有大成" },
  60: { luck: "凶", meaning: "黑暗之数，无准则行事，宜三思后行" },
  61: { luck: "吉", meaning: "名利之数，双收之象，唯防兄弟不和" },
  62: { luck: "凶", meaning: "衰败之数，基础不稳，事业难展" },
  63: { luck: "大吉", meaning: "如意之数，万物化育，富贵长寿" },
  64: { luck: "凶", meaning: "凋落之数，徒劳无功，宜量力而为" },
  65: { luck: "大吉", meaning: "巨流之数，福寿共照，家运昌隆" },
  66: { luck: "凶", meaning: "内外不和，进退两难，宜以和为贵" },
  67: { luck: "大吉", meaning: "通达之数，事业顺遂，天赋幸运" },
  68: { luck: "吉", meaning: "兴家之数，思虑周详，可获成功" },
  69: { luck: "凶", meaning: "静止之数，动摇不安，宜守静待时" },
  70: { luck: "凶", meaning: "空虚之数，惨淡经营，宜积极求变" },
  71: { luck: "半吉", meaning: "见识之数，具坚忍力方可成功" },
  72: { luck: "半吉", meaning: "先苦后乐，晚年吉庆，中年多辛劳" },
  73: { luck: "吉", meaning: "安乐之数，虽无大志，但可平安一生" },
  74: { luck: "凶", meaning: "愚昧之数，无学无智，宜脚踏实地" },
  75: { luck: "半吉", meaning: "退守之数，进取心弱，宜守成为宜" },
  76: { luck: "凶", meaning: "离散之数，家庭多有波折，宜以和为贵" },
  77: { luck: "半吉", meaning: "先苦后甜，中年前劳碌，晚年得安" },
  78: { luck: "半吉", meaning: "先得后失，宜早做长远打算" },
  79: { luck: "凶", meaning: "劳而无功，缺乏耐性，宜坚持到底" },
  80: { luck: "凶", meaning: "破产之数，凡事看破，宜静心修养" },
  81: { luck: "大吉", meaning: "还本归元，与数理 1 同论，最极之数" },
};

/** 落入 1-81 循环区间（超过 81 则减 80 直至落入区间）。 */
function normalizeShuLi(n: number): number {
  let x = n;
  while (x > 81) x -= 80;
  while (x < 1) x += 81;
  return x;
}

export function getShuLi(n: number): { number: number; luck: Luck; meaning: string } {
  const normalized = normalizeShuLi(n);
  const entry = SHU_LI[normalized] ?? { luck: "半吉" as Luck, meaning: "数理含义待考" };
  return { number: normalized, ...entry };
}

export interface WuGeResult {
  tianGe: number; // 天格
  renGe: number; // 人格
  diGe: number; // 地格
  waiGe: number; // 外格
  zongGe: number; // 总格
}

/** surnameStrokes / givenStrokes 均为按字拆分的笔画数组（如姓「欧阳」两字、名「思远」两字）。 */
export function computeWuGe(surnameStrokes: number[], givenStrokes: number[]): WuGeResult {
  if (surnameStrokes.length === 0 || givenStrokes.length === 0) {
    throw new Error("姓与名均不能为空");
  }

  const tianGe =
    surnameStrokes.length === 1 ? surnameStrokes[0] + 1 : surnameStrokes.reduce((a, b) => a + b, 0);

  const renGe = surnameStrokes[surnameStrokes.length - 1] + givenStrokes[0];

  const diGe =
    givenStrokes.length === 1 ? givenStrokes[0] + 1 : givenStrokes.reduce((a, b) => a + b, 0);

  const zongGe = [...surnameStrokes, ...givenStrokes].reduce((a, b) => a + b, 0);

  // 单姓单名（如「王」「明」二字全名）是五格剖象法的特例：姓与名各只有一字，
  // 内外均无「其余字」可数，此时外格按惯例固定为 2（虚拟的 1+1）。
  const waiGe = surnameStrokes.length === 1 && givenStrokes.length === 1 ? 2 : zongGe - renGe + 1;

  return { tianGe, renGe, diGe, waiGe, zongGe };
}

export interface WuGeReport extends WuGeResult {
  tianGeShuLi: ReturnType<typeof getShuLi>;
  renGeShuLi: ReturnType<typeof getShuLi>;
  diGeShuLi: ReturnType<typeof getShuLi>;
  waiGeShuLi: ReturnType<typeof getShuLi>;
  zongGeShuLi: ReturnType<typeof getShuLi>;
  /** 综合评分：五格中「大吉/吉」占比 */
  goodRatio: number;
}

export function buildWuGeReport(surnameStrokes: number[], givenStrokes: number[]): WuGeReport {
  const g = computeWuGe(surnameStrokes, givenStrokes);
  const tianGeShuLi = getShuLi(g.tianGe);
  const renGeShuLi = getShuLi(g.renGe);
  const diGeShuLi = getShuLi(g.diGe);
  const waiGeShuLi = getShuLi(g.waiGe);
  const zongGeShuLi = getShuLi(g.zongGe);

  const all = [tianGeShuLi, renGeShuLi, diGeShuLi, waiGeShuLi, zongGeShuLi];
  const goodCount = all.filter((s) => s.luck === "大吉" || s.luck === "吉").length;

  return { ...g, tianGeShuLi, renGeShuLi, diGeShuLi, waiGeShuLi, zongGeShuLi, goodRatio: goodCount / all.length };
}
