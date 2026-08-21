/** Renders a Zi Wei chart in the traditional 4x4 twelve-palace layout (palaces
 * ring the border starting at 巳 top-left and following the forward zhi order
 * clockwise; the center 2x2 holds the bureau/profile summary) instead of a
 * plain flat grid — matches how real Zi Wei software lays the chart out. */

import type { ZiWeiChart } from "../lib/ziwei";
import { t } from "../lib/i18n/dict";
import type { Lang } from "../lib/i18n/state";

const ZHI = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];

/** zhiIndex -> [row, col] in the 4x4 grid, per the layout described above. */
const GRID_POSITION: Record<number, [number, number]> = {
  [ZHI.indexOf("巳")]: [0, 0],
  [ZHI.indexOf("午")]: [0, 1],
  [ZHI.indexOf("未")]: [0, 2],
  [ZHI.indexOf("申")]: [0, 3],
  [ZHI.indexOf("酉")]: [1, 3],
  [ZHI.indexOf("戌")]: [2, 3],
  [ZHI.indexOf("亥")]: [3, 3],
  [ZHI.indexOf("子")]: [3, 2],
  [ZHI.indexOf("丑")]: [3, 1],
  [ZHI.indexOf("寅")]: [3, 0],
  [ZHI.indexOf("卯")]: [2, 0],
  [ZHI.indexOf("辰")]: [1, 0],
};

const SI_HUA_BADGE: Record<string, string> = {
  化禄: "禄",
  化权: "权",
  化科: "科",
  化忌: "忌",
};

export interface ZiweiChartMeta {
  profileLabel?: string;
  civilLabel?: string;
}

export function renderZiweiChartGrid(chart: ZiWeiChart, lang: Lang, meta: ZiweiChartMeta = {}): string {
  const siHuaByStar = new Map(chart.siHua.map((s) => [s.star, s.type]));

  const cells = chart.palaces
    .map((palace) => {
      const [row, col] = GRID_POSITION[palace.zhiIndex];
      const isLife = palace.zhiIndex === chart.lifePalaceIndex;
      const isBody = palace.zhiIndex === chart.bodyPalaceIndex;
      const stars = palace.stars.length
        ? palace.stars
            .map((star) => {
              const hua = siHuaByStar.get(star);
              return hua ? `${star}<span class="ziwei-hua">${SI_HUA_BADGE[hua]}</span>` : star;
            })
            .join("、")
        : "--";
      // The life palace's name is always literally "命宫" by construction, so a
      // life-palace badge would just repeat it — the gold border already marks it.
      const badges = isBody ? `<span class="ziwei-badge ziwei-badge-body">${t(lang, "ziwei.bodyPalace")}</span>` : "";
      return `
        <div class="ziwei-chart-cell${isLife ? " ziwei-chart-life" : ""}" style="grid-row:${row + 1};grid-column:${col + 1}">
          <div class="ziwei-chart-head">
            <span class="ziwei-chart-name">${palace.name}</span>
            ${badges}
          </div>
          <div class="ziwei-chart-stars">${stars}</div>
          <div class="ziwei-chart-zhi">${palace.zhi}</div>
        </div>`;
    })
    .join("");

  return `
    <div class="ziwei-chart">
      ${cells}
      <div class="ziwei-chart-center">
        ${meta.profileLabel ? `<div class="ziwei-chart-center-label">${meta.profileLabel}</div>` : ""}
        ${meta.civilLabel ? `<div class="ziwei-chart-center-sub">${meta.civilLabel}</div>` : ""}
        <div class="ziwei-chart-center-ju">${chart.ju.name}</div>
        <div class="ziwei-chart-center-sihua">${chart.siHua.map((s) => `${s.star}${s.type}`).join(" · ")}</div>
      </div>
    </div>`;
}
