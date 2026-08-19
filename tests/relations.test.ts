import { describe, expect, it } from "vitest";
import { detectRelations, pillarBadges } from "../src/lib/relations";

const kinds = (branches: string[]) => detectRelations(branches).map((r) => r.kind);

describe("detectRelations", () => {
  it("子午冲、卯酉冲、子卯刑", () => {
    const rels = detectRelations(["子", "午", "卯", "酉"]);
    expect(rels.filter((r) => r.kind === "相冲")).toHaveLength(2);
    expect(rels.filter((r) => r.kind === "相刑")).toHaveLength(1);
    const zimao = rels.find((r) => r.kind === "相刑")!;
    expect(zimao.branches.sort()).toEqual(["卯", "子"].sort());
  });

  it("申子辰三合水局 + 子丑六合", () => {
    const rels = detectRelations(["申", "子", "辰", "丑"]);
    const sanhe = rels.find((r) => r.kind === "三合")!;
    expect(sanhe.element).toBe("水");
    expect(sanhe.pillars).toEqual([0, 1, 2]);
    const liuhe = rels.find((r) => r.kind === "六合")!;
    expect(liuhe.branches.sort()).toEqual(["丑", "子"].sort());
    expect(liuhe.element).toBe("土");
  });

  it("半合须含帝旺中神", () => {
    // 申子半合水（中神子在）、卯未半合木（中神卯在）
    const rels = detectRelations(["申", "子", "卯", "未"]);
    const banhe = rels.filter((r) => r.kind === "半合");
    expect(banhe).toHaveLength(2);
    expect(banhe.map((r) => r.element).sort()).toEqual(["木", "水"].sort());
    // 申辰无中神子 → 不算半合
    expect(kinds(["申", "辰", "寅", "戌"])).not.toContain("半合");
  });

  it("寅卯辰三会木方，附带辰酉合、卯酉冲、卯辰害", () => {
    const rels = detectRelations(["寅", "卯", "辰", "酉"]);
    const sanhui = rels.find((r) => r.kind === "三会")!;
    expect(sanhui.element).toBe("木");
    expect(kinds(["寅", "卯", "辰", "酉"])).toEqual(
      expect.arrayContaining(["三会", "六合", "相冲", "相害"]),
    );
  });

  it("午午自刑、丑戌刑、丑午害", () => {
    const rels = detectRelations(["午", "午", "丑", "戌"]);
    expect(rels.filter((r) => r.kind === "自刑")).toHaveLength(1);
    expect(rels.filter((r) => r.kind === "相刑")).toHaveLength(1); // 丑戌
    expect(rels.filter((r) => r.kind === "相害")).toHaveLength(2); // 两个午 × 丑
  });

  it("丑戌未三刑俱全时追加三刑条目", () => {
    const rels = detectRelations(["丑", "戌", "未", "子"]);
    const sanxing = rels.filter((r) => r.kind === "相刑" && r.pillars.length === 3);
    expect(sanxing).toHaveLength(1);
    expect(sanxing[0].meaning).toContain("三刑");
    // 丑未按冲计，不重复计入两两刑
    expect(rels.filter((r) => r.kind === "相冲")).toHaveLength(1);
  });

  it("平静盘面无关系", () => {
    // 丑卯巳卯：无任何合冲刑害（卯卯不属自刑之列）
    expect(detectRelations(["丑", "卯", "巳", "卯"])).toEqual([]);
  });

  it("缺一字不成三合局", () => {
    // 寅午在而戌缺、申子在而辰缺 → 只算半合，不算三合
    const rels = detectRelations(["寅", "午", "子", "申"]);
    expect(rels.some((r) => r.kind === "三合")).toBe(false);
    expect(rels.filter((r) => r.kind === "半合").map((r) => r.element).sort()).toEqual(
      ["水", "火"].sort(),
    );
  });
});

describe("pillarBadges", () => {
  it("按柱聚合徽标", () => {
    const rels = detectRelations(["子", "午", "卯", "酉"]);
    const badges = pillarBadges(rels);
    expect(badges[0]).toEqual(expect.arrayContaining(["冲", "刑"])); // 子：子午冲 + 子卯刑
    expect(badges[1]).toEqual(["冲"]);
    expect(badges[3]).toEqual(["冲"]);
  });
});
