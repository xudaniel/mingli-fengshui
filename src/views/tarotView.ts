import { drawCard, type TarotDraw } from "../lib/tarot";
import { t } from "../lib/i18n/dict";
import type { Lang } from "../lib/i18n/state";

function renderDraw(d: TarotDraw, question: string, lang: Lang): string {
  const orientation = d.reversed ? t(lang, "tarot.reversed") : t(lang, "tarot.upright");
  return `
    <div class="tarot-result">
      ${question ? `<p class="hint">${t(lang, "tarot.yourQuestion")}：${question}</p>` : ""}
      <div class="tarot-card-face${d.reversed ? " tarot-reversed" : ""}">
        <div class="tarot-card-name">${d.card.name}</div>
        <div class="tarot-card-name-en">${d.card.nameEn}</div>
        <div class="tarot-orientation">${orientation}</div>
      </div>
      <p class="tarot-meaning">${d.reversed ? d.card.reversed : d.card.upright}</p>
    </div>`;
}

export function renderTarotView(container: HTMLElement, lang: Lang): void {
  container.innerHTML = `
    <div class="card">
      <h2>${t(lang, "tarot.title")}</h2>
      <p class="hint">${t(lang, "tarot.hint")}</p>
      <div class="field">
        <label>${t(lang, "tarot.question")}</label>
        <input type="text" id="tarot-question" placeholder="…" autocomplete="off" />
      </div>
      <button type="button" id="tarot-draw" class="btn-primary">${t(lang, "tarot.draw")}</button>
      <div id="tarot-result"></div>
    </div>
  `;

  const resultEl = container.querySelector<HTMLDivElement>("#tarot-result")!;
  const questionInput = container.querySelector<HTMLInputElement>("#tarot-question")!;
  container.querySelector("#tarot-draw")!.addEventListener("click", () => {
    resultEl.innerHTML = renderDraw(drawCard(), questionInput.value.trim(), lang);
  });
}
