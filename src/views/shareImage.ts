/** 命盘摘要图片导出：把排盘结果绘制为一张竖版长图，供保存/分享。
 * 纯 Canvas 手绘，不依赖任何图表库；导出前等待自定义字体加载完成。 */

import type { BaziResult } from "../lib/bazi";
import type { GuaInfo } from "../lib/bagua";
import { ganElement } from "../lib/analysis";
import type { Lang } from "../lib/i18n/state";
import { t } from "../lib/i18n/dict";

const COLORS = {
  bg: "#100e13",
  panel: "#18151d",
  border: "#322c3a",
  text: "#e9e4f0",
  textDim: "#a89fb5",
  gold: "#d8b46a",
  wood: "#6fae5c",
  fire: "#c65a4a",
  earth: "#c79a4b",
  metal: "#cfcfd6",
  water: "#5b8dc2",
} as const;

const ELEMENT_COLOR: Record<string, string> = {
  木: COLORS.wood,
  火: COLORS.fire,
  土: COLORS.earth,
  金: COLORS.metal,
  水: COLORS.water,
};

const W = 720;
const H = 1120;
const SCALE = 2; // 2x for crisp export

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

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
  if (typeof document !== "undefined" && "fonts" in document) {
    try {
      await document.fonts.ready;
    } catch {
      // ignore — fall back to default fonts
    }
  }

  const canvas = document.createElement("canvas");
  canvas.width = W * SCALE;
  canvas.height = H * SCALE;
  const ctx = canvas.getContext("2d")!;
  ctx.scale(SCALE, SCALE);

  // background
  const grad = ctx.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, "#151119");
  grad.addColorStop(1, COLORS.bg);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  const PAD = 36;
  let y = 56;

  // title
  ctx.fillStyle = COLORS.gold;
  ctx.font = "700 30px 'Noto Serif SC', serif";
  ctx.textAlign = "center";
  ctx.fillText(t(lang, "app.title"), W / 2, y);
  y += 34;

  ctx.fillStyle = COLORS.textDim;
  ctx.font = "15px 'Noto Sans SC', sans-serif";
  const subtitle = `${meta.name ? meta.name + " · " : ""}${meta.cityLabel} · ${meta.civilLabel}`;
  ctx.fillText(subtitle, W / 2, y);
  y += 44;

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

  // footer watermark
  ctx.textAlign = "center";
  ctx.fillStyle = COLORS.textDim;
  ctx.font = "12px 'Noto Sans SC', sans-serif";
  ctx.fillText("mingli-fengshui · xudaniel.github.io/mingli-fengshui", W / 2, H - 24);

  return canvas;
}

export function downloadCanvas(canvas: HTMLCanvasElement, filename: string): void {
  canvas.toBlob((blob) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }, "image/png");
}
