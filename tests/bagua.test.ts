import { describe, expect, it } from "vitest";
import { computeGua } from "../src/lib/bagua";

describe("computeGua 命卦公式", () => {
  it("已知年份对照（与通行命卦表一致）", () => {
    expect(computeGua(1990, "male").name).toBe("坎");
    expect(computeGua(1990, "male").group).toBe("东四命");
    expect(computeGua(1990, "female").name).toBe("艮");
    expect(computeGua(1995, "male").name).toBe("坤");
    expect(computeGua(1995, "male").group).toBe("西四命");
    expect(computeGua(1984, "male").name).toBe("兑");
    expect(computeGua(1984, "female").name).toBe("艮");
    expect(computeGua(2000, "male").name).toBe("离");
    expect(computeGua(2000, "female").name).toBe("乾");
  });

  it("得 5 者男归坤、女归艮（1977）", () => {
    // 1977 → 数字根 6；男 11-6=5 → 坤；女 4+6=10 → 1 坎
    expect(computeGua(1977, "male").name).toBe("坤");
    expect(computeGua(1977, "male").number).toBe(2);
    expect(computeGua(1977, "female").name).toBe("坎");
    // 女得 5 的例子：4+s=5 → s=1，如 1990+... 取 2026: 2+0+2+6=10→1 → 女 4+1=5 → 艮
    expect(computeGua(2026, "female").name).toBe("艮");
    expect(computeGua(2026, "female").number).toBe(8);
  });

  it("八星方位表抽查（坎、乾）", () => {
    const kan = computeGua(1990, "male");
    const star = (name: string) => kan.stars.find((s) => s.name === name)!;
    expect(star("生气").direction).toBe("东南");
    expect(star("天医").direction).toBe("东");
    expect(star("延年").direction).toBe("南");
    expect(star("伏位").direction).toBe("北");
    expect(star("绝命").direction).toBe("西南");
    expect(star("生气").auspicious).toBe(true);
    expect(star("绝命").auspicious).toBe(false);

    const qian = computeGua(2000, "female");
    expect(qian.name).toBe("乾");
    expect(qian.stars.find((s) => s.name === "生气")!.direction).toBe("西");
    expect(qian.stars.find((s) => s.name === "天医")!.direction).toBe("东北");
  });

  it("每卦均有 4 吉 4 凶", () => {
    for (const year of [1970, 1985, 1999, 2010]) {
      for (const g of ["male", "female"] as const) {
        const gua = computeGua(year, g);
        expect(gua.stars).toHaveLength(8);
        expect(gua.stars.filter((s) => s.auspicious)).toHaveLength(4);
        const dirs = new Set(gua.stars.map((s) => s.direction));
        expect(dirs.size).toBe(8);
      }
    }
  });
});
