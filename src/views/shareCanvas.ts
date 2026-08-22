/** 图片导出的共用 Canvas 布局基件：配色、圆角矩形、画布创建、页眉页脚与
 * 下载逻辑。由八字（shareImage.ts）、紫微、姓名等各图片导出复用，
 * 保持同一套深色金调视觉。 */

export const SHARE_COLORS = {
  bg: "#100e13",
  bgTop: "#151119",
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

export const SHARE_ELEMENT_COLOR: Record<string, string> = {
  木: SHARE_COLORS.wood,
  火: SHARE_COLORS.fire,
  土: SHARE_COLORS.earth,
  金: SHARE_COLORS.metal,
  水: SHARE_COLORS.water,
};

export const SHARE_SCALE = 2; // 2x for crisp export

export function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number): void {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/** 建画布并铺好渐变底色；导出前等待自定义字体加载。 */
export async function createShareCanvas(w: number, h: number): Promise<{ canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D }> {
  if (typeof document !== "undefined" && "fonts" in document) {
    try {
      await document.fonts.ready;
    } catch {
      // ignore — fall back to default fonts
    }
  }
  const canvas = document.createElement("canvas");
  canvas.width = w * SHARE_SCALE;
  canvas.height = h * SHARE_SCALE;
  const ctx = canvas.getContext("2d")!;
  ctx.scale(SHARE_SCALE, SHARE_SCALE);
  const grad = ctx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, SHARE_COLORS.bgTop);
  grad.addColorStop(1, SHARE_COLORS.bg);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);
  return { canvas, ctx };
}

/** 居中金色标题 + 灰色副标题，返回其后可用的 y 坐标。 */
export function drawShareHeader(ctx: CanvasRenderingContext2D, w: number, title: string, subtitle: string): number {
  let y = 56;
  ctx.fillStyle = SHARE_COLORS.gold;
  ctx.font = "700 30px 'Noto Serif SC', serif";
  ctx.textAlign = "center";
  ctx.fillText(title, w / 2, y);
  y += 34;
  if (subtitle) {
    ctx.fillStyle = SHARE_COLORS.textDim;
    ctx.font = "15px 'Noto Sans SC', sans-serif";
    ctx.fillText(subtitle, w / 2, y);
  }
  return y + 44;
}

export function drawShareFooter(ctx: CanvasRenderingContext2D, w: number, h: number): void {
  ctx.textAlign = "center";
  ctx.fillStyle = SHARE_COLORS.textDim;
  ctx.font = "12px 'Noto Sans SC', sans-serif";
  ctx.fillText("mingli-fengshui · xudaniel.github.io/mingli-fengshui", w / 2, h - 24);
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
