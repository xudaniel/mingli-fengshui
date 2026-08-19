/** 住宅宅卦：由住宅朝向（大门/采光面所朝方向）推算坐山与宅卦，
 * 并与本人命卦对照给出宅命相配建议。 */

import { buildGuaInfo, type Direction, type GuaInfo } from "./bagua";

export const OPPOSITE: Record<Direction, Direction> = {
  北: "南", 南: "北", 东: "西", 西: "东",
  东南: "西北", 西北: "东南", 东北: "西南", 西南: "东北",
};

/** 坐山方向 → 宅卦数（后天八卦标准对应） */
const SITTING_TO_GUA: Record<Direction, number> = {
  北: 1, 西南: 2, 东: 3, 东南: 4, 南: 9, 西北: 6, 西: 7, 东北: 8,
};

export interface HouseGuaResult {
  facing: Direction;
  sitting: Direction;
  gua: GuaInfo;
}

/** 依朝向（住宅正面/大门朝向）推算宅卦；坐山 = 朝向的正对面。 */
export function computeHouseGua(facing: Direction): HouseGuaResult {
  const sitting = OPPOSITE[facing];
  const guaNumber = SITTING_TO_GUA[sitting];
  return { facing, sitting, gua: buildGuaInfo(guaNumber) };
}

export interface HouseMatch {
  sameGroup: boolean;
  personGroup: GuaInfo["group"];
  houseGroup: GuaInfo["group"];
  summary: string;
}

/** 宅命相配判断：命卦与宅卦是否同属东四命/西四命组。 */
export function matchHouseToPerson(personGua: GuaInfo, houseGua: GuaInfo): HouseMatch {
  const sameGroup = personGua.group === houseGua.group;
  const summary = sameGroup
    ? `您的命卦（${personGua.name}，${personGua.group}）与宅卦（${houseGua.name}，${houseGua.group}）同组，宅命相配，居住此宅较为有利。`
    : `您的命卦（${personGua.name}，${personGua.group}）与宅卦（${houseGua.name}，${houseGua.group}）不同组，宅命不完全相配。可通过调整床位、办公位落在个人吉方，玄关、屏风等软装缓解，不必因此断定不宜居住。`;
  return { sameGroup, personGroup: personGua.group, houseGroup: houseGua.group, summary };
}

const ROOM_SUGGESTIONS_ZH: Record<string, string> = {
  生气: "大门、玄关、客厅、办公桌",
  天医: "卧室、厨房、疗养休息区",
  延年: "主卧、餐厅、家庭活动区",
  伏位: "书房、静修/冥想区",
  祸害: "储物间、卫浴等次要空间",
  五鬼: "厨房（以火压之）或杂物间",
  六煞: "卫浴、走道等过渡空间",
  绝命: "尽量不作卧室或大门；可作储物间",
};

const ROOM_SUGGESTIONS_EN: Record<string, string> = {
  生气: "Main door, entryway, living room, or desk",
  天医: "Bedroom, kitchen, or a rest/recovery area",
  延年: "Primary bedroom, dining room, or family space",
  伏位: "Study or meditation space",
  祸害: "Storage or bathroom — a secondary space",
  五鬼: "Kitchen (fire suppresses it) or storage",
  六煞: "Bathroom or hallway — a transitional space",
  绝命: "Avoid for the bedroom or main door; storage is fine",
};

export function roomSuggestionFor(starName: string, lang: "zh" | "en" = "zh"): string {
  return (lang === "en" ? ROOM_SUGGESTIONS_EN : ROOM_SUGGESTIONS_ZH)[starName] ?? "";
}
