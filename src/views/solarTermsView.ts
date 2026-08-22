import { SOLAR_TERMS, currentSolarTerm, type SolarTermInfo } from "../lib/solarTerms";
import { t } from "../lib/i18n/dict";
import type { Lang } from "../lib/i18n/state";

function renderTerm(term: SolarTermInfo, isCurrent: boolean, lang: Lang): string {
  return `
    <div class="term-card${isCurrent ? " term-current" : ""}">
      <div class="term-head">
        <span class="term-name">${term.name}</span>
        <span class="term-season">${term.season}</span>
        <span class="term-approx">${term.approx}</span>
        ${isCurrent ? `<span class="term-now-badge">${t(lang, "terms.now")}</span>` : ""}
      </div>
      <p class="term-desc">${term.description}</p>
      <p class="term-wellness"><strong>${t(lang, "terms.wellness")}：</strong>${term.wellness}</p>
    </div>`;
}

export function renderSolarTermsView(container: HTMLElement, lang: Lang): void {
  const current = currentSolarTerm(new Date());

  container.innerHTML = `
    <div class="card">
      <h2>${t(lang, "terms.title")}</h2>
      <p class="hint">${t(lang, "terms.hint")}</p>
      ${renderTerm(current, true, lang)}
      <p class="hint" style="margin-top:1.2rem">${t(lang, "terms.browseAll")}</p>
      <div class="term-list">
        ${SOLAR_TERMS.filter((s) => s.name !== current.name)
          .map((s) => renderTerm(s, false, lang))
          .join("")}
      </div>
    </div>
  `;
}
