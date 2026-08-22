import { analyzeNumberLuck } from "../lib/numberLuck";
import type { Luck } from "../lib/wuge";
import { t } from "../lib/i18n/dict";
import type { Lang } from "../lib/i18n/state";

const LUCK_CLASS: Record<Luck, string> = {
  大吉: "wuge-luck-大吉",
  吉: "wuge-luck-吉",
  半吉: "wuge-luck-半吉",
  凶: "wuge-luck-凶",
  大凶: "wuge-luck-大凶",
};

export function renderNumberLuckView(container: HTMLElement, lang: Lang): void {
  container.innerHTML = `
    <div class="card">
      <h2>${t(lang, "numluck.title")}</h2>
      <p class="hint">${t(lang, "numluck.hint")}</p>
      <div class="place-row">
        <input type="text" id="numluck-input" inputmode="numeric" placeholder="13800138000" autocomplete="off" />
        <button type="button" id="numluck-run" class="btn-secondary">${t(lang, "numluck.analyze")}</button>
      </div>
      <div id="numluck-result"></div>
    </div>
  `;

  const input = container.querySelector<HTMLInputElement>("#numluck-input")!;
  const resultEl = container.querySelector<HTMLDivElement>("#numluck-result")!;

  const run = () => {
    const raw = input.value.trim();
    if (!raw) return;
    try {
      const r = analyzeNumberLuck(raw);
      resultEl.innerHTML = `
        <div class="wuge-table" style="margin-top:1rem">
          ${r.groups
            .map(
              (g) => `
            <div class="wuge-row">
              <span class="wuge-label">${g.label}</span>
              <span class="wuge-num">${g.digits}</span>
              <span class="wuge-luck ${LUCK_CLASS[g.shuLi.luck]}">${g.shuLi.luck}</span>
              <span class="wuge-meaning">${t(lang, "numluck.sumTo")}${g.shuLi.number} · ${g.shuLi.meaning}</span>
            </div>`,
            )
            .join("")}
        </div>
        <p class="advice-summary"><strong>${t(lang, "numluck.overall")}：</strong>${r.overallScore} / 100（${r.overallLuck}）</p>
      `;
    } catch (e) {
      resultEl.innerHTML = `<p class="hint">${(e as Error).message}</p>`;
    }
  };

  container.querySelector("#numluck-run")!.addEventListener("click", run);
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      run();
    }
  });
}
