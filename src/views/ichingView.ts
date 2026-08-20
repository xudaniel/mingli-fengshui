import { castLiuYao, castMeiHuaByNumbers, type LiuYaoResult, type MeiHuaResult } from "../lib/iching";
import { t } from "../lib/i18n/dict";
import type { Lang } from "../lib/i18n/state";

function lineSymbol(yang: boolean, moving: boolean): string {
  const base = yang ? '<div class="iching-line iching-yang"></div>' : '<div class="iching-line iching-yin"></div>';
  return `<div class="iching-line-row">${base}${moving ? '<span class="iching-moving">●</span>' : ""}</div>`;
}

function renderLiuYaoResult(r: LiuYaoResult, question: string, lang: Lang): string {
  const linesHtml = [...r.lines].reverse().map((l) => lineSymbol(l.yang, l.moving)).join("");
  return `
    ${question ? `<p class="hint">${question}</p>` : ""}
    <div class="iching-result-grid">
      <div class="iching-lines">${linesHtml}</div>
      <div class="iching-info">
        <p><strong>${t(lang, "iching.original")}：</strong>${r.original.name}（${r.original.upper}${r.original.lower}）</p>
        <p class="advice-summary">${r.original.summary}</p>
        <p><strong>${t(lang, "iching.movingLines")}：</strong>${r.movingIndices.length ? r.movingIndices.map((i) => i + 1).join("、") : t(lang, "iching.noMovingLines")}</p>
        ${
          r.changed
            ? `<p><strong>${t(lang, "iching.changed")}：</strong>${r.changed.name}（${r.changed.upper}${r.changed.lower}）</p><p class="advice-summary">${r.changed.summary}</p>`
            : ""
        }
      </div>
    </div>
  `;
}

function renderMeiHuaResult(r: MeiHuaResult, question: string, lang: Lang): string {
  return `
    ${question ? `<p class="hint">${question}</p>` : ""}
    <p><strong>${r.hexagram.name}</strong>（${r.upperTrigram}上${r.lowerTrigram}下） · ${t(lang, "iching.movingLines")} ${r.movingLine} · ${t(lang, "iching.ti")}：${r.ti === "upper" ? "上卦" : "下卦"}</p>
    <p class="advice-summary">${r.hexagram.summary}</p>
  `;
}

export function renderIchingView(container: HTMLElement, lang: Lang): void {
  container.innerHTML = `
    <div class="card">
      <h2>${t(lang, "iching.title")}</h2>
      <p class="hint">${t(lang, "iching.hint")}</p>
      <div class="field">
        <label>${t(lang, "iching.question")}</label>
        <input type="text" id="iching-question" placeholder="..." autocomplete="off" />
      </div>
      <div class="top-nav" style="justify-content:flex-start;margin:0 0 1rem;">
        <button type="button" class="nav-btn active" data-tab="liuyao">${t(lang, "iching.liuyaoTab")}</button>
        <button type="button" class="nav-btn" data-tab="meihua">${t(lang, "iching.meihuaTab")}</button>
      </div>

      <div id="iching-liuyao-tab">
        <button type="button" id="iching-cast-liuyao" class="btn-primary">${t(lang, "iching.castLiuyao")}</button>
        <div id="iching-liuyao-result"></div>
      </div>

      <div id="iching-meihua-tab" hidden>
        <div class="field-row">
          <div class="field"><label>${t(lang, "iching.numberA")}</label><input type="number" id="iching-num-a" value="8" /></div>
          <div class="field"><label>${t(lang, "iching.numberB")}</label><input type="number" id="iching-num-b" value="3" /></div>
        </div>
        <button type="button" id="iching-cast-meihua" class="btn-primary">${t(lang, "iching.castMeihuaNumber")}</button>
        <div id="iching-meihua-result"></div>
      </div>
    </div>
  `;

  container.querySelectorAll<HTMLButtonElement>(".nav-btn[data-tab]").forEach((btn) => {
    btn.addEventListener("click", () => {
      container.querySelectorAll(".nav-btn[data-tab]").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      container.querySelector<HTMLElement>("#iching-liuyao-tab")!.hidden = btn.dataset.tab !== "liuyao";
      container.querySelector<HTMLElement>("#iching-meihua-tab")!.hidden = btn.dataset.tab !== "meihua";
    });
  });

  const questionInput = container.querySelector<HTMLInputElement>("#iching-question")!;

  container.querySelector("#iching-cast-liuyao")!.addEventListener("click", () => {
    const r = castLiuYao();
    container.querySelector<HTMLDivElement>("#iching-liuyao-result")!.innerHTML = renderLiuYaoResult(
      r,
      questionInput.value.trim(),
      lang,
    );
  });

  container.querySelector("#iching-cast-meihua")!.addEventListener("click", () => {
    const a = Number(container.querySelector<HTMLInputElement>("#iching-num-a")!.value) || 1;
    const b = Number(container.querySelector<HTMLInputElement>("#iching-num-b")!.value) || 1;
    const r = castMeiHuaByNumbers(a, b);
    container.querySelector<HTMLDivElement>("#iching-meihua-result")!.innerHTML = renderMeiHuaResult(
      r,
      questionInput.value.trim(),
      lang,
    );
  });
}
