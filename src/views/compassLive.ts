/** 手机罗盘模式：读取设备方向传感器，实时高亮当前朝向所在的八宅吉凶方位。 */

import type { GuaInfo } from "../lib/bagua";
import type { Lang } from "../lib/i18n/state";
import { t } from "../lib/i18n/dict";
import { renderCompassSvg, sectorAtHeading, DIR_ANGLE } from "./compassSvg";

const DIRS_BY_ANGLE = Object.entries(DIR_ANGLE).sort((a, b) => a[1] - b[1]);

function nearestDirectionLabel(heading: number): string {
  let best = DIRS_BY_ANGLE[0][0];
  let bestDiff = Infinity;
  for (const [name, a] of DIRS_BY_ANGLE) {
    const diff = Math.abs(((heading - a + 540) % 360) - 180);
    if (diff < bestDiff) {
      bestDiff = diff;
      best = name;
    }
  }
  return best;
}

interface DeviceOrientationEventWithPermission {
  requestPermission?: () => Promise<"granted" | "denied">;
}

export function isCompassSupported(): boolean {
  return typeof window !== "undefined" && "DeviceOrientationEvent" in window;
}

export function openCompassOverlay(gua: GuaInfo, lang: Lang): void {
  const overlay = document.createElement("div");
  overlay.className = "compass-overlay";
  overlay.innerHTML = `
    <div class="compass-overlay-inner">
      <button type="button" class="btn-secondary compass-close">${t(lang, "compass.close")}</button>
      <h3>${t(lang, "compass.title")}</h3>
      <div id="compass-live-svg" class="compass-live-svg"></div>
      <p id="compass-heading-label" class="compass-heading">--°</p>
      <p class="hint">${t(lang, "compass.disclaimer")}</p>
      <button type="button" id="compass-enable-btn" class="btn-primary">${t(lang, "compass.permission")}</button>
    </div>
  `;
  document.body.appendChild(overlay);

  const svgHost = overlay.querySelector<HTMLDivElement>("#compass-live-svg")!;
  const headingLabel = overlay.querySelector<HTMLParagraphElement>("#compass-heading-label")!;
  const enableBtn = overlay.querySelector<HTMLButtonElement>("#compass-enable-btn")!;

  svgHost.innerHTML = renderCompassSvg(gua, lang);

  const close = () => {
    window.removeEventListener("deviceorientationabsolute", onOrientation as EventListener);
    window.removeEventListener("deviceorientation", onOrientation as EventListener);
    overlay.remove();
  };
  overlay.querySelector(".compass-close")!.addEventListener("click", close);

  function onOrientation(e: DeviceOrientationEvent & { webkitCompassHeading?: number }) {
    let heading: number | null = null;
    if (typeof e.webkitCompassHeading === "number") {
      heading = e.webkitCompassHeading;
    } else if (e.absolute && e.alpha !== null) {
      heading = 360 - e.alpha;
    } else if (e.alpha !== null) {
      heading = 360 - e.alpha;
    }
    if (heading === null) return;
    heading = ((heading % 360) + 360) % 360;

    const svg = svgHost.querySelector("svg");
    if (svg) svg.style.transform = `rotate(${-heading}deg)`;
    const dirName = nearestDirectionLabel(heading);
    headingLabel.textContent = `${heading.toFixed(0)}° ${dirName}`;

    const star = sectorAtHeading(gua, heading);
    svgHost.innerHTML = renderCompassSvg(gua, lang, star?.direction);
    const newSvg = svgHost.querySelector("svg");
    if (newSvg) newSvg.style.transform = `rotate(${-heading}deg)`;
  }

  enableBtn.addEventListener("click", async () => {
    const DOE = window.DeviceOrientationEvent as unknown as DeviceOrientationEventWithPermission;
    try {
      if (typeof DOE?.requestPermission === "function") {
        const result = await DOE.requestPermission();
        if (result !== "granted") return;
      }
    } catch {
      // requestPermission not needed on this platform; continue
    }
    window.addEventListener("deviceorientationabsolute", onOrientation as EventListener, true);
    window.addEventListener("deviceorientation", onOrientation as EventListener, true);
    enableBtn.hidden = true;
  });
}
