import { describe, expect, it } from "vitest";
import { computeHouseGua, matchHouseToPerson, roomSuggestionFor } from "../src/lib/houseGua";
import { computeGua } from "../src/lib/bagua";

describe("computeHouseGua", () => {
  it("坐北朝南 → 坎宅", () => {
    const r = computeHouseGua("南");
    expect(r.sitting).toBe("北");
    expect(r.gua.name).toBe("坎");
    expect(r.gua.group).toBe("东四命");
  });

  it("坐南朝北 → 离宅", () => {
    const r = computeHouseGua("北");
    expect(r.sitting).toBe("南");
    expect(r.gua.name).toBe("离");
  });

  it("坐东朝西 → 震宅；坐西朝东 → 兑宅", () => {
    expect(computeHouseGua("西").gua.name).toBe("震");
    expect(computeHouseGua("东").gua.name).toBe("兑");
  });

  it("八个朝向均能得出唯一宅卦且方位表完整", () => {
    const facings: Array<Parameters<typeof computeHouseGua>[0]> = [
      "北", "东北", "东", "东南", "南", "西南", "西", "西北",
    ];
    const names = new Set(facings.map((f) => computeHouseGua(f).gua.name));
    expect(names.size).toBe(8);
    for (const f of facings) {
      expect(computeHouseGua(f).gua.stars).toHaveLength(8);
    }
  });
});

describe("matchHouseToPerson", () => {
  it("同组时 sameGroup 为真", () => {
    const person = computeGua(1990, "male"); // 坎，东四命
    const house = computeHouseGua("南").gua; // 坎宅，东四命
    const m = matchHouseToPerson(person, house);
    expect(m.sameGroup).toBe(true);
  });

  it("不同组时 sameGroup 为假且给出缓解建议文案", () => {
    const person = computeGua(1990, "male"); // 东四命
    const house = computeHouseGua("东").gua; // 兑宅，西四命
    const m = matchHouseToPerson(person, house);
    expect(m.sameGroup).toBe(false);
    expect(m.summary).toContain("不完全相配");
  });
});

describe("roomSuggestionFor", () => {
  it("已知吉凶星均有对应房间建议", () => {
    for (const star of ["生气", "天医", "延年", "伏位", "祸害", "五鬼", "六煞", "绝命"]) {
      expect(roomSuggestionFor(star)).not.toBe("");
    }
  });
});
