import { describe, expect, it } from "vitest";
import { detectPeachBlossom } from "../src/lib/peachblossom";

describe("detectPeachBlossom", () => {
  it("申子辰年支查桃花为酉，命中时柱", () => {
    const r = detectPeachBlossom(["申", "寅", "午", "酉"]);
    expect(r.byYearZhi).toBe("酉");
    expect(r.hits).toHaveLength(1);
    expect(r.hits[0]).toMatchObject({ method: "年支", peachZhi: "酉", pillars: [3] });
  });

  it("寅午戌见卯，巳酉丑见午，亥卯未见子", () => {
    expect(detectPeachBlossom(["午", "子", "丑", "寅"]).byYearZhi).toBe("卯");
    expect(detectPeachBlossom(["丑", "子", "丑", "寅"]).byYearZhi).toBe("午");
    expect(detectPeachBlossom(["未", "子", "丑", "寅"]).byYearZhi).toBe("子");
  });

  it("年支与日支同时命中桃花地支时各自列出", () => {
    // 年支申->酉桃花；日支子->酉桃花（同为申子辰组，桃花相同）
    const r = detectPeachBlossom(["申", "酉", "子", "寅"]);
    expect(r.byYearZhi).toBe("酉");
    expect(r.byDayZhi).toBe("酉");
    // 桃花地支相同时只报一次，避免重复
    expect(r.hits).toHaveLength(1);
    expect(r.hits[0].pillars).toEqual([1]);
  });

  it("年支日支分属不同三合组，各自的桃花地支都命中时分别列出", () => {
    // 年支寅(寅午戌组)->卯桃花；日支申(申子辰组)->酉桃花
    const r = detectPeachBlossom(["寅", "卯", "申", "酉"]);
    expect(r.hits).toHaveLength(2);
    expect(r.hits.find((h) => h.method === "年支")).toMatchObject({ peachZhi: "卯", pillars: [1] });
    expect(r.hits.find((h) => h.method === "日支")).toMatchObject({ peachZhi: "酉", pillars: [3] });
  });

  it("未命中桃花地支时 hits 为空数组", () => {
    const r = detectPeachBlossom(["申", "寅", "辰", "巳"]);
    expect(r.byYearZhi).toBe("酉");
    expect(r.hits).toEqual([]);
  });
});
