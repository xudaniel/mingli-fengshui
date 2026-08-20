import { loadProfiles, type Profile } from "../lib/profiles";
import { Solar } from "lunar-javascript";
import { computeZiWei } from "../lib/ziwei";
import { t } from "../lib/i18n/dict";
import type { Lang } from "../lib/i18n/state";

const ZHI = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];

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

    const grid = ZHI.map((zhi, zhiIndex) => {
      const palace = chart.palaces.find((pp) => pp.zhiIndex === zhiIndex)!;
      const isLife = zhiIndex === chart.lifePalaceIndex;
      const isBody = zhiIndex === chart.bodyPalaceIndex;
      return `
        <div class="ziwei-cell${isLife ? " ziwei-life" : ""}">
          <div class="ziwei-cell-name">${palace.name}${isLife ? ` (${t(lang, "ziwei.lifePalace")})` : ""}${isBody ? ` (${t(lang, "ziwei.bodyPalace")})` : ""}</div>
          <div class="ziwei-cell-zhi">${zhi}</div>
          <div class="ziwei-cell-stars">${palace.stars.join("、") || "--"}</div>
        </div>`;
    }).join("");

    resultEl.innerHTML = `
      <p class="hint">${t(lang, "ziwei.ju")}：${chart.ju.name} · ${t(lang, "ziwei.lifePalace")}：${ZHI[chart.lifePalaceIndex]} · ${t(lang, "ziwei.bodyPalace")}：${ZHI[chart.bodyPalaceIndex]}</p>
      <div class="ziwei-grid">${grid}</div>
      <p class="hint"><strong>${t(lang, "ziwei.siHua")}：</strong>${chart.siHua.map((s) => `${s.star}${s.type}`).join(" · ")}</p>
    `;
  });

  // 默认自动选中第一个档案并排盘
  (container.querySelector("#ziwei-run") as HTMLButtonElement).click();
}
