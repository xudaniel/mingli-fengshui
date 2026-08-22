import { searchMoles, molesByCategory, MOLE_CATEGORIES, type MoleEntry, type MoleCategory } from "../lib/moles";
import { t } from "../lib/i18n/dict";
import type { Lang } from "../lib/i18n/state";

function renderEntries(entries: MoleEntry[], lang: Lang): string {
  if (entries.length === 0) return `<p class="hint">${t(lang, "moles.noResult")}</p>`;
  return `<div class="relations">${entries
    .map(
      (m) => `
    <div class="relation-row kind-neutral">
      <span class="relation-kind">${m.keywords[0]}</span>
      <span class="relation-meaning">${m.meaning}</span>
    </div>`,
    )
    .join("")}</div>`;
}

export function renderMolesView(container: HTMLElement, lang: Lang): void {
  container.innerHTML = `
    <div class="card">
      <h2>${t(lang, "moles.title")}</h2>
      <p class="hint">${t(lang, "moles.hint")}</p>
      <p class="hint">${t(lang, "moles.medicalNote")}</p>
      <div class="place-row">
        <input type="text" id="moles-search" placeholder="${t(lang, "moles.searchPlaceholder")}" autocomplete="off" />
        <button type="button" id="moles-search-btn" class="btn-secondary">${t(lang, "form.search")}</button>
      </div>
      <div id="moles-result"></div>
      <p class="hint" style="margin-top:1rem">${t(lang, "dreams.browseByCategory")}</p>
      <div class="quick-cities" id="moles-categories">
        ${MOLE_CATEGORIES.map((c) => `<button type="button" class="city-chip" data-cat="${c}">${c}</button>`).join("")}
      </div>
    </div>
  `;

  const input = container.querySelector<HTMLInputElement>("#moles-search")!;
  const resultEl = container.querySelector<HTMLDivElement>("#moles-result")!;

  const runSearch = () => {
    const q = input.value.trim();
    if (!q) return;
    resultEl.innerHTML = renderEntries(searchMoles(q), lang);
  };

  container.querySelector("#moles-search-btn")!.addEventListener("click", runSearch);
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      runSearch();
    }
  });

  container.querySelectorAll<HTMLButtonElement>("#moles-categories .city-chip").forEach((btn) => {
    btn.addEventListener("click", () => {
      resultEl.innerHTML = renderEntries(molesByCategory(btn.dataset.cat as MoleCategory), lang);
    });
  });
}
