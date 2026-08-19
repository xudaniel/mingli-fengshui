import type { LifeCurve } from "../lib/lifecurve";

const W = 760;
const H = 200;
const PAD_L = 32;
const PAD_R = 12;
const PAD_T = 16;
const PAD_B = 24;

function scoreColor(score: number): string {
  if (score > 0) return "var(--wood)";
  if (score < 0) return "var(--fire)";
  return "var(--text-dim)";
}

export function renderLifeCurveSvg(curve: LifeCurve, currentYear: number): string {
  if (curve.years.length === 0) return "";

  const minAge = curve.years[0].age;
  const maxAge = curve.years[curve.years.length - 1].age;
  const plotW = W - PAD_L - PAD_R;
  const plotH = H - PAD_T - PAD_B;

  const xFor = (age: number) => PAD_L + ((age - minAge) / (maxAge - minAge)) * plotW;
  const yFor = (score: number) => PAD_T + plotH / 2 - (score / 3) * (plotH / 2);

  const segRects = curve.segments
    .map((seg) => {
      const x1 = xFor(seg.startAge);
      const x2 = xFor(seg.endAge + 1);
      const opacity = 0.06 + Math.min(Math.abs(seg.score), 3) * 0.05;
      const fill = seg.score >= 0 ? "var(--wood)" : "var(--fire)";
      return `<rect x="${x1.toFixed(1)}" y="${PAD_T}" width="${(x2 - x1).toFixed(1)}" height="${plotH}" fill="${fill}" opacity="${opacity.toFixed(2)}"><title>${seg.startAge}-${seg.endAge} ${seg.ganZhi} (${seg.score >= 0 ? "+" : ""}${seg.score})</title></rect>`;
    })
    .join("");

  const points = curve.years.map((p) => `${xFor(p.age).toFixed(1)},${yFor(p.score).toFixed(1)}`).join(" ");

  const dots = curve.years
    .map((p) => {
      const x = xFor(p.age);
      const y = yFor(p.score);
      return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="2" fill="${scoreColor(p.score)}"><title>${p.year} (${p.age}) ${p.ganZhi} ${p.score >= 0 ? "+" : ""}${p.score}</title></circle>`;
    })
    .join("");

  const zeroY = yFor(0);

  let currentMarker = "";
  const cur = curve.years.find((p) => p.year === currentYear);
  if (cur) {
    const x = xFor(cur.age);
    currentMarker = `<line x1="${x.toFixed(1)}" y1="${PAD_T}" x2="${x.toFixed(1)}" y2="${PAD_T + plotH}" stroke="var(--gold)" stroke-width="1.5" stroke-dasharray="3,3"/>`;
  }

  // age axis ticks every 10 years
  const ticks: string[] = [];
  for (let a = Math.ceil(minAge / 10) * 10; a <= maxAge; a += 10) {
    const x = xFor(a);
    ticks.push(
      `<text x="${x.toFixed(1)}" y="${H - 6}" class="curve-tick">${a}</text>`,
    );
  }

  return `
    <svg viewBox="0 0 ${W} ${H}" class="life-curve" role="img" aria-label="life curve chart">
      <line x1="${PAD_L}" y1="${zeroY.toFixed(1)}" x2="${W - PAD_R}" y2="${zeroY.toFixed(1)}" class="curve-zero"/>
      ${segRects}
      ${currentMarker}
      <polyline points="${points}" class="curve-line" fill="none"/>
      ${dots}
      ${ticks.join("")}
    </svg>`;
}
