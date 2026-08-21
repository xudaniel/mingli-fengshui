import { describe, expect, it } from "vitest";
import { computeBazi } from "../src/lib/bazi";
import { computeGua } from "../src/lib/bagua";
import { renderVisualSummary } from "../src/views/reportView";
import type { Profile } from "../src/lib/profiles";

function makeProfile(overrides: Partial<Profile> = {}): Profile {
  return {
    id: "p_test",
    label: "测试档案",
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
    createdAt: 0,
    updatedAt: 0,
    ...overrides,
  };
}

describe("renderVisualSummary", () => {
  const bazi = computeBazi({ year: 1990, month: 6, day: 15, hour: 8, minute: 30 }, "male");
  const gua = computeGua(bazi.fengshuiYear, "male");

  it("includes a four-pillars summary and the Eight Mansions compass", () => {
    const html = renderVisualSummary(bazi, gua, makeProfile(), "zh");
    expect(html).toContain("pillars");
    expect(html).toContain("compass");
  });

  it("includes the Zi Wei chart when the profile's hour is known", () => {
    const html = renderVisualSummary(bazi, gua, makeProfile({ hourUnknown: false }), "zh");
    expect(html).toContain("ziwei-chart");
  });

  it("omits the Zi Wei chart (without throwing) when the profile's hour is unknown", () => {
    const html = renderVisualSummary(bazi, gua, makeProfile({ hourUnknown: true }), "zh");
    expect(html).not.toContain("ziwei-chart");
  });

  it("all four pillars are represented in the summary", () => {
    const html = renderVisualSummary(bazi, gua, makeProfile(), "zh");
    for (const p of bazi.pillars) {
      expect(html).toContain(p.ganZhi[0]);
    }
  });
});
