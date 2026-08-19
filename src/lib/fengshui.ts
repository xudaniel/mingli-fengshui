import type { Element } from "./analysis";
import type { StrengthAnalysis } from "./analysis";

export interface ElementProfile {
  direction: string;
  color: string;
  material: string;
  number: string;
  season: string;
  homeTip: string;
  avoidTip: string;
}

export const ELEMENT_PROFILE: Record<Element, ElementProfile> = {
  木: {
    direction: "正东、东南",
    color: "绿色、青色",
    material: "木质家具、绿植、藤编、棉麻",
    number: "3、8",
    season: "春",
    homeTip: "在东侧或书房摆放绿植、原木家具，多用条纹与竖线条布置；衣着可多用青绿色系",
    avoidTip: "少用金属冷色调压制木气，避免在东方位放置大件金属器物",
  },
  火: {
    direction: "正南",
    color: "红色、紫色、橙色",
    material: "灯饰、蜡烛、尖形装饰、皮革",
    number: "2、7",
    season: "夏",
    homeTip: "南侧加强采光或暖色调灯饰，可用三角形、尖顶造型的摆件；衣着可点缀红紫色",
    avoidTip: "避免南方位积水、摆放鱼缸等水气重物压制火气",
  },
  土: {
    direction: "东北、西南、中宫",
    color: "黄色、棕色、米色",
    material: "陶瓷、石材、玉器、方形器物",
    number: "5、10",
    season: "四季末（辰戌丑未月）",
    homeTip: "中央区域保持整洁厚实，选用陶瓷、方形陈设，忌杂乱堆放；衣着可用大地色系",
    avoidTip: "避免中宫与西南、东北长期堆放绿植木器耗泄土气",
  },
  金: {
    direction: "正西、西北",
    color: "白色、金色、银色",
    material: "金属摆件、铜器、圆形器物",
    number: "4、9",
    season: "秋",
    homeTip: "西侧可摆放金属或圆形装饰，颜色以白、金、银为主；佩戴金银饰品亦有助益",
    avoidTip: "避免西、西北方位常年点灯烛或用大面积红色压制金气",
  },
  水: {
    direction: "正北",
    color: "黑色、蓝色、灰色",
    material: "水景、玻璃、镜面、波浪线条",
    number: "1、6",
    season: "冬",
    homeTip: "北侧宜静不宜动，可用流水摆件或蓝黑色调点缀，避免正对卧室床头；衣着可用蓝黑色系",
    avoidTip: "避免北方位堆土石重物、大面积黄褐色装饰克制水气",
  },
};

export interface FengshuiAdvice {
  favorable: Element[];
  unfavorable: Element[];
  summary: string;
}

/** 由日主强弱分析导出的喜忌五行建议。 */
export function deriveFengshuiAdvice(strength: StrengthAnalysis): FengshuiAdvice {
  const { favorable, unfavorable } = strength;
  const summary =
    `${strength.reasoning} ` +
    `日常可从方位、颜色、材质入手补「${favorable.join("、")}」，` +
    `并尽量避免过度强化「${unfavorable.join("、")}」。`;
  return { favorable, unfavorable, summary };
}
