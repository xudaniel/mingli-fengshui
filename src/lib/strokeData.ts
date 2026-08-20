/** 姓名学笔画字典（康熙字典笔画，姓名学惯例与简体书写笔画可能不同）。
 * 覆盖常见姓氏与常用起名用字，非详尽字典；未收录的字需用户自行查证笔画后
 * 使用「自定义笔画」输入。 */

import type { Element } from "./analysis";

/** 常见姓氏笔画（约 120 个常见姓，含部分复姓）。 */
export const SURNAME_STROKES: Record<string, number> = {
  王: 4, 李: 7, 张: 11, 刘: 15, 陈: 16, 杨: 13, 黄: 12, 赵: 14, 周: 8, 吴: 7,
  徐: 10, 孙: 10, 马: 10, 朱: 6, 胡: 11, 郭: 15, 何: 7, 高: 10, 林: 8, 罗: 20,
  郑: 19, 梁: 11, 谢: 17, 宋: 7, 唐: 10, 许: 11, 韩: 17, 冯: 12, 邓: 19, 曹: 11,
  彭: 12, 曾: 12, 萧: 18, 田: 5, 董: 15, 袁: 10, 潘: 16, 于: 3, 蒋: 17, 蔡: 17,
  余: 7, 杜: 7, 叶: 15, 程: 12, 苏: 22, 魏: 18, 吕: 7, 丁: 2, 任: 6, 沈: 8,
  姚: 9, 卢: 16, 姜: 9, 崔: 11, 钟: 17, 谭: 19, 陆: 16, 汪: 8, 范: 15, 金: 8,
  石: 5, 廖: 14, 贾: 13, 夏: 10, 韦: 9, 傅: 12, 方: 4, 白: 5, 邹: 17, 孟: 8,
  熊: 14, 秦: 10, 邱: 12, 江: 7, 尹: 4, 薛: 19, 闫: 10, 段: 9, 雷: 13, 侯: 9,
  龙: 16, 史: 5, 陶: 16, 黎: 15, 贺: 12, 顾: 21, 毛: 4, 郝: 14, 龚: 22, 邵: 12,
  万: 15, 钱: 16, 严: 20, 覆: 18, 戴: 18, 莫: 13, 孔: 4, 向: 6, 常: 11, 汤: 12,
  康: 11, 易: 8, 乔: 12, 贲: 12, 尤: 4, 单: 12, 欧阳: 20, 司马: 21, 上官: 11, 诸葛: 27,
};

export interface GivenCharEntry {
  char: string;
  strokes: number;
  element: Element;
}

/** 常用起名用字，按五行归类（约 160 字），供起名建议筛选使用。 */
export const GIVEN_CHARS: GivenCharEntry[] = [
  // 木
  { char: "林", strokes: 8, element: "木" }, { char: "森", strokes: 12, element: "木" },
  { char: "桐", strokes: 10, element: "木" }, { char: "梓", strokes: 11, element: "木" },
  { char: "杰", strokes: 12, element: "木" }, { char: "松", strokes: 8, element: "木" },
  { char: "楠", strokes: 13, element: "木" }, { char: "柏", strokes: 9, element: "木" },
  { char: "槿", strokes: 15, element: "木" }, { char: "荣", strokes: 14, element: "木" },
  { char: "芷", strokes: 8, element: "木" }, { char: "萱", strokes: 15, element: "木" },
  { char: "蕾", strokes: 19, element: "木" }, { char: "芸", strokes: 10, element: "木" },
  { char: "若", strokes: 11, element: "木" }, { char: "茗", strokes: 12, element: "木" },
  { char: "楚", strokes: 13, element: "木" }, { char: "枫", strokes: 13, element: "木" },
  { char: "杭", strokes: 8, element: "木" }, { char: "梁", strokes: 11, element: "木" },
  { char: "策", strokes: 12, element: "木" }, { char: "颜", strokes: 18, element: "木" },
  { char: "群", strokes: 13, element: "木" }, { char: "建", strokes: 9, element: "木" },
  // 火
  { char: "炎", strokes: 8, element: "火" }, { char: "烨", strokes: 16, element: "火" },
  { char: "煜", strokes: 13, element: "火" }, { char: "灿", strokes: 17, element: "火" },
  { char: "晴", strokes: 12, element: "火" }, { char: "彤", strokes: 7, element: "火" },
  { char: "昱", strokes: 9, element: "火" }, { char: "旭", strokes: 6, element: "火" },
  { char: "晓", strokes: 16, element: "火" }, { char: "阳", strokes: 17, element: "火" },
  { char: "曦", strokes: 20, element: "火" }, { char: "焱", strokes: 12, element: "火" },
  { char: "丹", strokes: 4, element: "火" }, { char: "南", strokes: 9, element: "火" },
  { char: "礼", strokes: 18, element: "火" }, { char: "智", strokes: 12, element: "火" },
  { char: "灵", strokes: 24, element: "火" }, { char: "夏", strokes: 10, element: "火" },
  { char: "离", strokes: 19, element: "火" }, { char: "晗", strokes: 12, element: "火" },
  { char: "焕", strokes: 13, element: "火" }, { char: "炜", strokes: 13, element: "火" },
  // 土
  { char: "坤", strokes: 8, element: "土" }, { char: "垚", strokes: 9, element: "土" },
  { char: "培", strokes: 11, element: "土" }, { char: "均", strokes: 7, element: "土" },
  { char: "圣", strokes: 13, element: "土" }, { char: "城", strokes: 10, element: "土" },
  { char: "堂", strokes: 11, element: "土" }, { char: "山", strokes: 3, element: "土" },
  { char: "岩", strokes: 8, element: "土" }, { char: "岳", strokes: 8, element: "土" },
  { char: "峰", strokes: 10, element: "土" }, { char: "峻", strokes: 10, element: "土" },
  { char: "嵩", strokes: 13, element: "土" }, { char: "壮", strokes: 7, element: "土" },
  { char: "垒", strokes: 9, element: "土" }, { char: "垣", strokes: 9, element: "土" },
  { char: "圭", strokes: 6, element: "土" }, { char: "地", strokes: 6, element: "土" },
  { char: "辰", strokes: 7, element: "土" }, { char: "维", strokes: 14, element: "土" },
  { char: "坚", strokes: 11, element: "土" }, { char: "增", strokes: 15, element: "土" },
  // 金
  { char: "锐", strokes: 15, element: "金" }, { char: "鑫", strokes: 24, element: "金" },
  { char: "铭", strokes: 14, element: "金" }, { char: "钊", strokes: 10, element: "金" },
  { char: "锋", strokes: 15, element: "金" }, { char: "钦", strokes: 12, element: "金" },
  { char: "锦", strokes: 16, element: "金" }, { char: "钧", strokes: 12, element: "金" },
  { char: "银", strokes: 14, element: "金" }, { char: "铮", strokes: 15, element: "金" },
  { char: "刚", strokes: 10, element: "金" }, { char: "劲", strokes: 9, element: "金" },
  { char: "锡", strokes: 16, element: "金" }, { char: "钰", strokes: 13, element: "金" },
  { char: "西", strokes: 6, element: "金" }, { char: "秋", strokes: 9, element: "金" },
  { char: "锟", strokes: 15, element: "金" }, { char: "钟", strokes: 17, element: "金" },
  { char: "兑", strokes: 7, element: "金" }, { char: "锴", strokes: 14, element: "金" },
  { char: "钲", strokes: 12, element: "金" }, { char: "锜", strokes: 16, element: "金" },
  // 水
  { char: "涵", strokes: 12, element: "水" }, { char: "泽", strokes: 17, element: "水" },
  { char: "洋", strokes: 10, element: "水" }, { char: "淼", strokes: 12, element: "水" },
  { char: "沐", strokes: 8, element: "水" }, { char: "澈", strokes: 16, element: "水" },
  { char: "润", strokes: 16, element: "水" }, { char: "清", strokes: 12, element: "水" },
  { char: "波", strokes: 9, element: "水" }, { char: "涛", strokes: 18, element: "水" },
  { char: "海", strokes: 11, element: "水" }, { char: "江", strokes: 7, element: "水" },
  { char: "河", strokes: 9, element: "水" }, { char: "湖", strokes: 13, element: "水" },
  { char: "霖", strokes: 16, element: "水" }, { char: "雨", strokes: 8, element: "水" },
  { char: "雪", strokes: 11, element: "水" }, { char: "冰", strokes: 6, element: "水" },
  { char: "泉", strokes: 9, element: "水" }, { char: "淇", strokes: 12, element: "水" },
  { char: "澜", strokes: 21, element: "水" }, { char: "潇", strokes: 22, element: "水" },
];

/** 常见姓氏笔画查询；未收录返回 null，调用方应引导用户手动输入笔画。 */
export function lookupSurnameStrokes(surname: string): number[] | null {
  if (SURNAME_STROKES[surname] !== undefined) return [SURNAME_STROKES[surname]];
  const chars = [...surname];
  const strokes = chars.map((c) => SURNAME_STROKES[c]);
  if (strokes.some((s) => s === undefined)) return null;
  return strokes as number[];
}

const GIVEN_CHAR_MAP: Record<string, GivenCharEntry> = Object.fromEntries(
  GIVEN_CHARS.map((e) => [e.char, e]),
);

export function lookupGivenCharStrokes(chars: string): number[] | null {
  const list = [...chars];
  const strokes = list.map((c) => GIVEN_CHAR_MAP[c]?.strokes);
  if (strokes.some((s) => s === undefined)) return null;
  return strokes as number[];
}

/** Single-character stroke lookup across both the surname and given-name
 * dictionaries, used to drive the manual-entry fallback for characters
 * neither dictionary covers. */
export function lookupCharStrokes(char: string): number | undefined {
  return SURNAME_STROKES[char] ?? GIVEN_CHAR_MAP[char]?.strokes;
}

export function charsByElement(element: Element): GivenCharEntry[] {
  return GIVEN_CHARS.filter((e) => e.element === element);
}
