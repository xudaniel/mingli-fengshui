import { drawStick, type FortuneStick, type StickGrade } from "../lib/fortuneStick";
import { t } from "../lib/i18n/dict";
import type { Lang } from "../lib/i18n/state";

const GRADE_CLASS: Record<StickGrade, string> = {
  上上: "stick-grade-best",
  上: "stick-grade-good",
  中: "stick-grade-mid",
  下: "stick-grade-bad",
  下下: "stick-grade-worst",
};

function renderStick(s: FortuneStick, lang: Lang): string {
  return `
    <div class="stick-result">
      <div class="stick-head">
        <span class="stick-number">${t(lang, "stick.numberPrefix")}${s.number}${t(lang, "stick.numberSuffix")}</span>
        <span class="stick-title">${s.title}</span>
        <span class="stick-grade ${GRADE_CLASS[s.grade]}">${s.grade}${lang === "zh" ? "签" : ""}</span>
      </div>
      <div class="stick-poem">${s.poem.split("。").filter(Boolean).map((line) => `<p>${line}。</p>`).join("")}</div>
      <p class="stick-meaning"><strong>${t(lang, "stick.meaning")}：</strong>${s.meaning}</p>
    </div>`;
}

export function renderFortuneStickView(container: HTMLElement, lang: Lang): void {
  container.innerHTML = `
    <div class="card">
      <h2>${t(lang, "stick.title")}</h2>
      <p class="hint">${t(lang, "stick.hint")}</p>
      <button type="button" id="stick-draw" class="btn-primary">${t(lang, "stick.draw")}</button>
      <div id="stick-result"></div>
    </div>
  `;

  const resultEl = container.querySelector<HTMLDivElement>("#stick-result")!;
  container.querySelector("#stick-draw")!.addEventListener("click", () => {
    resultEl.innerHTML = renderStick(drawStick(), lang);
  });
}
