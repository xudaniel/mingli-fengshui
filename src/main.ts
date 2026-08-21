import "./style.css";
import { CITIES, guessUtcOffset, searchPlace, type CityEntry } from "./lib/cities";
import { toTrueSolarTime, shiftCivilMinutes, type CivilMoment } from "./lib/solarTime";
import { computeBazi, yearGanZhi, ELEMENTS, type BaziResult, type Element } from "./lib/bazi";
import { ganElement } from "./lib/analysis";
import { getElementProfile } from "./lib/fengshui";
import { computeGua, DIRECTIONS, type GuaInfo, type Direction } from "./lib/bagua";
import {
  loadProfiles,
  saveProfile,
  deleteProfile,
  renameProfile,
  clearProfiles,
  exportProfilesJson,
  importProfilesJson,
  migrateFromHistory,
  type Profile,
} from "./lib/profiles";
import { pillarBadges } from "./lib/relations";
import {
  inChinaDst,
  isPre1949China,
  DST_WARNING_TEXT,
  PRE_1949_HINT_TEXT,
} from "./lib/historicalTime";
import { detectTaiSui } from "./lib/taisui";
import { detectPeachBlossom } from "./lib/peachblossom";
import { detectShenSha } from "./lib/shensha";
import { interpretChart } from "./lib/interpret";
import { computeLifeCurve } from "./lib/lifecurve";
import { renderLifeCurveSvg } from "./views/lifeCurveSvg";
import { computeHouseGua, matchHouseToPerson, roomSuggestionFor } from "./lib/houseGua";
import { scanHourSensitivity, type HourSensitivityResult } from "./lib/hourSensitivity";
import { renderCompassSvg, DIR_EN, STAR_MEANING_EN } from "./views/compassSvg";
import { STAR_EN } from "./lib/i18n/terms";
import { encodeShareHash, decodeShareHash } from "./lib/shareLink";
import { t } from "./lib/i18n/dict";
import { getLang, setLang, type Lang } from "./lib/i18n/state";

const APP_VERSION = "2.2.0";
const LANG: Lang = getLang();
const tt = (key: string, vars?: Record<string, string | number>) => t(LANG, key, vars);

document.documentElement.lang = LANG === "en" ? "en" : "zh-CN";

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
      <h1>${tt("app.title")}</h1>
      <p class="subtitle">${tt("app.subtitle")}</p>
      <div class="hero-actions">
        <span class="version-badge">v${APP_VERSION}</span>
        <button type="button" id="lang-toggle" class="link-btn">${tt("app.lang.toggle")}</button>
        <button type="button" id="about-btn" class="link-btn">${tt("app.about")}</button>
      </div>
      <nav class="top-nav">
        <button type="button" class="nav-btn" data-view="home">${tt("nav.home")}</button>
        <button type="button" class="nav-btn" data-view="chart">${tt("nav.chart")}</button>
        <button type="button" class="nav-btn" data-view="compat">${tt("nav.compat")}</button>
        <button type="button" class="nav-btn" data-view="calendar">${tt("nav.calendar")}</button>
      </nav>
    </header>

    <main>
    <div id="view-home" class="single-view" hidden></div>
    <div class="layout" id="view-chart" hidden>
      <div class="side-col">
        <form id="bazi-form" class="card form-card">
          <div class="field">
            <label for="name">${tt("form.name")} <span class="optional">${tt("form.optional")}</span></label>
            <input id="name" name="name" type="text" placeholder="${tt("form.namePlaceholder")}" autocomplete="off" />
          </div>

          <div class="field">
            <span class="field-label">${tt("form.gender")}</span>
            <div class="radio-row">
              <label class="radio-pill"><input type="radio" name="gender" value="male" checked /> ${tt("form.male")}</label>
              <label class="radio-pill"><input type="radio" name="gender" value="female" /> ${tt("form.female")}</label>
            </div>
          </div>

          <div class="field-row">
            <div class="field">
              <label for="date">${tt("form.date")}</label>
              <input id="date" name="date" type="date" required />
            </div>
            <div class="field">
              <label for="time">${tt("form.time")}</label>
              <input id="time" name="time" type="time" required value="12:00" />
            </div>
          </div>

          <label class="checkbox-row">
            <input id="hour-unknown" type="checkbox" />
            ${tt("form.hourUnknown")}
          </label>

          <div class="field">
            <label for="city-input">${tt("form.city")}</label>
            <div class="place-row">
              <input id="city-input" type="text" placeholder="${tt("form.cityPlaceholder")}" autocomplete="off" />
              <button type="button" id="search-place-btn" class="btn-secondary">${tt("form.search")}</button>
            </div>
            <div id="quick-cities" class="quick-cities"></div>
            <div id="search-results" class="search-results"></div>
            <p id="place-status" class="hint"></p>
          </div>

          <div class="field-row">
            <div class="field">
              <label for="longitude">${tt("form.longitude")}</label>
              <input id="longitude" type="number" step="0.0001" required />
            </div>
            <div class="field">
              <label for="utc-offset">${tt("form.utcOffset")}</label>
              <input id="utc-offset" type="number" step="1" required value="8" />
            </div>
          </div>

          <div class="field checkbox-field">
            <label class="checkbox-row">
              <input id="use-true-solar" type="checkbox" checked />
              ${tt("form.useTrueSolar")}
            </label>
            <label class="checkbox-row sub-checkbox">
              <input id="use-eot" type="checkbox" checked />
              ${tt("form.useEot")}
            </label>
          </div>

          <div id="dst-warning" class="warn-box" hidden>
            <p>⚠️ ${DST_WARNING_TEXT}</p>
            <label class="checkbox-row">
              <input id="dst-adjust" type="checkbox" checked />
              ${tt("form.dstAdjust")}
            </label>
          </div>
          <div id="pre1949-hint" class="warn-box" hidden>
            <p>⚠️ ${PRE_1949_HINT_TEXT}</p>
          </div>

          <button type="submit" class="btn-primary">${tt("form.submit")}</button>
        </form>

        <div id="profiles-card" class="card history-card" hidden>
          <div class="history-head">
            <h2>${tt("profiles.title")}</h2>
            <div class="profiles-actions">
              <button type="button" id="export-profiles-btn" class="link-btn">${tt("profiles.export")}</button>
              <button type="button" id="import-profiles-btn" class="link-btn">${tt("profiles.import")}</button>
              <button type="button" id="clear-profiles-btn" class="link-btn">${tt("profiles.clear")}</button>
            </div>
          </div>
          <input type="file" id="import-file-input" accept="application/json" hidden />
          <p id="import-status" class="hint"></p>
          <div id="profiles-list" class="history-list"></div>
        </div>
      </div>

      <section id="result" class="result"></section>
    </div>

    <div id="view-generic" class="single-view" hidden></div>
    </main>

    <footer class="footer">
      <p>${tt("footer.disclaimer")}</p>
      <p>命理风水 v${APP_VERSION} · <a href="https://github.com/xudaniel" target="_blank" rel="noopener">Daniel Xu</a> · lunar-javascript · <a href="https://github.com/xudaniel/mingli-fengshui" target="_blank" rel="noopener">GitHub</a></p>
    </footer>

    <dialog id="about-dialog" class="about-dialog">
      <h2>${tt("about.title")}</h2>
      <p class="about-version">v${APP_VERSION} · Daniel Xu · MIT</p>
      <h3>${tt("about.whatTitle")}</h3>
      <ul>
        <li>${tt("about.li.solar")}</li>
        <li>${tt("about.li.bazi")}</li>
        <li>${tt("about.li.strength")}</li>
        <li>${tt("about.li.relations")}</li>
        <li>${tt("about.li.gua")}</li>
        <li>${tt("about.li.extra")}</li>
        <li>${tt("about.li.portal")}</li>
      </ul>
      <h3>${tt("about.whatNotTitle")}</h3>
      <p>${tt("about.whatNot")}</p>
      <h3>${tt("about.privacyTitle")}</h3>
      <p>${tt("about.privacy")}</p>
      <form method="dialog"><button class="btn-secondary">${tt("about.close")}</button></form>
    </dialog>
  </div>
`;

migrateFromHistory();

// ---- Language toggle ----
document.querySelector("#lang-toggle")!.addEventListener("click", () => {
  setLang(LANG === "en" ? "zh" : "en");
  location.reload();
});

// ---- About dialog ----
const aboutDialog = document.querySelector<HTMLDialogElement>("#about-dialog")!;
document.querySelector("#about-btn")!.addEventListener("click", () => aboutDialog.showModal());

// ---- Top nav (data-driven: home + chart are eager/static, everything else
// is a lazy-loaded view rendered into the shared #view-generic container —
// see #10's bundle-size lesson: most visits never touch most of these) ----
const viewHome = document.querySelector<HTMLElement>("#view-home")!;
const viewChart = document.querySelector<HTMLElement>("#view-chart")!;
const viewGeneric = document.querySelector<HTMLElement>("#view-generic")!;

const GENERIC_RENDERERS: Record<string, () => Promise<void>> = {
  compat: async () => (await import("./views/compatView")).renderCompatView(viewGeneric, LANG),
  calendar: async () => (await import("./views/calendarView")).renderCalendarView(viewGeneric, LANG),
  ziwei: async () => (await import("./views/ziweiView")).renderZiweiView(viewGeneric, LANG),
  flyingstar: async () => (await import("./views/flyingStarView")).renderFlyingStarView(viewGeneric, LANG),
  naming: async () => (await import("./views/namingView")).renderNamingView(viewGeneric, LANG),
  dreams: async () => (await import("./views/dreamsView")).renderDreamsView(viewGeneric, LANG),
  iching: async () => (await import("./views/ichingView")).renderIchingView(viewGeneric, LANG),
  qimen: async () => (await import("./views/qimenView")).renderQimenView(viewGeneric, LANG),
  almanac: async () => (await import("./views/almanacView")).renderAlmanacView(viewGeneric, LANG),
  report: async () => (await import("./views/reportView")).renderReportView(viewGeneric, LANG),
};

async function navigateTo(view: string): Promise<void> {
  document.querySelectorAll(".nav-btn").forEach((b) => b.classList.remove("active"));
  document.querySelector(`.nav-btn[data-view="${view}"]`)?.classList.add("active");
  viewHome.hidden = view !== "home";
  viewChart.hidden = view !== "chart";
  viewGeneric.hidden = view === "home" || view === "chart";

  if (view === "home") {
    const { renderHomeView } = await import("./views/homeView");
    renderHomeView(viewHome, LANG, (key) => void navigateTo(key));
  } else {
    await GENERIC_RENDERERS[view]?.();
  }
}

document.querySelectorAll<HTMLButtonElement>(".nav-btn").forEach((btn) => {
  btn.addEventListener("click", () => navigateTo(btn.dataset.view!));
});

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
const hourUnknownInput = document.querySelector<HTMLInputElement>("#hour-unknown")!;
const timeInput = document.querySelector<HTMLInputElement>("#time")!;

hourUnknownInput.addEventListener("change", () => {
  timeInput.disabled = hourUnknownInput.checked;
});

function applyCity(name: string, longitude: number, utcOffset: number, note?: string) {
  cityInput.value = name;
  longitudeInput.value = longitude.toFixed(4);
  utcOffsetInput.value = String(utcOffset);
  placeStatus.textContent =
    note ?? `${tt("result.birthplace")}: ${longitude.toFixed(4)}°, UTC${utcOffset >= 0 ? "+" : ""}${utcOffset}`;
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
    searchResultsEl.innerHTML = `<p class="hint">--</p>`;
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
        label: `${c.name}（${c.region}）· ${c.longitude.toFixed(2)}° · UTC${c.utcOffset >= 0 ? "+" : ""}${c.utcOffset}`,
        longitude: c.longitude,
        utcOffset: c.utcOffset,
      })),
    );
    return;
  }

  placeStatus.textContent = "…";
  searchBtn.disabled = true;
  try {
    const results = await searchPlace(q);
    renderSearchResults(
      results.map((r) => ({
        label: r.displayName,
        longitude: r.longitude,
        utcOffset: guessUtcOffset(r.longitude),
        note: `${r.longitude.toFixed(4)}°`,
      })),
    );
  } catch (err) {
    placeStatus.textContent = err instanceof Error ? err.message : "error";
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

applyCity("北京", 116.4074, 8);

// ---- Load from share link (#...) if present (applied after runChart is wired below) ----
const sharedState = decodeShareHash(location.hash);

// ---- Historical-time warnings ----
const dstWarningEl = document.querySelector<HTMLDivElement>("#dst-warning")!;
const pre1949HintEl = document.querySelector<HTMLDivElement>("#pre1949-hint")!;

function readCivilFromForm(): CivilMoment | null {
  const dateVal = document.querySelector<HTMLInputElement>("#date")!.value;
  const timeVal = hourUnknownInput.checked ? "12:00" : timeInput.value;
  if (!dateVal || !timeVal) return null;
  const [year, month, day] = dateVal.split("-").map(Number);
  const [hour, minute] = timeVal.split(":").map(Number);
  return { year, month, day, hour, minute };
}

function updateHistoricalWarnings() {
  const civil = readCivilFromForm();
  const utcOffset = Number(utcOffsetInput.value);
  const longitude = Number(longitudeInput.value);
  const dstApplies = civil !== null && !hourUnknownInput.checked && utcOffset === 8 && inChinaDst(civil);
  dstWarningEl.hidden = !dstApplies;
  pre1949HintEl.hidden = !(civil !== null && isPre1949China(civil, longitude));
}

for (const sel of ["#date", "#time", "#utc-offset", "#longitude"]) {
  document.querySelector(sel)!.addEventListener("input", updateHistoricalWarnings);
}
hourUnknownInput.addEventListener("change", updateHistoricalWarnings);

// ---- Profiles ----
const profilesCard = document.querySelector<HTMLDivElement>("#profiles-card")!;
const profilesList = document.querySelector<HTMLDivElement>("#profiles-list")!;
let currentProfileId: string | null = null;

function renderProfiles(list: Profile[]) {
  profilesCard.hidden = list.length === 0;
  profilesList.innerHTML = list
    .map(
      (p) => `
      <div class="history-item profile-item" data-id="${p.id}">
        <button type="button" class="profile-main">
          <span class="history-title">${p.label || tt("profiles.empty")} · ${p.gender === "male" ? tt("form.male") : tt("form.female")}</span>
          <span class="history-sub">${p.date} ${p.hourUnknown ? "?" : p.time} · ${p.city}</span>
        </button>
        <button type="button" class="profile-rename" title="rename" data-id="${p.id}">✎</button>
        <button type="button" class="profile-delete" title="delete" data-id="${p.id}">×</button>
      </div>`,
    )
    .join("");

  profilesList.querySelectorAll<HTMLButtonElement>(".profile-main").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.closest<HTMLElement>(".profile-item")!.dataset.id!;
      const p = list.find((x) => x.id === id);
      if (p) {
        fillForm(p);
        currentProfileId = p.id;
        runChart();
      }
    });
  });
  profilesList.querySelectorAll<HTMLButtonElement>(".profile-rename").forEach((btn) => {
    btn.addEventListener("click", (ev) => {
      ev.stopPropagation();
      const id = btn.dataset.id!;
      const p = list.find((x) => x.id === id);
      const next = prompt("", p?.label ?? "");
      if (next) {
        renameProfile(id, next);
        renderProfiles(loadProfiles());
      }
    });
  });
  profilesList.querySelectorAll<HTMLButtonElement>(".profile-delete").forEach((btn) => {
    btn.addEventListener("click", (ev) => {
      ev.stopPropagation();
      deleteProfile(btn.dataset.id!);
      renderProfiles(loadProfiles());
    });
  });
}

type FormFillable = Pick<
  Profile,
  "name" | "gender" | "date" | "time" | "hourUnknown" | "city" | "longitude" | "utcOffset" | "useTrueSolar" | "useEot"
>;

function fillForm(p: FormFillable) {
  document.querySelector<HTMLInputElement>("#name")!.value = p.name;
  document.querySelector<HTMLInputElement>(`input[name="gender"][value="${p.gender}"]`)!.checked = true;
  document.querySelector<HTMLInputElement>("#date")!.value = p.date;
  hourUnknownInput.checked = p.hourUnknown;
  timeInput.disabled = p.hourUnknown;
  timeInput.value = p.hourUnknown ? "12:00" : p.time;
  cityInput.value = p.city;
  longitudeInput.value = p.longitude.toFixed(4);
  utcOffsetInput.value = String(p.utcOffset);
  document.querySelector<HTMLInputElement>("#use-true-solar")!.checked = p.useTrueSolar;
  document.querySelector<HTMLInputElement>("#use-eot")!.checked = p.useEot;
}

document.querySelector("#clear-profiles-btn")!.addEventListener("click", () => {
  clearProfiles();
  renderProfiles([]);
});

document.querySelector("#export-profiles-btn")!.addEventListener("click", () => {
  const json = exportProfilesJson();
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `mingli-fengshui-profiles-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
});

const importFileInput = document.querySelector<HTMLInputElement>("#import-file-input")!;
const importStatus = document.querySelector<HTMLParagraphElement>("#import-status")!;
document.querySelector("#import-profiles-btn")!.addEventListener("click", () => importFileInput.click());
importFileInput.addEventListener("change", async () => {
  const file = importFileInput.files?.[0];
  if (!file) return;
  try {
    const text = await file.text();
    const result = importProfilesJson(text);
    importStatus.textContent = tt("profiles.importSuccess", { added: result.added, skipped: result.skipped });
    renderProfiles(loadProfiles());
  } catch (err) {
    importStatus.textContent = tt("profiles.importFail", { error: err instanceof Error ? err.message : String(err) });
  }
  importFileInput.value = "";
});

renderProfiles(loadProfiles());

// ---- Form submit ----
const form = document.querySelector<HTMLFormElement>("#bazi-form")!;
const resultEl = document.querySelector<HTMLElement>("#result")!;

form.addEventListener("submit", (e) => {
  e.preventDefault();
  runChart();
  resultEl.scrollIntoView({ behavior: "smooth", block: "start" });
});

if (sharedState) {
  fillForm(sharedState);
  updateHistoricalWarnings();
  runChart();
  void navigateTo("chart");
  resultEl.scrollIntoView({ behavior: "smooth", block: "start" });
} else {
  void navigateTo("home");
}

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

function fmtCivil(c: CivilMoment): string {
  return `${c.year}-${pad(c.month)}-${pad(c.day)} ${pad(c.hour)}:${pad(c.minute)}`;
}

function runChart() {
  updateHistoricalWarnings();
  const civil = readCivilFromForm();
  if (!civil) return;
  const dateVal = document.querySelector<HTMLInputElement>("#date")!.value;
  const timeVal = timeInput.value;
  const hourUnknown = hourUnknownInput.checked;

  const gender = document.querySelector<HTMLInputElement>('input[name="gender"]:checked')!
    .value as "male" | "female";
  const name = document.querySelector<HTMLInputElement>("#name")!.value.trim();
  const longitude = Number(longitudeInput.value);
  const utcOffset = Number(utcOffsetInput.value);
  const useTrueSolar = document.querySelector<HTMLInputElement>("#use-true-solar")!.checked;
  const useEot = document.querySelector<HTMLInputElement>("#use-eot")!.checked;

  const notes: string[] = [];
  let effectiveCivil = civil;

  if (!hourUnknown) {
    const dstAdjust = document.querySelector<HTMLInputElement>("#dst-adjust")!;
    if (!dstWarningEl.hidden && dstAdjust.checked) {
      effectiveCivil = shiftCivilMinutes(effectiveCivil, -60);
      notes.push("DST -1h");
    }
    if (useTrueSolar) {
      const solarTime = toTrueSolarTime(effectiveCivil, {
        longitude,
        utcOffsetHours: utcOffset,
        applyEquationOfTime: useEot,
      });
      effectiveCivil = solarTime.corrected;
      const sign = solarTime.totalCorrectionMinutes >= 0 ? "+" : "";
      notes.push(`${sign}${solarTime.totalCorrectionMinutes.toFixed(1)}min`);
    }
  }
  const correctionNote = notes.join("; ");

  const bazi = computeBazi(effectiveCivil, gender);
  const gua = computeGua(bazi.fengshuiYear, gender);
  const hourScan = hourUnknown ? scanHourSensitivity({ year: civil.year, month: civil.month, day: civil.day }, gender) : undefined;

  renderResult(bazi, gua, {
    name,
    gender,
    civil,
    effectiveCivil,
    correctionNote,
    cityLabel: cityInput.value,
    hourUnknown,
    hourScan,
  });

  const saved = saveProfile({
    id: currentProfileId ?? undefined,
    label: name || `${cityInput.value} ${dateVal}`,
    name,
    gender,
    date: dateVal,
    time: hourUnknown ? "" : timeVal,
    hourUnknown,
    city: cityInput.value,
    longitude,
    utcOffset,
    useTrueSolar,
    useEot,
  });
  currentProfileId = saved.id;
  renderProfiles(loadProfiles());
}

// ---- Result rendering ----
interface RenderMeta {
  name: string;
  gender: "male" | "female";
  civil: CivilMoment;
  effectiveCivil: CivilMoment;
  correctionNote: string;
  cityLabel: string;
  hourUnknown: boolean;
  hourScan?: HourSensitivityResult;
}

function buildSummaryText(bazi: BaziResult, gua: GuaInfo, meta: RenderMeta): string {
  const lines: string[] = [];
  lines.push(`[${meta.name || "-"} · ${meta.gender === "male" ? tt("form.male") : tt("form.female")}]`);
  lines.push(`${tt("result.birthplace")}: ${meta.cityLabel}, ${fmtCivil(meta.civil)}`);
  if (meta.correctionNote) lines.push(`${meta.correctionNote} (${fmtCivil(meta.effectiveCivil)})`);
  lines.push(`${bazi.lunarYear} ${bazi.lunarMonth}${bazi.lunarDay} · ${tt("result.zodiac")}${bazi.shengXiao} · ${bazi.xingZuo}`);
  const pillarGanZhis = bazi.pillars.map((p, i) => (i === 3 && meta.hourUnknown ? "??" : p.ganZhi));
  lines.push(pillarGanZhis.join(" "));
  if (!meta.hourUnknown) {
    lines.push(
      `${bazi.pillars.map((p) => `${p.zhi}(${p.hiddenStems.map((h) => h.gan).join("")})`).join(" ")}`,
    );
  }
  if (meta.hourUnknown && meta.hourScan) {
    lines.push(
      `${tt("result.dayMaster")}: ${bazi.dayMaster.gan}${bazi.dayMaster.element} · ${tt("hour.dominant")}: ${meta.hourScan.dominantVerdict}`,
    );
    lines.push(`${tt("hour.robustFavorable")}: ${meta.hourScan.favorableInAll.join("、") || "--"}`);
  } else {
    lines.push(`${tt("result.dayMaster")}: ${bazi.dayMaster.gan}${bazi.dayMaster.element} · ${bazi.strength.verdict} (${bazi.strength.supportPct.toFixed(0)}%)`);
    lines.push(`${tt("strength.favorable")}: ${bazi.strength.favorable.join("、")} · ${tt("strength.unfavorable")}: ${bazi.strength.unfavorable.join("、")}`);
  }
  if (bazi.tiaoHou.stems.length) {
    lines.push(`${tt("strength.tiaohouTitle")}: ${bazi.tiaoHou.stems.join("、")} (${bazi.tiaoHou.elements.join("、")})`);
  }
  const summaryRelations = meta.hourUnknown ? bazi.relations.filter((r) => !r.pillars.includes(3)) : bazi.relations;
  if (summaryRelations.length) {
    lines.push(`${tt("relations.title")}: ${summaryRelations.map((r) => r.meaning.replace(/，.*$/, "")).join("；")}`);
  }
  lines.push(
    meta.hourUnknown
      ? `${tt("result.taiyuan")} ${bazi.taiYuan}`
      : `${tt("result.taiyuan")} ${bazi.taiYuan} · ${tt("result.minggong")} ${bazi.mingGong} · ${tt("result.shengong")} ${bazi.shenGong}`,
  );
  lines.push(`${gua.name} (${gua.group})`);
  lines.push(`${bazi.daYun.map((d) => `${d.startAge}${tt("common.age")}${d.ganZhi}`).join(" ")}`);
  lines.push(`-- ${tt("app.title")} v${APP_VERSION}`);
  return lines.join("\n");
}

function renderResult(bazi: BaziResult, gua: GuaInfo, meta: RenderMeta) {
  const weighted = bazi.strength.weighted;
  const maxPct = Math.max(...ELEMENTS.map((e) => weighted[e]), 1);
  const badges = pillarBadges(bazi.relations);
  const goodBadge = (b: string) => b === "合" || b === "会";

  const pillarsHtml = bazi.pillars
    .map((p, pi) => {
      if (pi === 3 && meta.hourUnknown) {
        return `
        <div class="pillar pillar-unknown">
          <div class="pillar-label">${p.label}</div>
          <div class="pillar-ganzhi"><span class="unknown-mark">?</span></div>
          <div class="pillar-nayin">${tt("form.hourUnknown")}</div>
        </div>`;
      }
      return `
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
        <div class="pillar-nayin">${tt("result.nayin")}：${p.naYin}</div>
        <div class="pillar-nayin">${tt("result.xunkong")}：${p.xunKong}</div>
      </div>`;
    })
    .join("");

  const displayFavorable = meta.hourUnknown && meta.hourScan ? meta.hourScan.favorableInAll : bazi.strength.favorable;
  const displayUnfavorable = meta.hourUnknown ? [] : bazi.strength.unfavorable;

  const elementBars = ELEMENTS.map((e) => {
    const pct = weighted[e];
    const w = Math.round((pct / maxPct) * 100);
    let tag =
      displayFavorable.includes(e)
        ? `<span class="tag tag-good">${tt("strength.favorable")}</span>`
        : displayUnfavorable.includes(e)
          ? `<span class="tag tag-bad">${tt("strength.unfavorable")}</span>`
          : "";
    if (bazi.tiaoHou.elements.includes(e)) tag += `<span class="tag tag-tiao">${tt("strength.tiaohou")}</span>`;
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
    ? "↑"
    : bazi.strength.unfavorable.includes(liuNianElement)
      ? "↓"
      : "·";

  const tiaoHouPrimary = bazi.tiaoHou.primaryElement;
  const adviceElements: { e: Element; viaTiaoHou: boolean }[] = displayFavorable.map((e) => ({
    e,
    viaTiaoHou: false,
  }));
  if (!displayFavorable.includes(tiaoHouPrimary)) adviceElements.push({ e: tiaoHouPrimary, viaTiaoHou: true });

  const adviceCards = adviceElements
    .map(({ e, viaTiaoHou }) => {
      const prof = getElementProfile(LANG, e);
      return `
      <div class="advice-card ${ELEMENT_CLASS[e]}">
        <h4>${e}${viaTiaoHou ? ` <span class="tag tag-tiao">${tt("advice.tiaohouTag")}</span>` : ""}</h4>
        <p><strong>${tt("advice.direction")}：</strong>${prof.direction}</p>
        <p><strong>${tt("advice.color")}：</strong>${prof.color}</p>
        <p><strong>${tt("advice.material")}：</strong>${prof.material}</p>
        <p><strong>${tt("advice.number")}：</strong>${prof.number} · <strong>${tt("advice.season")}：</strong>${prof.season}</p>
        <p><strong>${tt("advice.tip")}：</strong>${prof.homeTip}</p>
        <p class="advice-avoid">${prof.avoidTip}</p>
      </div>`;
    })
    .join("");

  const tiaoHouConflict = bazi.strength.unfavorable.includes(tiaoHouPrimary)
    ? tt("strength.tiaohouConflict", { el: tiaoHouPrimary })
    : "";
  const tiaoHouHtml = bazi.tiaoHou.stems.length
    ? `
      <div class="tiaohou-box">
        <span class="tiaohou-title">${tt("strength.tiaohouTitle")}</span>
        ${bazi.tiaoHou.stems.map((s) => `<b class="${ELEMENT_CLASS[ganElement(s)]}">${s}</b>`).join("、")}
        <span class="tiaohou-elements">（${bazi.tiaoHou.elements.join("、")}）</span>
        <p class="hint">${tt("strength.tiaohouNote")}${tiaoHouConflict}</p>
      </div>`
    : "";

  // 时辰不详时，涉及时柱（下标 3）的关系基于占位时辰，不应作为事实展示
  const shownRelations = meta.hourUnknown ? bazi.relations.filter((r) => !r.pillars.includes(3)) : bazi.relations;
  const goodKinds = ["六合", "三合", "半合", "三会"];
  const relationsHtml = shownRelations.length
    ? shownRelations
        .map(
          (r) => `
        <div class="relation-row">
          <span class="relation-kind ${goodKinds.includes(r.kind) ? "kind-good" : "kind-bad"}">${r.kind}</span>
          <span class="relation-meaning">${r.meaning}</span>
        </div>`,
        )
        .join("")
    : `<p class="hint">${tt("relations.empty")}</p>`;

  const starRows = gua.stars
    .map(
      (s) => `
      <div class="star-row ${s.auspicious ? "star-row-good" : "star-row-bad"}">
        <span class="star-name">${LANG === "en" ? STAR_EN[s.name] ?? s.name : s.name}</span>
        <span class="star-dir">${LANG === "en" ? DIR_EN[s.direction] ?? s.direction : s.direction}</span>
        <span class="star-meaning">${LANG === "en" ? STAR_MEANING_EN[s.name] ?? s.meaning : s.meaning}</span>
      </div>`,
    )
    .join("");

  const nowYearForDaYun = new Date().getFullYear();
  const daYunHtml = bazi.daYun.length
    ? `<div class="dayun-scroll">${bazi.daYun
        .map((d) => {
          const isCurrent = nowYearForDaYun >= d.startYear && nowYearForDaYun <= d.endYear;
          return `
        <button type="button" class="dayun-item${isCurrent ? " dayun-current" : ""}" data-start="${d.startYear}" data-end="${d.endYear}" data-start-age="${d.startAge}">
          <div class="dayun-age">${d.startAge}–${d.endAge}${tt("common.age")}</div>
          <div class="dayun-ganzhi"><span class="${ELEMENT_CLASS[ganElement(d.ganZhi[0])]}">${d.ganZhi[0]}</span>${d.ganZhi[1]}</div>
          <div class="dayun-year">${d.startYear}–${d.endYear}</div>
        </button>`;
        })
        .join("")}</div>
      <div id="liunian-panel" class="liunian-panel"></div>`
    : "";

  // ---- 神煞（含桃花）----
  const branchesOnly = bazi.pillars.map((p) => p.zhi);
  const peachHits = detectPeachBlossom(branchesOnly);
  const shenShaHits = detectShenSha(bazi.dayMaster.gan, branchesOnly[0], branchesOnly[2], branchesOnly);
  const pillarLabels = bazi.pillars.map((p) => p.label);
  const shenShaRows: string[] = [];
  for (const hit of peachHits.hits) {
    shenShaRows.push(`
      <div class="relation-row kind-good">
        <span class="relation-kind">${tt("shensha.peachBlossom")}</span>
        <span class="relation-meaning">${tt("shensha.pillars")} ${hit.pillars.map((i) => pillarLabels[i]).join("、")}（${hit.peachZhi}） · ${tt("shensha.peachBlossomMeaning")}</span>
      </div>`);
  }
  for (const hit of shenShaHits) {
    shenShaRows.push(`
      <div class="relation-row ${hit.auspicious ? "kind-good" : "kind-bad"}">
        <span class="relation-kind">${hit.name}</span>
        <span class="relation-meaning">${tt("shensha.pillars")} ${hit.pillars.map((i) => pillarLabels[i]).join("、")} · ${hit.meaning}</span>
      </div>`);
  }
  const shenShaHtml = shenShaRows.length ? shenShaRows.join("") : `<p class="hint">${tt("shensha.none")}</p>`;

  // ---- 犯太岁 ----
  const nowYear = new Date().getFullYear();
  const taiSuiHits = detectTaiSui(bazi.pillars[0].zhi, nowYear, 12);
  const taiSuiHtml = taiSuiHits.length
    ? taiSuiHits
        .map(
          (h) => `
      <div class="relation-row ${h.kind === "值太岁" ? "kind-bad" : "kind-neutral"}">
        <span class="relation-kind">${h.year}${h.year === nowYear ? ` (${tt("taisui.thisYear")})` : ""} · ${h.kind}</span>
        <span class="relation-meaning">${h.meaning}</span>
      </div>`,
        )
        .join("")
    : `<p class="hint">${tt("taisui.none")}</p>`;

  // ---- 十神解读 ----
  const interp = interpretChart(bazi, LANG);
  const interpretHtml = interp.paragraphs.map((p) => `<p>${p}</p>`).join("");

  // ---- 走势图 ----
  const curve = computeLifeCurve(bazi.strength.favorable, bazi.strength.unfavorable, bazi.daYun);
  const curveHtml = curve.years.length ? renderLifeCurveSvg(curve, nowYear) : "";

  // ---- 十二时辰扫描 ----
  const hourScanHtml = meta.hourScan
    ? `
      <div class="card">
        <h2>${tt("hour.title")}</h2>
        <p class="hint">${tt("hour.hint")}</p>
        <p class="hint"><strong>${tt("hour.stable")}：</strong>${meta.hourScan.stable.yearGanZhi} ${meta.hourScan.stable.monthGanZhi} ${meta.hourScan.stable.dayGanZhi} · ${meta.hourScan.stable.shengXiao} · ${meta.hourScan.stable.xingZuo}</p>
        <p class="hint"><strong>${tt("hour.dominant")}：</strong>${meta.hourScan.dominantVerdict}（${meta.hourScan.verdictCounts[meta.hourScan.dominantVerdict]}/12）</p>
        <p class="hint"><strong>${tt("hour.robustFavorable")}：</strong>${meta.hourScan.favorableInAll.join("、") || "--"}</p>
        <div class="hour-scan-table">
          ${meta.hourScan.candidates
            .map(
              (c) => `
            <div class="hour-scan-row">
              <span class="hour-scan-zhi">${c.zhi}</span>
              <span class="hour-scan-label">${c.label}</span>
              <span class="hour-scan-ganzhi">${c.hourGanZhi}</span>
              <span class="hour-scan-verdict">${c.verdict}</span>
              <span class="hour-scan-fav">${c.favorable.join("")}</span>
            </div>`,
            )
            .join("")}
        </div>
      </div>`
    : "";

  const compassBtnHtml =
    typeof window !== "undefined" &&
    "DeviceOrientationEvent" in window &&
    matchMedia("(pointer: coarse)").matches
      ? `<button type="button" id="compass-btn" class="btn-secondary btn-small">${tt("gua.compass")}</button>`
      : "";

  resultEl.innerHTML = `
    <div class="card">
      <div class="card-head">
        <h2>${meta.name ? `${meta.name}${tt("result.of")} ` : ""}${tt("result.title")}</h2>
        <div class="card-head-actions">
          <button type="button" id="save-image-btn" class="btn-secondary btn-small">${tt("result.saveImage")}</button>
          <button type="button" id="share-link-btn" class="btn-secondary btn-small">${tt("result.shareLink")}</button>
          <button type="button" id="copy-btn" class="btn-secondary btn-small">${tt("result.copy")}</button>
        </div>
      </div>
      <p class="hint">
        ${tt("result.birthplace")}：${meta.cityLabel} · ${tt("result.civilTime")}：${fmtCivil(meta.civil)}
        ${meta.correctionNote ? `<br/>${meta.correctionNote}` : ""}
        ${meta.hourUnknown ? `<br/>${tt("result.hourUnknownNote")}` : ""}
      </p>
      <p class="hint">${bazi.lunarYear}年 ${bazi.lunarMonth}${bazi.lunarDay} · ${tt("result.zodiac")}${bazi.shengXiao} · ${bazi.xingZuo} · ${tt("result.dayMaster")}：${bazi.dayMaster.gan}（${bazi.dayMaster.element}）</p>
      <div class="pillars">${pillarsHtml}</div>
      <div class="mini-facts">
        <span>${tt("result.taiyuan")} <b>${bazi.taiYuan}</b>（${bazi.taiYuanNaYin}）</span>
        ${
          meta.hourUnknown
            ? ""
            : `<span>${tt("result.minggong")} <b>${bazi.mingGong}</b>（${bazi.mingGongNaYin}）</span>
        <span>${tt("result.shengong")} <b>${bazi.shenGong}</b></span>`
        }
        <span>${tt("result.liunian")} <b>${bazi.liuNian.year} ${bazi.liuNian.ganZhi}</b> ${liuNianRemark}</span>
      </div>
    </div>

    <div class="card">
      <h2>${tt("relations.title")}</h2>
      <div class="relations">${relationsHtml}</div>
    </div>

    <div class="card">
      <h2>${tt("strength.title")}</h2>
      <div class="elements">${elementBars}</div>
      ${
        !meta.hourUnknown
          ? `
      <div class="strength-meter">
        <div class="strength-labels">
          <span>${tt("strength.weak")}</span>
          <span class="strength-verdict">${bazi.strength.verdict} · ${tt("strength.support")} ${supportPct.toFixed(0)}%</span>
          <span>${tt("strength.strong")}</span>
        </div>
        <div class="strength-track">
          <div class="strength-zone" style="left:45%;width:10%"></div>
          <div class="strength-needle" style="left:${Math.min(Math.max(supportPct, 2), 98)}%"></div>
        </div>
      </div>
      <p class="advice-summary">${bazi.strength.reasoning}</p>
      ${tiaoHouHtml}`
          : `<p class="advice-summary">${tt("result.hourUnknownNote")}</p>`
      }
    </div>

    <div class="card">
      <h2>${tt("advice.title")}</h2>
      <div class="advice-grid">${adviceCards}</div>
    </div>

    <div class="card">
      <h2>${tt("gua.title")}</h2>
      <p class="hint">${gua.name}（${gua.group}，${gua.element}）。${gua.group === "东四命" ? tt("gua.eastGroup") : tt("gua.westGroup")}，${tt("gua.roomHint")} ${compassBtnHtml}</p>
      <div class="gua-layout">
        ${renderCompassSvg(gua, LANG)}
        <div class="star-table">${starRows}</div>
      </div>
    </div>

    <div class="card">
      <h2>${tt("shensha.title")}</h2>
      <p class="hint">${tt("shensha.hint")}</p>
      <div class="relations">${shenShaHtml}</div>
    </div>

    <div class="card">
      <h2>${tt("taisui.title")}</h2>
      <p class="hint">${tt("taisui.hint")}</p>
      <div class="relations">${taiSuiHtml}</div>
    </div>

    <div class="card">
      <h2>${tt("interpret.title")}</h2>
      <p class="hint">${tt("interpret.disclaimer")}</p>
      ${interpretHtml}
    </div>

    ${
      curveHtml
        ? `<div class="card">
            <h2>${tt("curve.title")}</h2>
            <p class="hint">${tt("curve.hint")}</p>
            ${curveHtml}
            <p class="hint">${tt("curve.disclaimer")}</p>
          </div>`
        : ""
    }

    ${
      daYunHtml
        ? `<div class="card">
            <h2>${tt("dayun.title")}</h2>
            <p class="hint">${tt("dayun.hint")}</p>
            ${daYunHtml}
          </div>`
        : ""
    }

    ${hourScanHtml}

    <div class="card">
      <h2>${tt("house.title")}</h2>
      <div class="field">
        <label>${tt("house.facing")}</label>
        <div class="dir-picker" id="house-facing-picker">
          ${DIRECTIONS.map((d) => `<button type="button" class="dir-btn" data-dir="${d}">${d}</button>`).join("")}
        </div>
      </div>
      <div id="house-gua-result"></div>
    </div>
  `;

  document.querySelector<HTMLButtonElement>("#copy-btn")!.addEventListener("click", async (ev) => {
    const btn = ev.currentTarget as HTMLButtonElement;
    try {
      await navigator.clipboard.writeText(buildSummaryText(bazi, gua, meta));
      btn.textContent = tt("result.copied");
    } catch {
      btn.textContent = tt("result.copyFail");
    }
    setTimeout(() => (btn.textContent = tt("result.copy")), 2000);
  });

  document.querySelector<HTMLButtonElement>("#save-image-btn")!.addEventListener("click", async (ev) => {
    const btn = ev.currentTarget as HTMLButtonElement;
    const originalText = btn.textContent;
    btn.textContent = tt("result.savingImage");
    btn.disabled = true;
    try {
      const { renderShareCardCanvas, downloadCanvas } = await import("./views/shareImage");
      const canvas = await renderShareCardCanvas(
        bazi,
        gua,
        { name: meta.name, cityLabel: meta.cityLabel, civilLabel: fmtCivil(meta.civil) },
        LANG,
      );
      downloadCanvas(canvas, `mingli-fengshui-${meta.civil.year}${pad(meta.civil.month)}${pad(meta.civil.day)}.png`);
    } finally {
      btn.textContent = originalText;
      btn.disabled = false;
    }
  });

  document.querySelector<HTMLButtonElement>("#share-link-btn")!.addEventListener("click", async (ev) => {
    const btn = ev.currentTarget as HTMLButtonElement;
    const hash = encodeShareHash({
      name: document.querySelector<HTMLInputElement>("#name")!.value.trim(),
      gender: meta.gender,
      date: document.querySelector<HTMLInputElement>("#date")!.value,
      time: hourUnknownInput.checked ? "" : timeInput.value,
      hourUnknown: hourUnknownInput.checked,
      city: cityInput.value,
      longitude: Number(longitudeInput.value),
      utcOffset: Number(utcOffsetInput.value),
      useTrueSolar: document.querySelector<HTMLInputElement>("#use-true-solar")!.checked,
      useEot: document.querySelector<HTMLInputElement>("#use-eot")!.checked,
    });
    const url = `${location.origin}${location.pathname}#${hash}`;
    try {
      await navigator.clipboard.writeText(url);
      btn.textContent = tt("result.shareLinkCopied");
    } catch {
      btn.textContent = tt("result.copyFail");
    }
    setTimeout(() => (btn.textContent = tt("result.shareLink")), 2000);
  });

  document.querySelector<HTMLButtonElement>("#compass-btn")?.addEventListener("click", async () => {
    const { openCompassOverlay } = await import("./views/compassLive");
    openCompassOverlay(gua, LANG);
  });

  const liuNianPanel = document.querySelector<HTMLDivElement>("#liunian-panel");
  document.querySelectorAll<HTMLButtonElement>(".dayun-item").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".dayun-item").forEach((b) => b.classList.remove("dayun-selected"));
      const alreadyOpen = btn.classList.contains("dayun-selected");
      if (alreadyOpen || !liuNianPanel) {
        if (liuNianPanel) liuNianPanel.innerHTML = "";
        return;
      }
      btn.classList.add("dayun-selected");
      const startYear = Number(btn.dataset.start);
      const startAge = Number(btn.dataset.startAge);
      const years = Array.from({ length: 10 }, (_, i) => startYear + i);
      liuNianPanel.innerHTML = `
        <div class="liunian-grid">
          ${years
            .map((y) => {
              const gz = yearGanZhi(y);
              const el = ganElement(gz[0]);
              const tag = bazi.strength.favorable.includes(el)
                ? "liunian-good"
                : bazi.strength.unfavorable.includes(el)
                  ? "liunian-bad"
                  : "";
              const isNow = y === nowYearForDaYun ? " liunian-now" : "";
              return `
              <div class="liunian-cell ${tag}${isNow}">
                <span class="liunian-year">${y}</span>
                <span class="liunian-ganzhi">${gz}</span>
                <span class="liunian-age">${startAge + (y - startYear)}${tt("common.age")}</span>
              </div>`;
            })
            .join("")}
        </div>`;
      liuNianPanel.scrollIntoView({ behavior: "smooth", block: "nearest" });
    });
  });

  const houseResultEl = document.querySelector<HTMLDivElement>("#house-gua-result")!;
  document.querySelectorAll<HTMLButtonElement>("#house-facing-picker .dir-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll("#house-facing-picker .dir-btn").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      const facing = btn.dataset.dir as Direction;
      const houseResult = computeHouseGua(facing);
      const match = matchHouseToPerson(gua, houseResult.gua);
      const houseStarRows = houseResult.gua.stars
        .map(
          (s) => `
          <div class="star-row ${s.auspicious ? "star-row-good" : "star-row-bad"}">
            <span class="star-name">${LANG === "en" ? STAR_EN[s.name] ?? s.name : s.name}</span>
            <span class="star-dir">${LANG === "en" ? DIR_EN[s.direction] ?? s.direction : s.direction}</span>
            <span class="star-meaning">${roomSuggestionFor(s.name, LANG)}</span>
          </div>`,
        )
        .join("");
      houseResultEl.innerHTML = `
        <p class="hint">${tt("house.sitting")}：${houseResult.sitting} → ${houseResult.gua.name}（${houseResult.gua.group}）</p>
        <p class="advice-summary ${match.sameGroup ? "match-good" : "match-bad"}">${match.summary}</p>
        <div class="gua-layout">
          ${renderCompassSvg(houseResult.gua, LANG)}
          <div class="star-table">
            <p class="hint">${tt("house.roomTable")}</p>
            ${houseStarRows}
          </div>
        </div>
      `;
    });
  });
}
