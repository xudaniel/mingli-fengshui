import { Solar } from "lunar-javascript";
import { loadProfiles, type Profile } from "../lib/profiles";
import { computeFromProfile } from "../lib/profileCompute";
import { buildReport } from "../lib/report";
import { computeZiWei } from "../lib/ziwei";
import { renderZiweiChartGrid } from "./ziweiChart";
import { renderCompassSvg } from "./compassSvg";
import { ganElement, type Element } from "../lib/analysis";
import type { BaziResult } from "../lib/bazi";
import type { GuaInfo } from "../lib/bagua";
import { t } from "../lib/i18n/dict";
import type { Lang } from "../lib/i18n/state";

const ELEMENT_CLASS: Record<Element, string> = {
  木: "el-wood",
  火: "el-fire",
  土: "el-earth",
  金: "el-metal",
  水: "el-water",
};

function shiChenIndexFor(hour: number): number {
  return Math.floor(((hour + 1) % 24) / 2);
}

function renderPillarsSummary(bazi: BaziResult): string {
  const cells = bazi.pillars
    .map(
      (p) => `
      <div class="pillar">
        <div class="pillar-label">${p.label}</div>
        <div class="pillar-ganzhi">
          <span class="${ELEMENT_CLASS[ganElement(p.gan)]}">${p.gan}</span>
          <span class="${ELEMENT_CLASS[ganElement(p.hiddenStems[0].gan)]}">${p.zhi}</span>
        </div>
        <div class="pillar-nayin">${p.naYin}</div>
      </div>`,
    )
    .join("");
  return `<div class="pillars">${cells}</div>`;
}

/** 若档案时辰已知，附上紫微斗数图作为报告的一部分；时辰不详则不强行计算，
 * 优雅省略（与紫微斗数工具本身的要求一致，不引入新的排盘逻辑）。 */
function renderZiweiSection(p: Profile, lang: Lang): string {
  if (p.hourUnknown) return "";
  const [y, m, d] = p.date.split("-").map(Number);
  const [h] = p.time.split(":").map(Number);
  const lunar = Solar.fromYmdHms(y, m, d, h, 0, 0).getLunar();
  const chart = computeZiWei({
    yearGan: lunar.getEightChar().getYearGan(),
    lunarMonth: Math.abs(lunar.getMonth()),
    lunarDay: lunar.getDay(),
    shiChenIndex: shiChenIndexFor(h),
  });
  return `<h4>${t(lang, "ziwei.title")}</h4>${renderZiweiChartGrid(chart, lang)}`;
}

export function renderVisualSummary(bazi: BaziResult, gua: GuaInfo, p: Profile, lang: Lang): string {
  return `
    <div class="report-visual">
      ${renderPillarsSummary(bazi)}
      <div class="report-visual-gua">
        <h4>${t(lang, "gua.title")}</h4>
        ${renderCompassSvg(gua, lang)}
      </div>
      ${renderZiweiSection(p, lang)}
    </div>`;
}

export function renderReportView(container: HTMLElement, lang: Lang): void {
  const profiles = loadProfiles();

  container.innerHTML = `
    <div class="card">
      <h2>${t(lang, "report.title")}</h2>
      ${
        profiles.length === 0
          ? `<p class="hint">${t(lang, "calendar.needProfile")}</p>`
          : `
        <div class="field">
          <label>${t(lang, "ziwei.pickProfile")}</label>
          <select id="report-profile">${profiles.map((p) => `<option value="${p.id}">${p.label || "--"}</option>`).join("")}</select>
        </div>
        <div class="card-head-actions">
          <button type="button" id="report-generate" class="btn-primary">${t(lang, "report.generate")}</button>
          <button type="button" id="report-print" class="btn-secondary" hidden>${t(lang, "report.print")}</button>
        </div>
      `
      }
      <article id="report-content" class="report-article"></article>
    </div>
  `;

  if (profiles.length === 0) return;

  const select = container.querySelector<HTMLSelectElement>("#report-profile")!;
  const content = container.querySelector<HTMLElement>("#report-content")!;
  const printBtn = container.querySelector<HTMLButtonElement>("#report-print")!;

  container.querySelector("#report-generate")!.addEventListener("click", () => {
    const p = profiles.find((x) => x.id === select.value);
    if (!p) return;
    const { bazi, gua, effectiveCivil } = computeFromProfile(p);
    const chapters = buildReport(
      bazi,
      gua,
      {
        name: p.name,
        gender: p.gender,
        cityLabel: p.city,
        civilLabel: `${effectiveCivil.year}-${String(effectiveCivil.month).padStart(2, "0")}-${String(effectiveCivil.day).padStart(2, "0")} ${String(effectiveCivil.hour).padStart(2, "0")}:${String(effectiveCivil.minute).padStart(2, "0")}`,
      },
      lang,
    );

    content.innerHTML =
      renderVisualSummary(bazi, gua, p, lang) +
      chapters
        .map(
          (c) => `
      <section class="report-chapter">
        <h3>${c.title}</h3>
        ${c.paragraphs.map((p2) => `<p>${p2}</p>`).join("")}
      </section>`,
        )
        .join("");
    printBtn.hidden = false;
  });

  printBtn.addEventListener("click", () => window.print());
}
