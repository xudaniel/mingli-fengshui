import type { GuaInfo } from "../lib/bagua";
import type { Lang } from "../lib/i18n/state";
import { STAR_EN } from "../lib/i18n/terms";

function polar(cx: number, cy: number, r: number, deg: number): [number, number] {
  const rad = (deg * Math.PI) / 180;
  return [cx + r * Math.sin(rad), cy - r * Math.cos(rad)];
}

function sectorPath(cx: number, cy: number, r1: number, r2: number, a1: number, a2: number): string {
  const [x1, y1] = polar(cx, cy, r2, a1);
  const [x2, y2] = polar(cx, cy, r2, a2);
  const [x3, y3] = polar(cx, cy, r1, a2);
  const [x4, y4] = polar(cx, cy, r1, a1);
  return `M ${x1.toFixed(1)} ${y1.toFixed(1)} A ${r2} ${r2} 0 0 1 ${x2.toFixed(1)} ${y2.toFixed(1)} L ${x3.toFixed(1)} ${y3.toFixed(1)} A ${r1} ${r1} 0 0 0 ${x4.toFixed(1)} ${y4.toFixed(1)} Z`;
}

export const DIR_ANGLE: Record<string, number> = {
  北: 0, 东北: 45, 东: 90, 东南: 135, 南: 180, 西南: 225, 西: 270, 西北: 315,
};

export const DIR_EN: Record<string, string> = {
  北: "N", 东北: "NE", 东: "E", 东南: "SE", 南: "S", 西南: "SW", 西: "W", 西北: "NW",
};

export const STAR_MEANING_EN: Record<string, string> = {
  生气: "Most auspicious — vitality, career, and growth. Good for the main door or a home office.",
  天医: "Second-most auspicious — health and helpful mentors. Good for the bedroom or kitchen.",
  延年: "Moderately auspicious — harmony, relationships, and longevity. Good for the bedroom or dining room.",
  伏位: "Mildly auspicious — stability and scholarship. Good for a study or meditation space.",
  祸害: "Mildly inauspicious — disputes and gossip. Best for storage or bathrooms.",
  五鬼: "Highly inauspicious — financial loss and conflict. Suited to a kitchen (fire suppresses it) or storage.",
  六煞: "Moderately inauspicious — disputes and romantic entanglement. Suited to bathrooms or hallways.",
  绝命: "Most inauspicious — health setbacks. Avoid using for the bedroom or main door.",
};

/** 供实景罗盘按当前朝向高亮扇区使用（deg 为设备朝向角度，0=北）。 */
export function sectorAtHeading(gua: GuaInfo, headingDeg: number): (typeof gua.stars)[number] | null {
  let best: (typeof gua.stars)[number] | null = null;
  let bestDiff = Infinity;
  for (const star of gua.stars) {
    const a = DIR_ANGLE[star.direction];
    let diff = Math.abs(((headingDeg - a + 540) % 360) - 180);
    if (diff < bestDiff) {
      bestDiff = diff;
      best = star;
    }
  }
  return bestDiff <= 22.5 ? best : null;
}

export function renderCompassSvg(gua: GuaInfo, lang: Lang = "zh", highlightDirection?: string): string {
  const cx = 130;
  const cy = 130;
  const sectors = gua.stars
    .map((star) => {
      const a = DIR_ANGLE[star.direction];
      const path = sectorPath(cx, cy, 46, 112, a - 22.5, a + 22.5);
      const [dx, dy] = polar(cx, cy, 96, a);
      const [sx, sy] = polar(cx, cy, 68, a);
      const cls = star.auspicious ? "sector-good" : "sector-bad";
      const active = star.direction === highlightDirection ? " sector-active" : "";
      const dirLabel = lang === "en" ? DIR_EN[star.direction] : star.direction;
      const starLabel = lang === "en" ? STAR_EN[star.name] ?? star.name : star.name;
      return `
        <path d="${path}" class="${cls}${active}"><title>${star.direction} · ${star.name}：${star.meaning}</title></path>
        <text x="${dx.toFixed(1)}" y="${dy.toFixed(1)}" class="compass-dir">${dirLabel}</text>
        <text x="${sx.toFixed(1)}" y="${sy.toFixed(1)}" class="compass-star ${star.auspicious ? "star-good" : "star-bad"}">${starLabel}</text>`;
    })
    .join("");
  const guaLabel = lang === "en" ? gua.name : gua.name;
  const groupLabel = lang === "en" ? (gua.group === "东四命" ? "East Group" : "West Group") : gua.group;
  return `
    <svg viewBox="0 0 260 260" class="compass" role="img" aria-label="八宅吉凶方位图">
      ${sectors}
      <circle cx="${cx}" cy="${cy}" r="44" class="compass-center-circle"/>
      <text x="${cx}" y="${cy - 6}" class="compass-center-gua">${guaLabel}</text>
      <text x="${cx}" y="${cy + 16}" class="compass-center-sub">${groupLabel}</text>
    </svg>`;
}
