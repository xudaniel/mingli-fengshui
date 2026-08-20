import { computeFlyingStar, MOUNTAINS_24, getPeriod, getPeriodLabel, type Mountain } from "../lib/flyingStar";
import { t } from "../lib/i18n/dict";
import type { Lang } from "../lib/i18n/state";

export function renderFlyingStarView(container: HTMLElement, lang: Lang): void {
  const currentYear = new Date().getFullYear();

  container.innerHTML = `
    <div class="card">
      <h2>${t(lang, "flyingstar.title")}</h2>
      <p class="hint">${t(lang, "flyingstar.hint")}</p>
      <p class="hint">${t(lang, "flyingstar.period")}：${getPeriodLabel(getPeriod(currentYear))}</p>
      <div class="field">
        <label>${t(lang, "flyingstar.sitting")}</label>
        <div class="dir-picker mountain-picker" id="fs-mountain-picker">
          ${MOUNTAINS_24.map((m) => `<button type="button" class="dir-btn" data-mountain="${m}">${m}</button>`).join("")}
        </div>
      </div>
      <div class="field">
        <label>${t(lang, "flyingstar.year")}</label>
        <input type="number" id="fs-year" value="${currentYear}" />
      </div>
      <button type="button" id="fs-run" class="btn-primary" disabled>${t(lang, "flyingstar.compute")}</button>
      <div id="fs-result"></div>
    </div>
  `;

  let selected: Mountain | null = null;
  const runBtn = container.querySelector<HTMLButtonElement>("#fs-run")!;
  const resultEl = container.querySelector<HTMLDivElement>("#fs-result")!;
  const yearInput = container.querySelector<HTMLInputElement>("#fs-year")!;

  container.querySelectorAll<HTMLButtonElement>("#fs-mountain-picker .dir-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      container.querySelectorAll("#fs-mountain-picker .dir-btn").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      selected = btn.dataset.mountain as Mountain;
      runBtn.disabled = false;
    });
  });

  runBtn.addEventListener("click", () => {
    if (!selected) return;
    const year = Number(yearInput.value) || currentYear;
    const chart = computeFlyingStar(selected, year);

    const grid = chart.palaces
      .map(
        (p) => `
        <div class="fs-cell${p.palace === "中" ? " fs-center" : ""}">
          <div class="fs-cell-dir">${p.direction || "中"}</div>
          <div class="fs-cell-numbers">
            <span class="fs-shan">${p.shanStar}</span>
            <span class="fs-yun">${p.yunStar}</span>
            <span class="fs-xiang">${p.xiangStar}</span>
          </div>
        </div>`,
      )
      .join("");

    const verdict = chart.isWangShanWangXiang
      ? t(lang, "flyingstar.wangShan")
      : chart.isShangShanXiaShui
        ? t(lang, "flyingstar.shangShan")
        : t(lang, "flyingstar.neutral");

    resultEl.innerHTML = `
      <p class="hint">${chart.periodLabel} · ${t(lang, "flyingstar.sitting")}：${chart.sitting} · 向：${chart.facing}</p>
      <p class="advice-summary">${verdict}</p>
      <div class="fs-grid">${grid}</div>
      <p class="hint">${t(lang, "flyingstar.legend")}</p>
    `;
  });
}
