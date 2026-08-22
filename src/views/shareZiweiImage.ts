/** 紫微斗数图片导出：传统 4x4 十二宫方阵（与 ziweiChart.ts 同一布局约定），
 * 中央区块放五行局与四化摘要。共用 shareCanvas.ts 的视觉基件。 */

import type { ZiWeiChart } from "../lib/ziwei";
import type { Lang } from "../lib/i18n/state";
import { t } from "../lib/i18n/dict";
import {
  SHARE_COLORS as COLORS,
  roundRect,
  createShareCanvas,
  drawShareHeader,
  drawShareFooter,
} from "./shareCanvas";

const W = 720;
const H = 900;

const ZHI = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];

/** zhiIndex -> [row, col]，与 ziweiChart.ts 的 GRID_POSITION 一致。 */
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

export async function renderZiweiShareCanvas(chart: ZiWeiChart, subtitle: string, lang: Lang): Promise<HTMLCanvasElement> {
  const { canvas, ctx } = await createShareCanvas(W, H);
  const startY = drawShareHeader(ctx, W, t(lang, "ziwei.title"), subtitle);

  const PAD = 32;
  const gap = 8;
  const cellW = (W - PAD * 2 - gap * 3) / 4;
  const cellH = 158;

  for (const palace of chart.palaces) {
    const [row, col] = GRID_POSITION[palace.zhiIndex];
    const x = PAD + col * (cellW + gap);
    const y = startY + row * (cellH + gap);
    const isLife = palace.zhiIndex === chart.lifePalaceIndex;

    roundRect(ctx, x, y, cellW, cellH, 10);
    ctx.fillStyle = isLife ? "rgba(216, 180, 106, 0.12)" : COLORS.panel;
    ctx.fill();
    ctx.strokeStyle = isLife ? COLORS.gold : COLORS.border;
    ctx.lineWidth = isLife ? 1.5 : 1;
    ctx.stroke();

    ctx.textAlign = "left";
    ctx.fillStyle = COLORS.gold;
    ctx.font = "12px 'Noto Sans SC', sans-serif";
    const bodyTag = palace.zhiIndex === chart.bodyPalaceIndex ? `（${t(lang, "ziwei.bodyPalace")}）` : "";
    ctx.fillText(`${palace.name}${bodyTag}`, x + 10, y + 20);

    ctx.fillStyle = COLORS.textDim;
    ctx.font = "12px 'Noto Sans SC', sans-serif";
    const stars = palace.stars.length ? palace.stars : ["--"];
    stars.slice(0, 4).forEach((star, i) => {
      ctx.fillText(star, x + 10, y + 44 + i * 20);
    });

    ctx.textAlign = "right";
    ctx.fillStyle = COLORS.text;
    ctx.font = "700 18px 'Noto Serif SC', serif";
    ctx.fillText(palace.zhi, x + cellW - 10, y + cellH - 12);
  }

  // center 2x2 summary
  const cx = PAD + cellW + gap;
  const cy = startY + cellH + gap;
  const centerW = cellW * 2 + gap;
  const centerH = cellH * 2 + gap;
  ctx.textAlign = "center";
  ctx.fillStyle = COLORS.gold;
  ctx.font = "700 22px 'Noto Serif SC', serif";
  ctx.fillText(chart.ju.name, cx + centerW / 2, cy + centerH / 2 - 16);
  ctx.fillStyle = COLORS.textDim;
  ctx.font = "13px 'Noto Sans SC', sans-serif";
  ctx.fillText(chart.siHua.map((s) => `${s.star}${s.type}`).join(" · "), cx + centerW / 2, cy + centerH / 2 + 14);

  drawShareFooter(ctx, W, H);
  return canvas;
}
