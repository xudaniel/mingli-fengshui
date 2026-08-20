import { loadProfiles } from "../lib/profiles";
import { computeFromProfile } from "../lib/profileCompute";
import { buildReport } from "../lib/report";
import { t } from "../lib/i18n/dict";
import type { Lang } from "../lib/i18n/state";

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

    content.innerHTML = chapters
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
