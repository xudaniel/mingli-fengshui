import { describe, expect, it } from "vitest";
import { detectTaiSui } from "../src/lib/taisui";

describe("detectTaiSui", () => {
  it("属鼠者 2026（丙午）冲太岁", () => {
    const hits = detectTaiSui("子", 2026, 1);
    expect(hits).toHaveLength(1);
    expect(hits[0]).toMatchObject({ year: 2026, liuNianZhi: "午", kind: "冲太岁" });
  });

  it("属马者 2026（丙午）值太岁", () => {
    const hits = detectTaiSui("午", 2026, 1);
    expect(hits[0].kind).toBe("值太岁");
  });

  it("2020 年为庚子年（锚点校验）", () => {
    const hits = detectTaiSui("子", 2020, 1);
    expect(hits[0]).toMatchObject({ liuNianZhi: "子", kind: "值太岁" });
  });

  it("12 年一轮值太岁恰好出现一次", () => {
    const hits = detectTaiSui("寅", 2024, 12);
    expect(hits.filter((h) => h.kind === "值太岁")).toHaveLength(1);
  });

  it("害太岁与破太岁示例", () => {
    // 子未害
    expect(detectTaiSui("子", 2015, 1)[0]).toMatchObject({ liuNianZhi: "未", kind: "害太岁" });
    // 子酉破
    expect(detectTaiSui("子", 2017, 1)[0]).toMatchObject({ liuNianZhi: "酉", kind: "破太岁" });
  });

  it("寅巳申三刑组内两两判定为刑太岁", () => {
    expect(detectTaiSui("寅", 2025, 1)[0].kind).toBe("刑太岁"); // 2025 乙巳
    expect(detectTaiSui("巳", 2028, 1)[0].kind).toBe("刑太岁"); // 2028 戊申
  });

  it("未知地支时不报错，返回空数组", () => {
    expect(detectTaiSui("怪", 2026, 5)).toEqual([]);
  });
});
