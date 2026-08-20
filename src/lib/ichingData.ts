/** 八卦、六十四卦基础数据。因不同版本对卦辞/爻辞的文字略有出入，
 * 本表不收录逐字的古典卦爻辞，而是提供简明的现代白话主题概括，
 * 避免误引古文；仅供文化参考与娱乐。 */

export type Luck = "good" | "neutral" | "caution";

export interface Trigram {
  name: string;
  symbol: string; // ☰☷ 等
  /** 三爻由下至上，true=阳(实线) false=阴(虚线) */
  lines: [boolean, boolean, boolean];
  element: string;
  nature: string; // 自然意象
}

export const TRIGRAMS: Record<string, Trigram> = {
  乾: { name: "乾", symbol: "☰", lines: [true, true, true], element: "金", nature: "天" },
  兑: { name: "兑", symbol: "☱", lines: [true, true, false], element: "金", nature: "泽" },
  离: { name: "离", symbol: "☲", lines: [true, false, true], element: "火", nature: "火" },
  震: { name: "震", symbol: "☳", lines: [true, false, false], element: "木", nature: "雷" },
  巽: { name: "巽", symbol: "☴", lines: [false, true, true], element: "木", nature: "风" },
  坎: { name: "坎", symbol: "☵", lines: [false, true, false], element: "水", nature: "水" },
  艮: { name: "艮", symbol: "☶", lines: [false, false, true], element: "土", nature: "山" },
  坤: { name: "坤", symbol: "☷", lines: [false, false, false], element: "土", nature: "地" },
};

export const TRIGRAM_ORDER = ["乾", "兑", "离", "震", "巽", "坎", "艮", "坤"];

export interface Hexagram {
  upper: string;
  lower: string;
  name: string;
  summary: string;
  luck: Luck;
}

/** [upper, lower, name, summary, luck]，共 64 条，按先天八卦序排列的方图。 */
const RAW: [string, string, string, string, Luck][] = [
  ["乾", "乾", "乾为天", "刚健自强，宜积极进取，忌骄躁冒进", "good"],
  ["乾", "兑", "天泽履", "如履薄冰，脚踏实地方能行稳", "caution"],
  ["乾", "离", "天火同人", "志同道合，宜团结协作、求同存异", "good"],
  ["乾", "震", "天雷无妄", "守正不妄为，急功近利反招意外", "neutral"],
  ["乾", "巽", "天风姤", "不期而遇，机缘巧合但需防节外生枝", "caution"],
  ["乾", "坎", "天水讼", "易生纷争诉讼，宜息事宁人、避免对簿公堂", "caution"],
  ["乾", "艮", "天山遁", "宜退避韬光，暂避锋芒以待时机", "neutral"],
  ["乾", "坤", "天地否", "上下不通、闭塞难行，宜静待时变", "caution"],
  ["兑", "乾", "泽天夬", "当机立断，决断除弊正当时", "good"],
  ["兑", "兑", "兑为泽", "喜悦交流，人际和顺，宜广结善缘", "good"],
  ["兑", "离", "泽火革", "变革之象，除旧布新但需谨慎推进", "neutral"],
  ["兑", "震", "泽雷随", "顺势而为、随机应变，宜从善如流", "good"],
  ["兑", "巽", "泽风大过", "非常之举，超出常规需量力而行", "caution"],
  ["兑", "坎", "泽水困", "困顿受阻，宜韬光养晦、静待转机", "caution"],
  ["兑", "艮", "泽山咸", "心意相通、彼此感应，利于沟通与结缘", "good"],
  ["兑", "坤", "泽地萃", "人才财物聚集，宜把握时机凝聚力量", "good"],
  ["离", "乾", "火天大有", "大有所获、事业丰盛，宜谦守勿骄", "good"],
  ["离", "兑", "火泽睽", "意见相左、彼此乖离，宜求同存异化解", "caution"],
  ["离", "离", "离为火", "光明附丽，才华得以彰显，宜行事透明", "good"],
  ["离", "震", "火雷噬嗑", "宜刚决果断，排除阻碍、赏罚分明", "neutral"],
  ["离", "巽", "火风鼎", "革故鼎新，气象一新，宜稳中求变", "good"],
  ["离", "坎", "火水未济", "事未竟功，仍需持续努力方可功成", "caution"],
  ["离", "艮", "火山旅", "羁旅漂泊、身处异地，宜谨慎行事、少惹是非", "caution"],
  ["离", "坤", "火地晋", "晋升上进，形势明朗，宜积极表现", "good"],
  ["震", "乾", "雷天大壮", "刚健强盛，然盛极易折，宜壮而不燥", "neutral"],
  ["震", "兑", "雷泽归妹", "婚嫁归属之象，宜循礼而行，勿操之过急", "caution"],
  ["震", "离", "雷火丰", "丰盛盈满，如日中天，宜珍惜当下、防由盛转衰", "good"],
  ["震", "震", "震为雷", "震动惊变，宜临变不乱、修身自省", "neutral"],
  ["震", "巽", "雷风恒", "恒久坚持、持之以恒，宜安守常道", "good"],
  ["震", "坎", "雷水解", "危难化解，否极泰来，宜把握转机", "good"],
  ["震", "艮", "雷山小过", "小事可为，不宜大举妄动，宜谨慎从事", "caution"],
  ["震", "坤", "雷地豫", "欢愉安适，然逸豫易生怠惰，宜居安思危", "neutral"],
  ["巽", "乾", "风天小畜", "蓄势待发、小有积累，宜耐心积蓄待时", "neutral"],
  ["巽", "兑", "风泽中孚", "诚信感通，以诚待人自能感化他人", "good"],
  ["巽", "离", "风火家人", "齐家有道，家庭和睦则内外皆顺", "good"],
  ["巽", "震", "风雷益", "增益进取，宜把握良机、损上益下", "good"],
  ["巽", "巽", "巽为风", "谦逊顺入，宜柔顺行事、循序渐进", "neutral"],
  ["巽", "坎", "风水涣", "涣散离散，人心不聚，宜设法凝聚共识", "caution"],
  ["巽", "艮", "风山渐", "循序渐进，按部就班方能行稳致远", "good"],
  ["巽", "坤", "风地观", "宜静观其变、省察自身，不宜妄动", "neutral"],
  ["坎", "乾", "水天需", "静待时机，欲速则不达，宜耐心等待", "neutral"],
  ["坎", "兑", "水泽节", "宜节制有度，量入为出、适可而止", "neutral"],
  ["坎", "离", "水火既济", "功成圆满，然盛极将转，宜慎终如始", "good"],
  ["坎", "震", "水雷屯", "起始维艰，创业之初多险阻，宜坚韧不拔", "caution"],
  ["坎", "巽", "水风井", "井养不穷，资源共享、泽及他人", "good"],
  ["坎", "坎", "坎为水", "重重险陷，宜谨慎涉险、诚信自守", "caution"],
  ["坎", "艮", "水山蹇", "艰难险阻当前，宜审时度势、暂缓而行", "caution"],
  ["坎", "坤", "水地比", "亲比相助，宜广结良友、精诚团结", "good"],
  ["艮", "乾", "山天大畜", "蓄势养德，厚积薄发，宜积累实力", "good"],
  ["艮", "兑", "山泽损", "损己益人、克己节制，眼前小损换长远之益", "neutral"],
  ["艮", "离", "山火贲", "文饰润色，重外在形象，然勿舍本逐末", "neutral"],
  ["艮", "震", "山雷颐", "颐养修身，宜注重调养、言行有度", "neutral"],
  ["艮", "巽", "山风蛊", "整饬积弊，除旧革新虽费力但利于长久", "caution"],
  ["艮", "坎", "山水蒙", "蒙昧待启，宜虚心求教、启蒙求知", "neutral"],
  ["艮", "艮", "艮为山", "止而不动，宜沉稳自持、见好就收", "neutral"],
  ["艮", "坤", "山地剥", "剥落衰败之象，宜守静待时、不宜妄动", "caution"],
  ["坤", "乾", "地天泰", "上下交泰、通达顺遂，诸事宜积极推进", "good"],
  ["坤", "兑", "地泽临", "居高临下、督导有方，宜以身作则", "good"],
  ["坤", "离", "地火明夷", "光明受损，宜韬光养晦、暗中蓄力", "caution"],
  ["坤", "震", "地雷复", "否极泰来、失而复得，宜把握复苏之机", "good"],
  ["坤", "巽", "地风升", "上升发展，循序而上，宜脚踏实地进取", "good"],
  ["坤", "坎", "地水师", "兴师动众，需名正言顺、纪律严明", "neutral"],
  ["坤", "艮", "地山谦", "谦逊有终，越是谦和越能行稳致远", "good"],
  ["坤", "坤", "坤为地", "柔顺包容，厚德载物，宜以静制动", "good"],
];

export const HEXAGRAMS: Hexagram[] = RAW.map(([upper, lower, name, summary, luck]) => ({
  upper,
  lower,
  name,
  summary,
  luck,
}));

export function findHexagram(upper: string, lower: string): Hexagram {
  const found = HEXAGRAMS.find((h) => h.upper === upper && h.lower === lower);
  if (!found) throw new Error(`未知卦象组合：${upper}/${lower}`);
  return found;
}

/** 由三爻（下中上，true=阳）得到对应的三画卦名。 */
export function trigramFromLines(lines: [boolean, boolean, boolean]): string {
  const entry = Object.values(TRIGRAMS).find(
    (t) => t.lines[0] === lines[0] && t.lines[1] === lines[1] && t.lines[2] === lines[2],
  );
  if (!entry) throw new Error("非法三爻组合");
  return entry.name;
}
