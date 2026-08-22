import { describe, expect, it } from "vitest";
import { analyzeNumberLuck } from "../src/lib/numberLuck";
import { getShuLi } from "../src/lib/wuge";

describe("analyzeNumberLuck", () => {
  it("produces last-2/3/4-digit groupings for an 11-digit phone number", () => {
    const r = analyzeNumberLuck("13800138000");
    expect(r.groups.map((g) => g.label)).toEqual(["末二位", "末三位", "末四位"]);
    expect(r.groups.map((g) => g.digits)).toEqual(["00", "000", "8000"]);
  });

  it("each group's reading matches the shared 81-number table", () => {
    const r = analyzeNumberLuck("8888");
    const last4 = r.groups.find((g) => g.label === "末四位")!;
    expect(last4.sum).toBe(32);
    expect(last4.shuLi).toEqual(getShuLi(32));
  });

  it("skips groupings longer than the input", () => {
    const r = analyzeNumberLuck("66");
    expect(r.groups.map((g) => g.label)).toEqual(["末二位"]);
  });

  it("tolerates spaces and hyphens, rejects non-digit input", () => {
    expect(analyzeNumberLuck("138-0013-8000").input).toBe("13800138000");
    expect(() => analyzeNumberLuck("abc123")).toThrow();
    expect(() => analyzeNumberLuck("1")).toThrow();
    expect(() => analyzeNumberLuck("123456789012345678901")).toThrow();
  });

  it("overall score is in 0-100 and consistent with the verdict bands", () => {
    for (const n of ["13800138000", "8888", "4444", "66"]) {
      const r = analyzeNumberLuck(n);
      expect(r.overallScore).toBeGreaterThanOrEqual(0);
      expect(r.overallScore).toBeLessThanOrEqual(100);
      if (r.overallScore >= 85) expect(r.overallLuck).toBe("大吉");
      if (r.overallScore < 25) expect(r.overallLuck).toBe("大凶");
    }
  });

  it("an all-zero suffix wraps sum 0 into the 81-number table rather than crashing", () => {
    const r = analyzeNumberLuck("10000");
    const last4 = r.groups.find((g) => g.label === "末四位")!;
    expect(last4.sum).toBe(0);
    expect(last4.shuLi.number).toBe(81);
  });
});
