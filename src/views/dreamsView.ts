import { searchDreams, dreamsByCategory, DREAM_CATEGORIES, type DreamEntry, type DreamCategory } from "../lib/dreams";
import { t } from "../lib/i18n/dict";
import type { Lang } from "../lib/i18n/state";

function renderEntries(entries: DreamEntry[], lang: Lang): string {
  if (entries.length === 0) return `<p class="hint">${t(lang, "dreams.noResult")}</p>`;
  return `<div class="relations">${entries
    .map(
      (d) => `
    <div class="relation-row kind-neutral">
      <span class="relation-kind">${d.keywords[0]}</span>
      <span class="relation-meaning">${d.meaning}</span>
    </div>`,
    )
    .join("")}</div>`;
}

export function renderDreamsView(container: HTMLElement, lang: Lang): void {
  container.innerHTML = `
    <div class="card">
      <h2>${t(lang, "dreams.title")}</h2>
      <p class="hint">${t(lang, "dreams.hint")}</p>
      <div class="place-row">
        <input type="text" id="dreams-search" placeholder="${t(lang, "dreams.searchPlaceholder")}" autocomplete="off" />
        <button type="button" id="dreams-search-btn" class="btn-secondary">${t(lang, "form.search")}</button>
      </div>
      <div id="dreams-result"></div>
      <p class="hint" style="margin-top:1rem">${t(lang, "dreams.browseByCategory")}</p>
      <div class="quick-cities" id="dreams-categories">
        ${DREAM_CATEGORIES.map((c) => `<button type="button" class="city-chip" data-cat="${c}">${c}</button>`).join("")}
      </div>
    </div>
  `;

  const input = container.querySelector<HTMLInputElement>("#dreams-search")!;
  const resultEl = container.querySelector<HTMLDivElement>("#dreams-result")!;

  const runSearch = () => {
    const q = input.value.trim();
    if (!q) return;
    resultEl.innerHTML = renderEntries(searchDreams(q), lang);
  };

  container.querySelector("#dreams-search-btn")!.addEventListener("click", runSearch);
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      runSearch();
    }
  });

  container.querySelectorAll<HTMLButtonElement>("#dreams-categories .city-chip").forEach((btn) => {
    btn.addEventListener("click", () => {
      resultEl.innerHTML = renderEntries(dreamsByCategory(btn.dataset.cat as DreamCategory), lang);
    });
  });
}
