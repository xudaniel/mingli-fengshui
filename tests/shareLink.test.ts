import { describe, expect, it } from "vitest";
import { encodeShareHash, decodeShareHash, type ShareState } from "../src/lib/shareLink";

const base: ShareState = {
  name: "测试",
  gender: "male",
  date: "1990-06-15",
  time: "08:30",
  hourUnknown: false,
  city: "北京",
  longitude: 116.4074,
  utcOffset: 8,
  useTrueSolar: true,
  useEot: true,
};

describe("encodeShareHash / decodeShareHash", () => {
  it("往返编解码还原全部字段", () => {
    const hash = encodeShareHash(base);
    expect(decodeShareHash(hash)).toEqual(base);
  });

  it("支持中文姓名与城市名的正确编码", () => {
    const hash = encodeShareHash({ ...base, name: "张三", city: "杭州" });
    const decoded = decodeShareHash(hash);
    expect(decoded?.name).toBe("张三");
    expect(decoded?.city).toBe("杭州");
  });

  it("时辰不详时不编码具体时间", () => {
    const hash = encodeShareHash({ ...base, hourUnknown: true, time: "08:30" });
    expect(hash).not.toContain("t=08");
    const decoded = decodeShareHash(hash);
    expect(decoded?.hourUnknown).toBe(true);
    expect(decoded?.time).toBe(""); // 与 profiles.ts 的约定一致：时辰不详时 time 为空串
  });

  it("兼容带 # 前缀的 hash", () => {
    const hash = encodeShareHash(base);
    expect(decodeShareHash(`#${hash}`)).toEqual(base);
  });

  it("空、非法或版本不符的 hash 返回 null 而不抛错", () => {
    expect(decodeShareHash("")).toBeNull();
    expect(decodeShareHash("#")).toBeNull();
    expect(decodeShareHash("not a valid hash")).toBeNull();
    expect(decodeShareHash("v=99&d=1990-06-15&c=北京&lo=116&u=8")).toBeNull();
  });

  it("缺少必要字段（日期/城市/经度/时区）时返回 null", () => {
    expect(decodeShareHash("v=1&c=北京&lo=116&u=8")).toBeNull();
    expect(decodeShareHash("v=1&d=1990-06-15&lo=116&u=8")).toBeNull();
  });

  it("女性别与开关字段正确还原", () => {
    const hash = encodeShareHash({ ...base, gender: "female", useTrueSolar: false, useEot: false });
    const decoded = decodeShareHash(hash);
    expect(decoded?.gender).toBe("female");
    expect(decoded?.useTrueSolar).toBe(false);
    expect(decoded?.useEot).toBe(false);
  });
});
