import { computeQiMen } from "../lib/qimen";
import { t } from "../lib/i18n/dict";
import type { Lang } from "../lib/i18n/state";

export function renderQimenView(container: HTMLElement, lang: Lang): void {
  container.innerHTML = `
    <div class="card">
      <h2>${t(lang, "qimen.title")}</h2>
      <p class="hint">${t(lang, "qimen.hint")}</p>
      <button type="button" id="qimen-run" class="btn-primary">${t(lang, "qimen.compute")}</button>
      <div id="qimen-result"></div>
    </div>
  `;

  container.querySelector("#qimen-run")!.addEventListener("click", () => {
    const chart = computeQiMen({ date: new Date() });
    const grid = chart.palaces
      .map(
        (p) => `
      <div class="fs-cell${p.palace === "中" ? " fs-center" : ""}">
        <div class="fs-cell-dir">${p.direction}</div>
        <div class="qimen-yiqi">${p.yiQi}</div>
        <div class="qimen-men">${p.men ?? ""}</div>
        <div class="qimen-xing">${p.xing}</div>
      </div>`,
      )
      .join("");

    container.querySelector<HTMLDivElement>("#qimen-result")!.innerHTML = `
      <p class="advice-summary">${chart.label}（${chart.isYangDun ? t(lang, "qimen.yangDun") : t(lang, "qimen.yinDun")} ${chart.ju} ${lang === "zh" ? "局" : ""}）</p>
      <div class="fs-grid">${grid}</div>
    `;
  });
}
