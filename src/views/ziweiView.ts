import { loadProfiles, type Profile } from "../lib/profiles";
import { Solar } from "lunar-javascript";
import { computeZiWei } from "../lib/ziwei";
import { renderZiweiChartGrid } from "./ziweiChart";
import { t } from "../lib/i18n/dict";
import type { Lang } from "../lib/i18n/state";

function shiChenIndexFor(hour: number): number {
  // 23-0 时为子时(0)，1-2为丑(1)...，每两小时一个时辰
  return Math.floor(((hour + 1) % 24) / 2);
}

export function renderZiweiView(container: HTMLElement, lang: Lang): void {
  const profiles = loadProfiles().filter((p) => !p.hourUnknown);

  container.innerHTML = `
    <div class="card">
      <h2>${t(lang, "ziwei.title")}</h2>
      <p class="hint">${t(lang, "ziwei.hint")}</p>
      ${
        profiles.length === 0
          ? `<p class="hint">${t(lang, "ziwei.needBirthInfo")}</p>`
          : `
        <div class="field">
          <label>${t(lang, "ziwei.pickProfile")}</label>
          <select id="ziwei-profile"></select>
        </div>
        <button type="button" id="ziwei-run" class="btn-primary">${t(lang, "ziwei.compute")}</button>
      `
      }
      <div id="ziwei-result"></div>
    </div>
  `;

  if (profiles.length === 0) return;

  const select = container.querySelector<HTMLSelectElement>("#ziwei-profile")!;
  select.innerHTML = profiles.map((p) => `<option value="${p.id}">${p.label || "--"} · ${p.date} ${p.time}</option>`).join("");

  const resultEl = container.querySelector<HTMLDivElement>("#ziwei-result")!;

  container.querySelector("#ziwei-run")!.addEventListener("click", () => {
    const p = profiles.find((x) => x.id === select.value) as Profile;
    if (!p) return;
    const [y, m, d] = p.date.split("-").map(Number);
    const [h] = p.time.split(":").map(Number);
    const lunar = Solar.fromYmdHms(y, m, d, h, 0, 0).getLunar();
    const yearGan = lunar.getEightChar().getYearGan();
    // 闰月在 lunar-javascript 中以负数表示；紫微排盘按当月序数处理，取绝对值
    const lunarMonthNum = Math.abs(lunar.getMonth());
    const lunarDayNum = lunar.getDay();

    const chart = computeZiWei({
      yearGan,
      lunarMonth: lunarMonthNum,
      lunarDay: lunarDayNum,
      shiChenIndex: shiChenIndexFor(h),
    });

    resultEl.innerHTML =
      renderZiweiChartGrid(chart, lang, { profileLabel: p.label || undefined }) +
      `<button type="button" id="ziwei-save-image" class="btn-secondary" style="margin-top:0.9rem">${t(lang, "result.saveImage")}</button>`;

    resultEl.querySelector("#ziwei-save-image")!.addEventListener("click", async () => {
      const { renderZiweiShareCanvas } = await import("./shareZiweiImage");
      const { downloadCanvas } = await import("./shareCanvas");
      const canvas = await renderZiweiShareCanvas(chart, `${p.label || "--"} · ${p.date} ${p.time}`, lang);
      downloadCanvas(canvas, `ziwei-${p.date}.png`);
    });
  });

  // 默认自动选中第一个档案并排盘
  (container.querySelector("#ziwei-run") as HTMLButtonElement).click();
}
