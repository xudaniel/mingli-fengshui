import { describe, it, expect } from "vitest";
import { computeZiWei } from "../src/lib/ziwei";
import { renderZiweiChartGrid } from "../src/views/ziweiChart";

describe("renderZiweiChartGrid", () => {
  const chart = computeZiWei({ yearGan: "庚", lunarMonth: 5, lunarDay: 13, shiChenIndex: 7 });

  it("renders exactly 12 palace cells plus the center summary cell", () => {
    const html = renderZiweiChartGrid(chart, "zh");
    const cellCount = (html.match(/ziwei-chart-cell/g) || []).length;
    expect(cellCount).toBe(12);
    expect(html).toContain("ziwei-chart-center");
  });

  it("marks the life palace via styling and the body palace via a badge", () => {
    const html = renderZiweiChartGrid(chart, "zh");
    expect(html).toContain("ziwei-chart-life");
    expect(html).toContain("ziwei-badge-body");
  });

  it("annotates a star with its 四化 badge when applicable", () => {
    const huaStar = chart.siHua[0].star;
    const palace = chart.palaces.find((p) => p.stars.includes(huaStar));
    if (palace) {
      const html = renderZiweiChartGrid(chart, "zh");
      expect(html).toContain("ziwei-hua");
    }
  });

  it("includes optional profile/civil-time meta when provided", () => {
    const html = renderZiweiChartGrid(chart, "zh", { profileLabel: "测试档案", civilLabel: "1990-06-15 14:30" });
    expect(html).toContain("测试档案");
    expect(html).toContain("1990-06-15 14:30");
  });

  it("assigns every zhi a unique grid position", () => {
    const html = renderZiweiChartGrid(chart, "zh");
    const positions = [...html.matchAll(/grid-row:(\d);grid-column:(\d)/g)].map((m) => `${m[1]},${m[2]}`);
    expect(new Set(positions).size).toBe(12);
  });
});
