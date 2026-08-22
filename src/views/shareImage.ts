/** 命盘摘要图片导出：把排盘结果绘制为一张竖版长图，供保存/分享。
 * 纯 Canvas 手绘，不依赖任何图表库；布局基件见 shareCanvas.ts。 */

import type { BaziResult } from "../lib/bazi";
import type { GuaInfo } from "../lib/bagua";
import { ganElement } from "../lib/analysis";
import type { Lang } from "../lib/i18n/state";
import { t } from "../lib/i18n/dict";
import {
  SHARE_COLORS as COLORS,
  SHARE_ELEMENT_COLOR as ELEMENT_COLOR,
  roundRect,
  createShareCanvas,
  drawShareHeader,
  drawShareFooter,
} from "./shareCanvas";

export { downloadCanvas } from "./shareCanvas";

const W = 720;
const H = 1120;

export interface ShareCardMeta {
  name: string;
  cityLabel: string;
  civilLabel: string;
}

export async function renderShareCardCanvas(
  bazi: BaziResult,
  gua: GuaInfo,
  meta: ShareCardMeta,
  lang: Lang,
): Promise<HTMLCanvasElement> {
  const { canvas, ctx } = await createShareCanvas(W, H);

  const PAD = 36;
  const subtitle = `${meta.name ? meta.name + " · " : ""}${meta.cityLabel} · ${meta.civilLabel}`;
  let y = drawShareHeader(ctx, W, t(lang, "app.title"), subtitle);

  // pillars row
  const pillarW = (W - PAD * 2 - 3 * 14) / 4;
  const pillarH = 190;
  bazi.pillars.forEach((p, i) => {
    const px = PAD + i * (pillarW + 14);
    roundRect(ctx, px, y, pillarW, pillarH, 12);
    ctx.fillStyle = COLORS.panel;
    ctx.fill();
    ctx.strokeStyle = COLORS.border;
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.fillStyle = COLORS.textDim;
    ctx.font = "13px 'Noto Sans SC', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(p.label, px + pillarW / 2, y + 26);

    ctx.font = "700 40px 'Noto Serif SC', serif";
    ctx.fillStyle = ELEMENT_COLOR[ganElement(p.gan)];
    ctx.fillText(p.gan, px + pillarW / 2, y + 78);
    ctx.fillStyle = ELEMENT_COLOR[ganElement(p.hiddenStems[0].gan)];
    ctx.fillText(p.zhi, px + pillarW / 2, y + 122);

    ctx.fillStyle = COLORS.textDim;
    ctx.font = "11px 'Noto Sans SC', sans-serif";
    ctx.fillText(p.naYin, px + pillarW / 2, y + 150);
    ctx.fillText(p.shiShen, px + pillarW / 2, y + 170);
  });
  y += pillarH + 36;

  // day master + strength
  ctx.textAlign = "left";
  ctx.fillStyle = COLORS.text;
  ctx.font = "700 18px 'Noto Serif SC', serif";
  ctx.fillText(
    `${t(lang, "result.dayMaster")}：${bazi.dayMaster.gan}（${bazi.dayMaster.element}） · ${bazi.strength.verdict}`,
    PAD,
    y,
  );
  y += 30;

  ctx.font = "14px 'Noto Sans SC', sans-serif";
  ctx.fillStyle = COLORS.textDim;
  ctx.fillText(
    `${t(lang, "strength.favorable")}：${bazi.strength.favorable.join("、") || "--"}　${t(lang, "strength.unfavorable")}：${bazi.strength.unfavorable.join("、") || "--"}`,
    PAD,
    y,
  );
  y += 36;

  // five-element bars
  const barMax = Math.max(...Object.values(bazi.strength.weighted), 1);
  const barAreaW = W - PAD * 2 - 60;
  for (const el of ["木", "火", "土", "金", "水"] as const) {
    const pct = bazi.strength.weighted[el];
    ctx.fillStyle = ELEMENT_COLOR[el];
    ctx.font = "700 15px 'Noto Serif SC', serif";
    ctx.textAlign = "left";
    ctx.fillText(el, PAD, y + 12);

    roundRect(ctx, PAD + 26, y, barAreaW, 12, 6);
    ctx.fillStyle = COLORS.panel;
    ctx.fill();
    const w = Math.max(6, (pct / barMax) * barAreaW);
    roundRect(ctx, PAD + 26, y, w, 12, 6);
    ctx.fillStyle = ELEMENT_COLOR[el];
    ctx.globalAlpha = 0.85;
    ctx.fill();
    ctx.globalAlpha = 1;

    ctx.fillStyle = COLORS.textDim;
    ctx.font = "12px 'Noto Sans SC', sans-serif";
    ctx.textAlign = "right";
    ctx.fillText(`${pct.toFixed(1)}%`, W - PAD, y + 11);
    y += 26;
  }
  y += 20;

  // gua
  roundRect(ctx, PAD, y, W - PAD * 2, 100, 12);
  ctx.fillStyle = COLORS.panel;
  ctx.fill();
  ctx.strokeStyle = COLORS.border;
  ctx.stroke();

  ctx.textAlign = "left";
  ctx.fillStyle = COLORS.gold;
  ctx.font = "700 20px 'Noto Serif SC', serif";
  ctx.fillText(`${gua.name}（${gua.group}）`, PAD + 20, y + 38);

  ctx.fillStyle = COLORS.textDim;
  ctx.font = "13px 'Noto Sans SC', sans-serif";
  const goodStars = gua.stars.filter((s) => s.auspicious).map((s) => s.name + s.direction).join(" · ");
  ctx.fillText(goodStars, PAD + 20, y + 66);
  y += 130;

  // dayun strip (first 6)
  if (bazi.daYun.length) {
    ctx.textAlign = "left";
    ctx.fillStyle = COLORS.text;
    ctx.font = "700 16px 'Noto Serif SC', serif";
    ctx.fillText(t(lang, "dayun.title"), PAD, y);
    y += 24;

    const items = bazi.daYun.slice(0, 6);
    const cellW = (W - PAD * 2 - (items.length - 1) * 8) / items.length;
    items.forEach((d, i) => {
      const cx = PAD + i * (cellW + 8);
      roundRect(ctx, cx, y, cellW, 64, 8);
      ctx.fillStyle = COLORS.panel;
      ctx.fill();
      ctx.textAlign = "center";
      ctx.fillStyle = COLORS.textDim;
      ctx.font = "10px 'Noto Sans SC', sans-serif";
      ctx.fillText(`${d.startAge}-${d.endAge}`, cx + cellW / 2, y + 16);
      ctx.fillStyle = COLORS.text;
      ctx.font = "700 18px 'Noto Serif SC', serif";
      ctx.fillText(d.ganZhi, cx + cellW / 2, y + 42);
    });
    y += 64 + 30;
  }

  drawShareFooter(ctx, W, H);
  return canvas;
}
