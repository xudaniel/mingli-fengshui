import { loadProfiles, type Profile } from "../lib/profiles";
import { computeFromProfile } from "../lib/profileCompute";
import { computeCompatibility } from "../lib/compatibility";
import { t } from "../lib/i18n/dict";
import type { Lang } from "../lib/i18n/state";

function profileOptionsHtml(profiles: Profile[], lang: Lang): string {
  if (profiles.length === 0) return `<option value="">--</option>`;
  return profiles
    .map(
      (p) =>
        `<option value="${p.id}">${p.label || t(lang, "profiles.empty")} · ${p.date} · ${p.city}</option>`,
    )
    .join("");
}

export function renderCompatView(container: HTMLElement, lang: Lang): void {
  const profiles = loadProfiles();

  container.innerHTML = `
    <div class="card">
      <h2>${t(lang, "compat.title")}</h2>
      ${
        profiles.length < 1
          ? `<p class="hint">${t(lang, "compat.needTwo")}</p>`
          : `
        <div class="field-row">
          <div class="field">
            <label>${t(lang, "compat.pickA")}</label>
            <select id="compat-a" class="compat-select">${profileOptionsHtml(profiles, lang)}</select>
          </div>
          <div class="field">
            <label>${t(lang, "compat.pickB")}</label>
            <select id="compat-b" class="compat-select">${profileOptionsHtml(profiles, lang)}</select>
          </div>
        </div>
        <button type="button" id="compat-run" class="btn-primary">${t(lang, "compat.compute")}</button>
      `
      }
      <div id="compat-result"></div>
    </div>
  `;

  if (profiles.length < 1) return;

  const runBtn = container.querySelector<HTMLButtonElement>("#compat-run")!;
  const resultEl = container.querySelector<HTMLDivElement>("#compat-result")!;
  const selA = container.querySelector<HTMLSelectElement>("#compat-a")!;
  const selB = container.querySelector<HTMLSelectElement>("#compat-b")!;
  if (profiles.length > 1) selB.value = profiles[1].id;

  runBtn.addEventListener("click", () => {
    const pA = profiles.find((p) => p.id === selA.value);
    const pB = profiles.find((p) => p.id === selB.value);
    if (!pA || !pB) return;

    const a = computeFromProfile(pA);
    const b = computeFromProfile(pB);
    const report = computeCompatibility(a.bazi, a.gua, b.bazi, b.gua);

    resultEl.innerHTML = `
      <div class="compat-score">
        <span class="compat-score-num">${report.score}</span>
        <span class="compat-score-label">${t(lang, "compat.score")}</span>
      </div>
      <p class="advice-summary">${report.summary}</p>
      <div class="compat-detail-grid">
        <div class="compat-detail"><h4>${t(lang, "compat.dayGan")}</h4><p>${report.dayGan.summary}</p></div>
        <div class="compat-detail"><h4>${t(lang, "compat.dayZhi")}</h4><p>${report.dayZhi.summary}</p></div>
        <div class="compat-detail"><h4>${t(lang, "compat.zodiac")}</h4><p>${report.zodiac.summary}</p></div>
        <div class="compat-detail"><h4>${t(lang, "compat.element")}</h4><p>${report.element.summary}</p></div>
        <div class="compat-detail"><h4>${t(lang, "compat.gua")}</h4><p>${report.gua.summary}</p></div>
      </div>
    `;
  });
}
