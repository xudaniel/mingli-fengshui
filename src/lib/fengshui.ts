import type { Element } from "./bazi";
import { ELEMENTS } from "./bazi";

export interface ElementProfile {
  direction: string;
  color: string;
  material: string;
  homeTip: string;
}

export const ELEMENT_PROFILE: Record<Element, ElementProfile> = {
  木: {
    direction: "正东、东南",
    color: "绿色、青色",
    material: "木质家具、绿植",
    homeTip: "在东侧或书房摆放绿植、原木家具，多用条纹与竖线条布置",
  },
  火: {
    direction: "正南",
    color: "红色、紫色、橙色",
    material: "灯饰、尖形装饰、木制品",
    homeTip: "南侧加强采光或暖色调灯饰，可用三角形、尖顶造型的摆件",
  },
  土: {
    direction: "东北、西南、中宫",
    color: "黄色、棕色、米色",
    material: "陶瓷、石材、方形器物",
    homeTip: "中央区域保持整洁厚实，选用陶瓷、方形陈设，忌杂乱堆放",
  },
  金: {
    direction: "正西、西北",
    color: "白色、金色、银色",
    material: "金属摆件、圆形器物",
    homeTip: "西侧可摆放金属或圆形装饰，颜色以白、金、银为主",
  },
  水: {
    direction: "正北",
    color: "黑色、蓝色、灰色",
    material: "水景、玻璃、波浪线条",
    homeTip: "北侧宜静不宜动，可用流水摆件或蓝黑色调点缀，避免正对卧室床头",
  },
};

export interface FengshuiAdvice {
  strong: Element[];
  weak: Element[];
  favorable: Element[];
  summary: string;
}

/** Very simplified 用神-style heuristic: elements that appear 0–1 times among
 * the eight characters are treated as "weak" and worth reinforcing through
 * environment/color; elements appearing 3+ times are "strong" and worth
 * tempering. This is a popular simplification, not a substitute for a full
 * professional 八字 analysis (which also weighs season, combinations, and
 * clashes). */
export function deriveFengshuiAdvice(
  counts: Record<Element, number>,
): FengshuiAdvice {
  const strong = ELEMENTS.filter((e) => counts[e] >= 3);
  const weak = ELEMENTS.filter((e) => counts[e] <= 1);
  const favorable = weak;

  const parts: string[] = [];
  if (weak.length > 0) {
    parts.push(`八字中「${weak.join("、")}」偏弱，可通过方位、颜色与家居布置适度补强。`);
  }
  if (strong.length > 0) {
    parts.push(`「${strong.join("、")}」偏旺，居家布置上宜适度节制、避免再加强。`);
  }
  if (weak.length === 0 && strong.length === 0) {
    parts.push("五行分布较为均衡，居家布置以整洁协调、五行不偏废为宜。");
  }

  return { strong, weak, favorable, summary: parts.join(" ") };
}
