import "./style.css";
import { CITIES, guessUtcOffset, searchPlace, type CityEntry } from "./lib/cities";
import { toTrueSolarTime, shiftCivilMinutes, type CivilMoment } from "./lib/solarTime";
import { computeBazi, ELEMENTS, type BaziResult, type Element } from "./lib/bazi";
import { ganElement } from "./lib/analysis";
import { deriveFengshuiAdvice, ELEMENT_PROFILE } from "./lib/fengshui";
import { computeGua, type GuaInfo } from "./lib/bagua";
import { loadHistory, saveHistory, clearHistory, type HistoryEntry } from "./lib/history";
import { pillarBadges } from "./lib/relations";
import {
  inChinaDst,
  isPre1949China,
  DST_WARNING_TEXT,
  PRE_1949_HINT_TEXT,
} from "./lib/historicalTime";

const APP_VERSION = "1.1.0";

const ELEMENT_CLASS: Record<Element, string> = {
  木: "el-wood",
  火: "el-fire",
  土: "el-earth",
  金: "el-metal",
  水: "el-water",
};

const app = document.querySelector<HTMLDivElement>("#app")!;

app.innerHTML = `
  <div class="page">
    <header class="hero">
      <h1>命理风水 · 八字四柱排盘</h1>
      <p class="subtitle">依据出生地与出生年月日时，排出四柱八字、五行喜忌与八宅风水方位</p>
      <div class="hero-actions">
        <span class="version-badge">v${APP_VERSION}</span>
        <button type="button" id="about-btn" class="link-btn">关于本应用</button>
      </div>
    </header>

    <main class="layout">
      <div class="side-col">
        <form id="bazi-form" class="card form-card">
          <div class="field">
            <label for="name">姓名 <span class="optional">(选填)</span></label>
            <input id="name" name="name" type="text" placeholder="用于结果标题" autocomplete="off" />
          </div>

          <div class="field">
            <span class="field-label">性别</span>
            <div class="radio-row">
              <label class="radio-pill"><input type="radio" name="gender" value="male" checked /> 男</label>
              <label class="radio-pill"><input type="radio" name="gender" value="female" /> 女</label>
            </div>
          </div>

          <div class="field-row">
            <div class="field">
              <label for="date">出生日期（公历）</label>
              <input id="date" name="date" type="date" required />
            </div>
            <div class="field">
              <label for="time">出生时间</label>
              <input id="time" name="time" type="time" required value="12:00" />
            </div>
          </div>

          <div class="field">
            <label for="city-input">出生地</label>
            <div class="place-row">
              <input id="city-input" type="text" placeholder="输入城市名，如：杭州" autocomplete="off" />
              <button type="button" id="search-place-btn" class="btn-secondary">搜索</button>
            </div>
            <div id="quick-cities" class="quick-cities"></div>
            <div id="search-results" class="search-results"></div>
            <p id="place-status" class="hint"></p>
          </div>

          <div class="field-row">
            <div class="field">
              <label for="longitude">经度（东正西负）</label>
              <input id="longitude" type="number" step="0.0001" required />
            </div>
            <div class="field">
              <label for="utc-offset">出生地时区（UTC 偏移）</label>
              <input id="utc-offset" type="number" step="1" required value="8" />
            </div>
          </div>

          <div class="field checkbox-field">
            <label class="checkbox-row">
              <input id="use-true-solar" type="checkbox" checked />
              按出生地经度校正为真太阳时
            </label>
            <label class="checkbox-row sub-checkbox">
              <input id="use-eot" type="checkbox" checked />
              同时校正均时差（更精确，误差 ±16 分钟内）
            </label>
          </div>

          <div id="dst-warning" class="warn-box" hidden>
            <p>⚠️ ${DST_WARNING_TEXT}</p>
            <label class="checkbox-row">
              <input id="dst-adjust" type="checkbox" checked />
              按夏令时校正（排盘前回拨 1 小时）
            </label>
          </div>
          <div id="pre1949-hint" class="warn-box" hidden>
            <p>⚠️ ${PRE_1949_HINT_TEXT}</p>
          </div>

          <button type="submit" class="btn-primary">开始排盘</button>
        </form>

        <div id="history-card" class="card history-card" hidden>
          <div class="history-head">
            <h2>排盘历史</h2>
            <button type="button" id="clear-history-btn" class="link-btn">清空</button>
          </div>
          <div id="history-list" class="history-list"></div>
        </div>
      </div>

      <section id="result" class="result"></section>
    </main>

    <footer class="footer">
      <p>结果基于传统四柱八字排盘方法、简化的日主强弱分析与八宅命卦体系，仅供文化参考与娱乐，不构成任何专业建议。</p>
      <p>命理风水 v${APP_VERSION} · 作者 <a href="https://github.com/xudaniel" target="_blank" rel="noopener">Daniel Xu</a> · 排盘核心由 <a href="https://github.com/6tail/lunar-javascript" target="_blank" rel="noopener">lunar-javascript</a> 提供 · <a href="https://github.com/xudaniel/mingli-fengshui" target="_blank" rel="noopener">GitHub</a></p>
    </footer>

    <dialog id="about-dialog" class="about-dialog">
      <h2>关于「命理风水」</h2>
      <p class="about-version">版本 v${APP_VERSION} · 作者 Daniel Xu · MIT 许可证开源</p>
      <h3>它做了什么</h3>
      <ul>
        <li><strong>真太阳时校正</strong> —— 传统八字以太阳位置定时辰。应用根据出生地经度（每偏离时区中央经线 1° 约 4 分钟）及可选的均时差，把钟表时间换算为出生地的真太阳时后再排盘。</li>
        <li><strong>四柱八字</strong> —— 年、月、日、时四柱干支由 lunar-javascript 依二十四节气精确推算，含藏干、十神、纳音、空亡、胎元、命宫、身宫与大运。</li>
        <li><strong>五行强弱</strong> —— 采用简化子平法加权：天干与地支藏干按本气/中气/余气计分，月令乘以 1.5 倍，据同党（印比）占比判断身强身弱，导出喜用神；并依《穷通宝鉴》通行简表给出调候用神。</li>
        <li><strong>地支关系</strong> —— 检测四柱地支间的六合、三合（含半合）、三会、相冲、相刑（含自刑）、相害，并标注于柱上。</li>
        <li><strong>历史时制提醒</strong> —— 出生时刻落在 1986–1991 年中国夏令时期间时提示并可一键回拨 1 小时；1949 年前出生提示当时的五时区背景。</li>
        <li><strong>八宅命卦</strong> —— 由立春为界的出生年与性别推得本命卦（东四命/西四命），给出生气、天医、延年、伏位四吉方与四凶方。</li>
      </ul>
      <h3>它没有做什么</h3>
      <p>完整的专业命理还需综合调候、合冲刑害、格局取用等诸多因素；本应用的喜忌判断是公开、透明的简化算法，结果仅供文化参考与娱乐，请勿据此做出重大决定。</p>
      <h3>隐私</h3>
      <p>所有排盘计算均在浏览器本地完成；出生信息只存于本机浏览器的历史记录中，不会上传任何服务器。使用「搜索」查询陌生地名时，仅将地名发送给 OpenStreetMap 的公共地理编码服务。</p>
      <form method="dialog"><button class="btn-secondary">关闭</button></form>
    </dialog>
  </div>
`;

// ---- About dialog ----
const aboutDialog = document.querySelector<HTMLDialogElement>("#about-dialog")!;
document.querySelector("#about-btn")!.addEventListener("click", () => aboutDialog.showModal());

// ---- Quick city buttons ----
const quickCitiesEl = document.querySelector<HTMLDivElement>("#quick-cities")!;
const featured = ["北京", "上海", "广州", "深圳", "杭州", "成都", "香港", "台北"];
quickCitiesEl.innerHTML = featured
  .map((name) => `<button type="button" class="city-chip" data-city="${name}">${name}</button>`)
  .join("");

const cityInput = document.querySelector<HTMLInputElement>("#city-input")!;
const longitudeInput = document.querySelector<HTMLInputElement>("#longitude")!;
const utcOffsetInput = document.querySelector<HTMLInputElement>("#utc-offset")!;
const placeStatus = document.querySelector<HTMLParagraphElement>("#place-status")!;
const searchResultsEl = document.querySelector<HTMLDivElement>("#search-results")!;

function applyCity(name: string, longitude: number, utcOffset: number, note?: string) {
  cityInput.value = name;
  longitudeInput.value = longitude.toFixed(4);
  utcOffsetInput.value = String(utcOffset);
  placeStatus.textContent =
    note ?? `已定位：经度 ${longitude.toFixed(4)}°，时区 UTC${utcOffset >= 0 ? "+" : ""}${utcOffset}`;
  searchResultsEl.innerHTML = "";
}

quickCitiesEl.addEventListener("click", (e) => {
  const btn = (e.target as HTMLElement).closest<HTMLButtonElement>(".city-chip");
  if (!btn) return;
  const city = CITIES.find((c) => c.name === btn.dataset.city);
  if (city) applyCity(city.name, city.longitude, city.utcOffset);
});

// ---- Live place search (curated list first, Nominatim fallback) ----
const searchBtn = document.querySelector<HTMLButtonElement>("#search-place-btn")!;

function renderSearchResults(
  items: { label: string; longitude: number; utcOffset: number; note?: string }[],
) {
  if (items.length === 0) {
    searchResultsEl.innerHTML = `<p class="hint">未找到匹配地点，请尝试更完整的地名，或直接手动填写经度与时区。</p>`;
    return;
  }
  searchResultsEl.innerHTML = items
    .map((item, i) => `<button type="button" class="result-item" data-index="${i}">${item.label}</button>`)
    .join("");
  searchResultsEl.querySelectorAll<HTMLButtonElement>(".result-item").forEach((btn) => {
    btn.addEventListener("click", () => {
      const item = items[Number(btn.dataset.index)];
      applyCity(cityInput.value, item.longitude, item.utcOffset, item.note);
    });
  });
}

async function runSearch() {
  const q = cityInput.value.trim();
  if (!q) return;

  const localMatches: CityEntry[] = CITIES.filter((c) => c.name.includes(q) || q.includes(c.name));
  if (localMatches.length > 0) {
    renderSearchResults(
      localMatches.map((c) => ({
        label: `${c.name}（${c.region}）· 经度 ${c.longitude.toFixed(2)}° · UTC${c.utcOffset >= 0 ? "+" : ""}${c.utcOffset}`,
        longitude: c.longitude,
        utcOffset: c.utcOffset,
      })),
    );
    return;
  }

  placeStatus.textContent = "搜索中…";
  searchBtn.disabled = true;
  try {
    const results = await searchPlace(q);
    renderSearchResults(
      results.map((r) => ({
        label: r.displayName,
        longitude: r.longitude,
        utcOffset: guessUtcOffset(r.longitude),
        note: `经度 ${r.longitude.toFixed(4)}°，已按经度粗略估算时区，请核实是否符合当地历史时区`,
      })),
    );
    placeStatus.textContent = results.length === 0 ? "未找到匹配地点，请尝试更完整的地名。" : "请选择最匹配的地点：";
  } catch (err) {
    placeStatus.textContent = err instanceof Error ? err.message : "搜索失败，请手动填写经度与时区。";
  } finally {
    searchBtn.disabled = false;
  }
}

searchBtn.addEventListener("click", runSearch);
cityInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    runSearch();
  }
});

// Default to Beijing so the form is valid out of the box.
applyCity("北京", 116.4074, 8);

// ---- Historical-time warnings (1986–1991 DST, pre-1949 five zones) ----
const dstWarningEl = document.querySelector<HTMLDivElement>("#dst-warning")!;
const pre1949HintEl = document.querySelector<HTMLDivElement>("#pre1949-hint")!;

function readCivilFromForm(): CivilMoment | null {
  const dateVal = document.querySelector<HTMLInputElement>("#date")!.value;
  const timeVal = document.querySelector<HTMLInputElement>("#time")!.value;
  if (!dateVal || !timeVal) return null;
  const [year, month, day] = dateVal.split("-").map(Number);
  const [hour, minute] = timeVal.split(":").map(Number);
  return { year, month, day, hour, minute };
}

function updateHistoricalWarnings() {
  const civil = readCivilFromForm();
  const utcOffset = Number(utcOffsetInput.value);
  const longitude = Number(longitudeInput.value);
  const dstApplies = civil !== null && utcOffset === 8 && inChinaDst(civil);
  dstWarningEl.hidden = !dstApplies;
  pre1949HintEl.hidden = !(civil !== null && isPre1949China(civil, longitude));
}

for (const sel of ["#date", "#time", "#utc-offset", "#longitude"]) {
  document.querySelector(sel)!.addEventListener("input", updateHistoricalWarnings);
}

// ---- History ----
const historyCard = document.querySelector<HTMLDivElement>("#history-card")!;
const historyList = document.querySelector<HTMLDivElement>("#history-list")!;

function renderHistory(entries: HistoryEntry[]) {
  historyCard.hidden = entries.length === 0;
  historyList.innerHTML = entries
    .map(
      (e, i) => `
      <button type="button" class="history-item" data-index="${i}">
        <span class="history-title">${e.name || "未命名"} · ${e.gender === "male" ? "男" : "女"}</span>
        <span class="history-sub">${e.date} ${e.time} · ${e.city}</span>
      </button>`,
    )
    .join("");
  historyList.querySelectorAll<HTMLButtonElement>(".history-item").forEach((btn) => {
    btn.addEventListener("click", () => {
      const e = entries[Number(btn.dataset.index)];
      fillForm(e);
      runChart();
    });
  });
}

function fillForm(e: HistoryEntry) {
  document.querySelector<HTMLInputElement>("#name")!.value = e.name;
  document.querySelector<HTMLInputElement>(`input[name="gender"][value="${e.gender}"]`)!.checked = true;
  document.querySelector<HTMLInputElement>("#date")!.value = e.date;
  document.querySelector<HTMLInputElement>("#time")!.value = e.time;
  cityInput.value = e.city;
  longitudeInput.value = e.longitude.toFixed(4);
  utcOffsetInput.value = String(e.utcOffset);
  document.querySelector<HTMLInputElement>("#use-true-solar")!.checked = e.useTrueSolar;
  document.querySelector<HTMLInputElement>("#use-eot")!.checked = e.useEot;
}

document.querySelector("#clear-history-btn")!.addEventListener("click", () => {
  clearHistory();
  renderHistory([]);
});

renderHistory(loadHistory());

// ---- Form submit ----
const form = document.querySelector<HTMLFormElement>("#bazi-form")!;
const resultEl = document.querySelector<HTMLElement>("#result")!;

form.addEventListener("submit", (e) => {
  e.preventDefault();
  runChart();
  resultEl.scrollIntoView({ behavior: "smooth", block: "start" });
});

function runChart() {
  updateHistoricalWarnings();
  const civil = readCivilFromForm();
  if (!civil) return;
  const dateVal = document.querySelector<HTMLInputElement>("#date")!.value;
  const timeVal = document.querySelector<HTMLInputElement>("#time")!.value;

  const gender = document.querySelector<HTMLInputElement>('input[name="gender"]:checked')!
    .value as "male" | "female";
  const name = document.querySelector<HTMLInputElement>("#name")!.value.trim();
  const longitude = Number(longitudeInput.value);
  const utcOffset = Number(utcOffsetInput.value);
  const useTrueSolar = document.querySelector<HTMLInputElement>("#use-true-solar")!.checked;
  const useEot = document.querySelector<HTMLInputElement>("#use-eot")!.checked;

  const notes: string[] = [];
  let effectiveCivil = civil;

  const dstAdjust = document.querySelector<HTMLInputElement>("#dst-adjust")!;
  if (!dstWarningEl.hidden && dstAdjust.checked) {
    effectiveCivil = shiftCivilMinutes(effectiveCivil, -60);
    notes.push("已按 1986–1991 夏令时回拨 1 小时");
  }

  if (useTrueSolar) {
    const solarTime = toTrueSolarTime(effectiveCivil, {
      longitude,
      utcOffsetHours: utcOffset,
      applyEquationOfTime: useEot,
    });
    effectiveCivil = solarTime.corrected;
    const sign = solarTime.totalCorrectionMinutes >= 0 ? "+" : "";
    notes.push(
      `已按出生地经度${useEot ? "与均时差" : ""}校正真太阳时：${sign}${solarTime.totalCorrectionMinutes.toFixed(1)} 分钟`,
    );
  }
  const correctionNote = notes.join("；");

  const bazi = computeBazi(effectiveCivil, gender);
  const gua = computeGua(bazi.fengshuiYear, gender);
  renderResult(bazi, gua, {
    name,
    gender,
    civil,
    effectiveCivil,
    correctionNote,
    cityLabel: cityInput.value,
  });

  renderHistory(
    saveHistory({
      name,
      gender,
      date: dateVal,
      time: timeVal,
      city: cityInput.value,
      longitude,
      utcOffset,
      useTrueSolar,
      useEot,
      savedAt: Date.now(),
    }),
  );
}

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

function fmtCivil(c: CivilMoment): string {
  return `${c.year}-${pad(c.month)}-${pad(c.day)} ${pad(c.hour)}:${pad(c.minute)}`;
}

// ---- Compass SVG for 八宅 directions ----
function polar(cx: number, cy: number, r: number, deg: number): [number, number] {
  const rad = (deg * Math.PI) / 180;
  return [cx + r * Math.sin(rad), cy - r * Math.cos(rad)];
}

function sectorPath(cx: number, cy: number, r1: number, r2: number, a1: number, a2: number): string {
  const [x1, y1] = polar(cx, cy, r2, a1);
  const [x2, y2] = polar(cx, cy, r2, a2);
  const [x3, y3] = polar(cx, cy, r1, a2);
  const [x4, y4] = polar(cx, cy, r1, a1);
  return `M ${x1.toFixed(1)} ${y1.toFixed(1)} A ${r2} ${r2} 0 0 1 ${x2.toFixed(1)} ${y2.toFixed(1)} L ${x3.toFixed(1)} ${y3.toFixed(1)} A ${r1} ${r1} 0 0 0 ${x4.toFixed(1)} ${y4.toFixed(1)} Z`;
}

const DIR_ANGLE: Record<string, number> = {
  北: 0, 东北: 45, 东: 90, 东南: 135, 南: 180, 西南: 225, 西: 270, 西北: 315,
};

function compassSvg(gua: GuaInfo): string {
  const cx = 130;
  const cy = 130;
  const sectors = gua.stars
    .map((star) => {
      const a = DIR_ANGLE[star.direction];
      const path = sectorPath(cx, cy, 46, 112, a - 22.5, a + 22.5);
      const [dx, dy] = polar(cx, cy, 96, a);
      const [sx, sy] = polar(cx, cy, 68, a);
      const cls = star.auspicious ? "sector-good" : "sector-bad";
      return `
        <path d="${path}" class="${cls}"><title>${star.direction} · ${star.name}：${star.meaning}</title></path>
        <text x="${dx.toFixed(1)}" y="${dy.toFixed(1)}" class="compass-dir">${star.direction}</text>
        <text x="${sx.toFixed(1)}" y="${sy.toFixed(1)}" class="compass-star ${star.auspicious ? "star-good" : "star-bad"}">${star.name}</text>`;
    })
    .join("");
  return `
    <svg viewBox="0 0 260 260" class="compass" role="img" aria-label="八宅吉凶方位图">
      ${sectors}
      <circle cx="${cx}" cy="${cy}" r="44" class="compass-center-circle"/>
      <text x="${cx}" y="${cy - 6}" class="compass-center-gua">${gua.name}</text>
      <text x="${cx}" y="${cy + 16}" class="compass-center-sub">${gua.group}</text>
    </svg>`;
}

// ---- Copy summary ----
function buildSummaryText(bazi: BaziResult, gua: GuaInfo, meta: RenderMeta): string {
  const lines: string[] = [];
  lines.push(`【${meta.name || "命主"} · ${meta.gender === "male" ? "男" : "女"}】`);
  lines.push(`出生地：${meta.cityLabel}，公历 ${fmtCivil(meta.civil)}`);
  if (meta.correctionNote) lines.push(`${meta.correctionNote}（排盘用 ${fmtCivil(meta.effectiveCivil)}）`);
  lines.push(`农历：${bazi.lunarYear}年 ${bazi.lunarMonth}${bazi.lunarDay} · 属${bazi.shengXiao} · ${bazi.xingZuo}`);
  lines.push(`四柱：${bazi.pillars.map((p) => p.ganZhi).join(" ")}`);
  lines.push(
    `藏干：${bazi.pillars.map((p) => `${p.zhi}(${p.hiddenStems.map((h) => h.gan).join("")})`).join(" ")}`,
  );
  lines.push(`日主：${bazi.dayMaster.gan}${bazi.dayMaster.element} · ${bazi.strength.verdict}（同党 ${bazi.strength.supportPct.toFixed(0)}%）`);
  lines.push(`喜用：${bazi.strength.favorable.join("、")} · 忌：${bazi.strength.unfavorable.join("、")}`);
  if (bazi.tiaoHou.stems.length) {
    lines.push(`调候：${bazi.tiaoHou.stems.join("、")}（${bazi.tiaoHou.elements.join("、")}）`);
  }
  if (bazi.relations.length) {
    lines.push(`地支关系：${bazi.relations.map((r) => r.meaning.replace(/，.*$/, "")).join("；")}`);
  }
  lines.push(`胎元 ${bazi.taiYuan} · 命宫 ${bazi.mingGong} · 身宫 ${bazi.shenGong} · 日柱空亡 ${bazi.pillars[2].xunKong}`);
  lines.push(`命卦：${gua.name}卦（${gua.group}）`);
  lines.push(`四吉方：${gua.stars.filter((s) => s.auspicious).map((s) => `${s.name}${s.direction}`).join(" ")}`);
  lines.push(`四凶方：${gua.stars.filter((s) => !s.auspicious).map((s) => `${s.name}${s.direction}`).join(" ")}`);
  lines.push(`大运：${bazi.daYun.map((d) => `${d.startAge}岁${d.ganZhi}`).join(" ")}`);
  lines.push(`—— 由 命理风水 v${APP_VERSION} 生成，仅供参考`);
  return lines.join("\n");
}

interface RenderMeta {
  name: string;
  gender: "male" | "female";
  civil: CivilMoment;
  effectiveCivil: CivilMoment;
  correctionNote: string;
  cityLabel: string;
}

function renderResult(bazi: BaziResult, gua: GuaInfo, meta: RenderMeta) {
  const advice = deriveFengshuiAdvice(bazi.strength);
  const weighted = bazi.strength.weighted;
  const maxPct = Math.max(...ELEMENTS.map((e) => weighted[e]), 1);
  const badges = pillarBadges(bazi.relations);
  const goodBadge = (b: string) => b === "合" || b === "会";

  const pillarsHtml = bazi.pillars
    .map(
      (p, pi) => `
      <div class="pillar">
        <div class="pillar-label">${p.label} <span class="pillar-shishen">${p.shiShen}</span>${badges[pi]
          .map((b) => `<span class="rel-badge ${goodBadge(b) ? "rel-good" : "rel-bad"}">${b}</span>`)
          .join("")}</div>
        <div class="pillar-ganzhi">
          <span class="gan ${ELEMENT_CLASS[ganElement(p.gan)]}">${p.gan}</span>
          <span class="zhi ${ELEMENT_CLASS[ganElement(p.hiddenStems[0].gan)]}">${p.zhi}</span>
        </div>
        <div class="pillar-hidden">
          ${p.hiddenStems
            .map(
              (h) =>
                `<span class="hidden-stem"><b class="${ELEMENT_CLASS[ganElement(h.gan)]}">${h.gan}</b>·${h.shiShen}</span>`,
            )
            .join("")}
        </div>
        <div class="pillar-nayin">纳音：${p.naYin}</div>
        <div class="pillar-nayin">空亡：${p.xunKong}</div>
      </div>`,
    )
    .join("");

  const elementBars = ELEMENTS.map((e) => {
    const pct = weighted[e];
    const w = Math.round((pct / maxPct) * 100);
    let tag =
      bazi.strength.favorable.includes(e)
        ? `<span class="tag tag-good">喜</span>`
        : bazi.strength.unfavorable.includes(e)
          ? `<span class="tag tag-bad">忌</span>`
          : "";
    if (bazi.tiaoHou.elements.includes(e)) tag += `<span class="tag tag-tiao">调</span>`;
    return `
      <div class="element-row">
        <span class="element-name ${ELEMENT_CLASS[e]}">${e}</span>
        <div class="bar-track"><div class="bar-fill ${ELEMENT_CLASS[e]}" style="width:${w}%"></div></div>
        <span class="element-count">${pct.toFixed(1)}%${tag}</span>
      </div>`;
  }).join("");

  const supportPct = bazi.strength.supportPct;

  const liuNianElement = ganElement(bazi.liuNian.ganZhi[0]);
  const liuNianRemark = bazi.strength.favorable.includes(liuNianElement)
    ? "流年天干属喜用之行，宜积极进取"
    : bazi.strength.unfavorable.includes(liuNianElement)
      ? "流年天干属所忌之行，宜稳健行事"
      : "流年天干与喜忌无碍，平顺看待";

  const tiaoHouPrimary = bazi.tiaoHou.primaryElement;
  const adviceElements: { e: Element; viaTiaoHou: boolean }[] = advice.favorable.map((e) => ({
    e,
    viaTiaoHou: false,
  }));
  if (!advice.favorable.includes(tiaoHouPrimary)) {
    adviceElements.push({ e: tiaoHouPrimary, viaTiaoHou: true });
  }

  const adviceCards = adviceElements
    .map(({ e, viaTiaoHou }) => {
      const prof = ELEMENT_PROFILE[e];
      return `
      <div class="advice-card ${ELEMENT_CLASS[e]}">
        <h4>补${e}${viaTiaoHou ? ` <span class="tag tag-tiao">调候</span>` : ""}</h4>
        <p><strong>方位：</strong>${prof.direction}</p>
        <p><strong>颜色：</strong>${prof.color}</p>
        <p><strong>材质：</strong>${prof.material}</p>
        <p><strong>数字：</strong>${prof.number} · <strong>旺季：</strong>${prof.season}</p>
        <p><strong>建议：</strong>${prof.homeTip}</p>
        <p class="advice-avoid">${prof.avoidTip}</p>
      </div>`;
    })
    .join("");

  const tiaoHouConflict = bazi.strength.unfavorable.includes(tiaoHouPrimary)
    ? `本命扶抑忌「${tiaoHouPrimary}」而调候取「${tiaoHouPrimary}」，两说相左；实践中通常以调候（寒暖燥湿）优先。`
    : "";
  const tiaoHouHtml = bazi.tiaoHou.stems.length
    ? `
      <div class="tiaohou-box">
        <span class="tiaohou-title">调候用神</span>
        ${bazi.tiaoHou.stems
          .map((s) => `<b class="${ELEMENT_CLASS[ganElement(s)]}">${s}</b>`)
          .join("、")}
        <span class="tiaohou-elements">（${bazi.tiaoHou.elements.join("、")}）</span>
        <p class="hint">依《穷通宝鉴》通行简表，按日主与月令的寒暖燥湿取优先补救，首位为主用。${tiaoHouConflict}</p>
      </div>`
    : "";

  const goodKinds = ["六合", "三合", "半合", "三会"];
  const relationsHtml = bazi.relations.length
    ? bazi.relations
        .map(
          (r) => `
        <div class="relation-row">
          <span class="relation-kind ${goodKinds.includes(r.kind) ? "kind-good" : "kind-bad"}">${r.kind}</span>
          <span class="relation-meaning">${r.meaning}</span>
        </div>`,
        )
        .join("")
    : `<p class="hint">四柱地支之间无明显的合、冲、刑、害关系，盘面互动平静。</p>`;

  const starRows = gua.stars
    .map(
      (s) => `
      <div class="star-row ${s.auspicious ? "star-row-good" : "star-row-bad"}">
        <span class="star-name">${s.name}</span>
        <span class="star-dir">${s.direction}</span>
        <span class="star-meaning">${s.meaning}</span>
      </div>`,
    )
    .join("");

  const daYunHtml = bazi.daYun.length
    ? `<div class="dayun-scroll">${bazi.daYun
        .map(
          (d) => `
        <div class="dayun-item">
          <div class="dayun-age">${d.startAge}–${d.endAge}岁</div>
          <div class="dayun-ganzhi"><span class="${ELEMENT_CLASS[ganElement(d.ganZhi[0])]}">${d.ganZhi[0]}</span>${d.ganZhi[1]}</div>
          <div class="dayun-year">${d.startYear}–${d.endYear}</div>
        </div>`,
        )
        .join("")}</div>`
    : "";

  resultEl.innerHTML = `
    <div class="card">
      <div class="card-head">
        <h2>${meta.name ? `${meta.name} 的` : ""}四柱八字</h2>
        <button type="button" id="copy-btn" class="btn-secondary btn-small">复制结果</button>
      </div>
      <p class="hint">
        出生地：${meta.cityLabel} · 公历出生时刻：${fmtCivil(meta.civil)}
        ${meta.correctionNote ? `<br/>${meta.correctionNote}，排盘时刻：${fmtCivil(meta.effectiveCivil)}` : ""}
      </p>
      <p class="hint">农历：${bazi.lunarYear}年 ${bazi.lunarMonth}${bazi.lunarDay} · 属${bazi.shengXiao} · ${bazi.xingZuo} · 日主：${bazi.dayMaster.gan}（${bazi.dayMaster.element}）</p>
      <div class="pillars">${pillarsHtml}</div>
      <div class="mini-facts">
        <span>胎元 <b>${bazi.taiYuan}</b>（${bazi.taiYuanNaYin}）</span>
        <span>命宫 <b>${bazi.mingGong}</b>（${bazi.mingGongNaYin}）</span>
        <span>身宫 <b>${bazi.shenGong}</b></span>
        <span>流年 <b>${bazi.liuNian.year} ${bazi.liuNian.ganZhi}</b> · ${liuNianRemark}</span>
      </div>
    </div>

    <div class="card">
      <h2>地支关系</h2>
      <div class="relations">${relationsHtml}</div>
    </div>

    <div class="card">
      <h2>五行强弱与喜用神</h2>
      <div class="elements">${elementBars}</div>
      <div class="strength-meter">
        <div class="strength-labels">
          <span>身弱</span>
          <span class="strength-verdict">${bazi.strength.verdict} · 同党 ${supportPct.toFixed(0)}%</span>
          <span>身强</span>
        </div>
        <div class="strength-track">
          <div class="strength-zone" style="left:45%;width:10%"></div>
          <div class="strength-needle" style="left:${Math.min(Math.max(supportPct, 2), 98)}%"></div>
        </div>
      </div>
      <p class="advice-summary">${bazi.strength.reasoning}</p>
      ${tiaoHouHtml}
    </div>

    <div class="card">
      <h2>五行调理建议</h2>
      <div class="advice-grid">${adviceCards}</div>
      <p class="advice-summary">忌「${advice.unfavorable.join("、")}」：${advice.unfavorable.map((e) => ELEMENT_PROFILE[e].avoidTip).join("；")}。</p>
    </div>

    <div class="card">
      <h2>八宅命卦 · 吉凶方位</h2>
      <p class="hint">按立春为界的 ${bazi.fengshuiYear} 年${meta.gender === "male" ? "男" : "女"}命推得 <b>${gua.name}卦</b>（${gua.group}，属${gua.element}）。${gua.group === "东四命" ? "宜居东四宅（坐北、坐南、坐东、坐东南），" : "宜居西四宅（坐西、坐西北、坐西南、坐东北），"}大门、卧室、书房尽量落在吉方。</p>
      <div class="gua-layout">
        ${compassSvg(gua)}
        <div class="star-table">${starRows}</div>
      </div>
    </div>

    ${
      daYunHtml
        ? `<div class="card">
            <h2>大运</h2>
            <p class="hint">每步大运十年，自起运岁数起依次行进；干支五行与喜忌对照可粗判各阶段顺逆。</p>
            ${daYunHtml}
          </div>`
        : ""
    }
  `;

  document.querySelector<HTMLButtonElement>("#copy-btn")!.addEventListener("click", async (ev) => {
    const btn = ev.currentTarget as HTMLButtonElement;
    try {
      await navigator.clipboard.writeText(buildSummaryText(bazi, gua, meta));
      btn.textContent = "已复制 ✓";
    } catch {
      btn.textContent = "复制失败";
    }
    setTimeout(() => (btn.textContent = "复制结果"), 2000);
  });
}
