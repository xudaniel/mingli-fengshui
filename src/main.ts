import "./style.css";
import { CITIES, guessUtcOffset, searchPlace, type CityEntry } from "./lib/cities";
import { toTrueSolarTime, type CivilMoment } from "./lib/solarTime";
import { computeBazi, ELEMENTS, type BaziResult, type Element } from "./lib/bazi";
import { deriveFengshuiAdvice, ELEMENT_PROFILE } from "./lib/fengshui";

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
      <p class="subtitle">依据出生地与出生年月日时，排出四柱八字、五行分布与风水建议</p>
    </header>

    <main class="layout">
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

        <button type="submit" class="btn-primary">开始排盘</button>
      </form>

      <section id="result" class="result"></section>
    </main>

    <footer class="footer">
      <p>结果基于传统四柱八字排盘方法与简化的五行喜忌判断，仅供文化参考与娱乐，不构成任何专业建议。</p>
    </footer>
  </div>
`;

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

// ---- Form submit ----
const form = document.querySelector<HTMLFormElement>("#bazi-form")!;
const resultEl = document.querySelector<HTMLElement>("#result")!;

form.addEventListener("submit", (e) => {
  e.preventDefault();

  const dateVal = document.querySelector<HTMLInputElement>("#date")!.value;
  const timeVal = document.querySelector<HTMLInputElement>("#time")!.value;
  if (!dateVal || !timeVal) return;

  const [year, month, day] = dateVal.split("-").map(Number);
  const [hour, minute] = timeVal.split(":").map(Number);
  const civil: CivilMoment = { year, month, day, hour, minute };

  const gender = document.querySelector<HTMLInputElement>('input[name="gender"]:checked')!
    .value as "male" | "female";
  const name = document.querySelector<HTMLInputElement>("#name")!.value.trim();
  const longitude = Number(longitudeInput.value);
  const utcOffset = Number(utcOffsetInput.value);
  const useTrueSolar = document.querySelector<HTMLInputElement>("#use-true-solar")!.checked;
  const useEot = document.querySelector<HTMLInputElement>("#use-eot")!.checked;

  let effectiveCivil = civil;
  let correctionNote = "";
  if (useTrueSolar) {
    const solarTime = toTrueSolarTime(civil, {
      longitude,
      utcOffsetHours: utcOffset,
      applyEquationOfTime: useEot,
    });
    effectiveCivil = solarTime.corrected;
    const sign = solarTime.totalCorrectionMinutes >= 0 ? "+" : "";
    correctionNote = `已按出生地经度${useEot ? "与均时差" : ""}校正真太阳时：${sign}${solarTime.totalCorrectionMinutes.toFixed(1)} 分钟`;
  }

  const bazi = computeBazi(effectiveCivil, gender);
  renderResult(bazi, { name, civil, effectiveCivil, correctionNote, cityLabel: cityInput.value });
  resultEl.scrollIntoView({ behavior: "smooth", block: "start" });
});

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

function fmtCivil(c: CivilMoment): string {
  return `${c.year}-${pad(c.month)}-${pad(c.day)} ${pad(c.hour)}:${pad(c.minute)}`;
}

function ganEl(gan: string): Element {
  if ("甲乙".includes(gan)) return "木";
  if ("丙丁".includes(gan)) return "火";
  if ("戊己".includes(gan)) return "土";
  if ("庚辛".includes(gan)) return "金";
  return "水";
}

function zhiEl(zhi: string): Element {
  if ("寅卯".includes(zhi)) return "木";
  if ("巳午".includes(zhi)) return "火";
  if ("辰戌丑未".includes(zhi)) return "土";
  if ("申酉".includes(zhi)) return "金";
  return "水";
}

function renderResult(
  bazi: BaziResult,
  meta: { name: string; civil: CivilMoment; effectiveCivil: CivilMoment; correctionNote: string; cityLabel: string },
) {
  const advice = deriveFengshuiAdvice(bazi.elementCounts);
  const maxCount = Math.max(...ELEMENTS.map((e) => bazi.elementCounts[e]), 1);

  const pillarsHtml = bazi.pillars
    .map(
      (p) => `
      <div class="pillar">
        <div class="pillar-label">${p.label}</div>
        <div class="pillar-ganzhi">
          <span class="gan ${ELEMENT_CLASS[ganEl(p.gan)]}">${p.gan}</span>
          <span class="zhi ${ELEMENT_CLASS[zhiEl(p.zhi)]}">${p.zhi}</span>
        </div>
        <div class="pillar-meta">${p.wuXing} · ${p.shiShen}</div>
        <div class="pillar-nayin">纳音：${p.naYin}</div>
      </div>`,
    )
    .join("");

  const elementBars = ELEMENTS.map((e) => {
    const count = bazi.elementCounts[e];
    const pct = Math.round((count / maxCount) * 100);
    return `
      <div class="element-row">
        <span class="element-name ${ELEMENT_CLASS[e]}">${e}</span>
        <div class="bar-track"><div class="bar-fill ${ELEMENT_CLASS[e]}" style="width:${pct}%"></div></div>
        <span class="element-count">${count}</span>
      </div>`;
  }).join("");

  const adviceCards = advice.favorable.length
    ? advice.favorable
        .map((e) => {
          const prof = ELEMENT_PROFILE[e];
          return `
          <div class="advice-card ${ELEMENT_CLASS[e]}">
            <h4>补${e}</h4>
            <p><strong>方位：</strong>${prof.direction}</p>
            <p><strong>颜色：</strong>${prof.color}</p>
            <p><strong>建议：</strong>${prof.homeTip}</p>
          </div>`;
        })
        .join("")
    : `<div class="advice-card">
        <h4>五行均衡</h4>
        <p>八字五行分布较为均衡，家居布置以整洁协调为宜，无需刻意偏重某一属性。</p>
      </div>`;

  const daYunHtml = bazi.daYun.length
    ? `<div class="dayun-scroll">${bazi.daYun
        .map(
          (d) => `
        <div class="dayun-item">
          <div class="dayun-age">${d.startAge}–${d.endAge}岁</div>
          <div class="dayun-ganzhi">${d.ganZhi}</div>
          <div class="dayun-year">${d.startYear}–${d.endYear}</div>
        </div>`,
        )
        .join("")}</div>`
    : "";

  resultEl.innerHTML = `
    <div class="card">
      <h2>${meta.name ? `${meta.name} 的` : ""}四柱八字</h2>
      <p class="hint">
        出生地：${meta.cityLabel} · 公历出生时刻：${fmtCivil(meta.civil)}
        ${meta.correctionNote ? `<br/>${meta.correctionNote}，排盘时刻：${fmtCivil(meta.effectiveCivil)}` : ""}
      </p>
      <p class="hint">农历：${bazi.lunarYear}年 ${bazi.lunarMonth}${bazi.lunarDay} · 日主：${bazi.dayMaster.gan}（${bazi.dayMaster.element}）</p>
      <div class="pillars">${pillarsHtml}</div>
    </div>

    <div class="card">
      <h2>五行分布</h2>
      <div class="elements">${elementBars}</div>
      <p class="advice-summary">${advice.summary}</p>
    </div>

    <div class="card">
      <h2>风水建议</h2>
      <div class="advice-grid">${adviceCards}</div>
    </div>

    ${
      daYunHtml
        ? `<div class="card">
            <h2>大运</h2>
            ${daYunHtml}
          </div>`
        : ""
    }
  `;
}
