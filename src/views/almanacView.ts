import { getAlmanacRange, type DailyAlmanac } from "../lib/almanac";
import { t } from "../lib/i18n/dict";
import type { Lang } from "../lib/i18n/state";

function renderCard(a: DailyAlmanac): string {
  return `
    <div class="almanac-card">
      <div class="almanac-header">
        <div class="almanac-date">${a.solarDate} · ${a.weekday}</div>
        <div class="almanac-lunar">${a.lunarLabel} · 属${a.shengXiao}</div>
      </div>
      <div class="almanac-ganzhi">
        <span>${a.yearGanZhi}年</span>
        <span>${a.monthGanZhi}月</span>
        <span class="almanac-day-gz">${a.dayGanZhi}日</span>
        <span class="almanac-zhixing">${a.zhiXing}</span>
        <span class="almanac-tianshen ${a.tianShen.type === "黄道" ? "tianshen-good" : "tianshen-bad"}">${a.tianShen.name}（${a.tianShen.type}）</span>
      </div>
      <div class="almanac-yiji">
        <div class="almanac-yi"><strong>宜</strong> ${a.yi.join("、") || "无特别宜事"}</div>
        <div class="almanac-ji"><strong>忌</strong> ${a.ji.join("、") || "无特别忌事"}</div>
      </div>
      <div class="almanac-positions">
        <span>喜神 ${a.positions.xi}</span>
        <span>福神 ${a.positions.fu}</span>
        <span>财神 ${a.positions.cai}</span>
        <span>太岁方 ${a.positions.taiSui}</span>
      </div>
      <div class="almanac-extra">
        <span>二十八宿：${a.xiu.name}（${a.xiu.luck}，${a.xiu.animal}，${a.xiu.zheng}行，${a.xiu.gong}方）</span>
        <span>彭祖百忌：${a.pengZu}</span>
      </div>
    </div>`;
}

export function renderAlmanacView(container: HTMLElement, lang: Lang): void {
  const today = new Date();
  const range = getAlmanacRange(today, 7);

  container.innerHTML = `
    <div class="card">
      <h2>${t(lang, "almanac.title")}</h2>
      <p class="hint">${t(lang, "almanac.hint")}</p>
      <div class="almanac-tabs" id="almanac-tabs">
        ${range.map((a, i) => `<button type="button" class="almanac-tab${i === 0 ? " active" : ""}" data-index="${i}">${i === 0 ? t(lang, "almanac.today") : a.solarDate.slice(5)}</button>`).join("")}
      </div>
      <div id="almanac-content"></div>
    </div>
  `;

  const content = container.querySelector<HTMLDivElement>("#almanac-content")!;
  content.innerHTML = renderCard(range[0]);

  container.querySelectorAll<HTMLButtonElement>(".almanac-tab").forEach((btn) => {
    btn.addEventListener("click", () => {
      container.querySelectorAll(".almanac-tab").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      content.innerHTML = renderCard(range[Number(btn.dataset.index)]);
    });
  });
}

/** 供首页嵌入的精简版（仅今日）。 */
export function renderTodayAlmanacCard(lang: Lang): string {
  const a = getAlmanacRange(new Date(), 1)[0];
  return `<div class="card"><h2>${t(lang, "almanac.title")}</h2>${renderCard(a)}</div>`;
}
