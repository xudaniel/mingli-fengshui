/** 姓名五格图片导出：五格数理表 + 综合占比，共用 shareCanvas.ts 视觉基件。 */

import type { WuGeReport } from "../lib/wuge";
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
const H = 640;

const LUCK_COLOR: Record<string, string> = {
  大吉: "#7fc86d",
  吉: "#7fc86d",
  半吉: COLORS.gold,
  凶: "#d07a6e",
  大凶: "#d07a6e",
};

export async function renderNamingShareCanvas(fullName: string, report: WuGeReport, lang: Lang): Promise<HTMLCanvasElement> {
  const { canvas, ctx } = await createShareCanvas(W, H);
  let y = drawShareHeader(ctx, W, fullName, t(lang, "naming.title"));

  const PAD = 40;
  const rows: { label: string; n: number; shuLi: WuGeReport["tianGeShuLi"] }[] = [
    { label: "天格", n: report.tianGe, shuLi: report.tianGeShuLi },
    { label: "人格", n: report.renGe, shuLi: report.renGeShuLi },
    { label: "地格", n: report.diGe, shuLi: report.diGeShuLi },
    { label: "外格", n: report.waiGe, shuLi: report.waiGeShuLi },
    { label: "总格", n: report.zongGe, shuLi: report.zongGeShuLi },
  ];

  for (const row of rows) {
    roundRect(ctx, PAD, y, W - PAD * 2, 62, 10);
    ctx.fillStyle = COLORS.panel;
    ctx.fill();
    ctx.strokeStyle = COLORS.border;
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.textAlign = "left";
    ctx.fillStyle = COLORS.gold;
    ctx.font = "700 17px 'Noto Serif SC', serif";
    ctx.fillText(row.label, PAD + 18, y + 27);

    ctx.fillStyle = COLORS.text;
    ctx.font = "700 17px 'Noto Sans SC', sans-serif";
    ctx.fillText(String(row.n), PAD + 78, y + 27);

    ctx.fillStyle = LUCK_COLOR[row.shuLi.luck] ?? COLORS.textDim;
    ctx.fillText(row.shuLi.luck, PAD + 120, y + 27);

    ctx.fillStyle = COLORS.textDim;
    ctx.font = "12px 'Noto Sans SC', sans-serif";
    ctx.fillText(row.shuLi.meaning.slice(0, 32), PAD + 18, y + 50);
    y += 62 + 10;
  }

  y += 14;
  ctx.textAlign = "left";
  ctx.fillStyle = COLORS.text;
  ctx.font = "700 17px 'Noto Serif SC', serif";
  ctx.fillText(`${t(lang, "naming.overallScore")}：${Math.round(report.goodRatio * 100)}%`, PAD, y);

  drawShareFooter(ctx, W, H);
  return canvas;
}
