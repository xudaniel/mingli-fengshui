import { describe, expect, it } from "vitest";
import { castLiuYao, castMeiHuaByNumbers, castMeiHuaByTime } from "../src/lib/iching";

describe("castLiuYao", () => {
  it("六阳爻（老阳9）本卦为乾，全部动爻，变卦为坤", () => {
    const r = castLiuYao([9, 9, 9, 9, 9, 9]);
    expect(r.original.name).toBe("乾为天");
    expect(r.movingIndices).toEqual([0, 1, 2, 3, 4, 5]);
    expect(r.changed?.name).toBe("坤为地");
  });

  it("六阴爻（老阴6）本卦为坤，变卦为乾", () => {
    const r = castLiuYao([6, 6, 6, 6, 6, 6]);
    expect(r.original.name).toBe("坤为地");
    expect(r.changed?.name).toBe("乾为天");
  });

  it("少阳少阴（7、8）静爻不产生变卦", () => {
    const r = castLiuYao([7, 8, 7, 8, 7, 8]);
    expect(r.movingIndices).toEqual([]);
    expect(r.changed).toBeNull();
  });

  it("部分动爻时变卦只改变对应爻", () => {
    // 下三爻阳(7)构成乾，上三爻阴(8)构成坤 -> 本卦天地否；第一爻动(9)
    const r = castLiuYao([9, 7, 7, 8, 8, 8]);
    expect(r.original.upper).toBe("坤");
    expect(r.original.lower).toBe("乾");
    expect(r.movingIndices).toEqual([0]);
    // 第一爻（下卦最下）由阳变阴 -> 下卦变为 011=巽
    expect(r.changed?.lower).toBe("巽");
    expect(r.changed?.upper).toBe("坤");
  });

  it("不传参数时使用随机摇卦，仍产出合法结构", () => {
    const r = castLiuYao();
    expect(r.lines).toHaveLength(6);
    expect(r.lines.every((l) => [6, 7, 8, 9].includes(l.value))).toBe(true);
    expect(r.original.name).toBeTruthy();
  });
});

describe("castMeiHuaByNumbers", () => {
  it("数字 1,1 对应乾上乾下（乾为天），动爻为第 2 爻（(1+1) mod 6 = 2）", () => {
    const r = castMeiHuaByNumbers(1, 1);
    expect(r.upperTrigram).toBe("乾");
    expect(r.lowerTrigram).toBe("乾");
    expect(r.hexagram.name).toBe("乾为天");
    expect(r.movingLine).toBe(2);
    expect(r.ti).toBe("upper");
  });

  it("数字超过 8 时按模运算循环取卦", () => {
    const r1 = castMeiHuaByNumbers(9, 9); // 9 mod 8 -> 同 1
    const r2 = castMeiHuaByNumbers(1, 1);
    expect(r1.upperTrigram).toBe(r2.upperTrigram);
    expect(r1.lowerTrigram).toBe(r2.lowerTrigram);
  });

  it("动爻超过 3 时体卦归下卦", () => {
    const r = castMeiHuaByNumbers(1, 5); // sum=6 -> movingLine=6
    expect(r.movingLine).toBe(6);
    expect(r.ti).toBe("lower");
  });
});

describe("castMeiHuaByTime", () => {
  it("已知地支/月/日/时辰产出确定结果", () => {
    const r = castMeiHuaByTime("子", 6, 15, 4);
    // numA = 0+1+6+15 = 22 -> upperIdx = (22-1)%8 = 5 -> 坎
    expect(r.upperTrigram).toBe("坎");
    expect(r.hexagram).toBeTruthy();
  });

  it("非法地支抛出错误", () => {
    expect(() => castMeiHuaByTime("怪", 1, 1, 0)).toThrow();
  });
});
