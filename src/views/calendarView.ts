import { loadProfiles, type Profile } from "../lib/profiles";
import { computeFromProfile } from "../lib/profileCompute";
import { computeMonthCalendar, computeDateRangeCalendar, filterGoodDaysForEvent, rankBestDays, type DayScore, type EventType } from "../lib/calendar";
import { t } from "../lib/i18n/dict";
import type { Lang } from "../lib/i18n/state";

const EVENT_TYPES: EventType[] = ["签约", "搬家", "开业", "嫁娶"];
const EVENT_KEY: Record<EventType, string> = {
  签约: "calendar.eventSign",
  搬家: "calendar.eventMove",
  开业: "calendar.eventOpen",
  嫁娶: "calendar.eventWedding",
};

function scoreClass(score: number): string {
  if (score >= 2) return "cal-great";
  if (score > 0) return "cal-good";
  if (score === 0) return "cal-neutral";
  if (score >= -2) return "cal-bad";
  return "cal-terrible";
}

export function renderCalendarView(container: HTMLElement, lang: Lang): void {
  const profiles = loadProfiles();
  const now = new Date();
  let state = { year: now.getFullYear(), month: now.getMonth() + 1, profileId: profiles[0]?.id ?? "", event: "" as EventType | "" };

  const todayIso = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

  container.innerHTML = `
    <div class="card">
      <h2>${t(lang, "calendar.title")}</h2>
      ${
        profiles.length === 0
          ? `<p class="hint">${t(lang, "calendar.needProfile")}</p>`
          : `
        <div class="top-nav" style="justify-content:flex-start;margin:0 0 1rem;">
          <button type="button" class="nav-btn active" data-tab="month">${t(lang, "calendar.tabMonth")}</button>
          <button type="button" class="nav-btn" data-tab="bestday">${t(lang, "calendar.tabBestDay")}</button>
        </div>
        <select id="cal-profile"></select>

        <div id="cal-tab-month">
          <div class="cal-controls">
            <div class="cal-month-nav">
              <button type="button" id="cal-prev" class="btn-secondary btn-small">${t(lang, "calendar.prev")}</button>
              <span id="cal-month-label" class="cal-month-label"></span>
              <button type="button" id="cal-next" class="btn-secondary btn-small">${t(lang, "calendar.next")}</button>
            </div>
            <select id="cal-event">
              <option value="">${t(lang, "calendar.eventAll")}</option>
              ${EVENT_TYPES.map((e) => `<option value="${e}">${t(lang, EVENT_KEY[e])}</option>`).join("")}
            </select>
          </div>
          <div id="cal-grid" class="cal-grid"></div>
          <div id="cal-day-detail" class="cal-day-detail"></div>
        </div>

        <div id="cal-tab-bestday" hidden>
          <div class="field-row">
            <div class="field">
              <label>${t(lang, "calendar.rangeStart")}</label>
              <input type="date" id="range-start" value="${todayIso}" />
            </div>
            <div class="field">
              <label>${t(lang, "calendar.rangeDays")}</label>
              <input type="number" id="range-days" value="60" min="7" max="365" />
            </div>
          </div>
          <div class="field">
            <label>${t(lang, "calendar.eventFilter")}</label>
            <select id="range-event">
              <option value="">${t(lang, "calendar.eventAll")}</option>
              ${EVENT_TYPES.map((e) => `<option value="${e}">${t(lang, EVENT_KEY[e])}</option>`).join("")}
            </select>
          </div>
          <button type="button" id="range-search" class="btn-primary">${t(lang, "calendar.rangeSearch")}</button>
          <div id="range-result"></div>
        </div>
      `
      }
    </div>
  `;

  if (profiles.length === 0) return;

  const profileSel = container.querySelector<HTMLSelectElement>("#cal-profile")!;
  profileSel.innerHTML = profiles
    .map((p) => `<option value="${p.id}">${p.label || t(lang, "profiles.empty")}</option>`)
    .join("");
  profileSel.value = state.profileId;

  container.querySelectorAll<HTMLButtonElement>(".nav-btn[data-tab]").forEach((btn) => {
    btn.addEventListener("click", () => {
      container.querySelectorAll(".nav-btn[data-tab]").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      const tab = btn.dataset.tab;
      container.querySelector<HTMLElement>("#cal-tab-month")!.hidden = tab !== "month";
      container.querySelector<HTMLElement>("#cal-tab-bestday")!.hidden = tab !== "bestday";
    });
  });

  const monthLabel = container.querySelector<HTMLSpanElement>("#cal-month-label")!;
  const grid = container.querySelector<HTMLDivElement>("#cal-grid")!;
  const detail = container.querySelector<HTMLDivElement>("#cal-day-detail")!;
  const eventSel = container.querySelector<HTMLSelectElement>("#cal-event")!;

  function currentProfile(): Profile | undefined {
    return profiles.find((p) => p.id === state.profileId);
  }

  function draw() {
    const profile = currentProfile();
    if (!profile) return;
    monthLabel.textContent = `${state.year}-${String(state.month).padStart(2, "0")}`;

    const { bazi } = computeFromProfile(profile);
    const ownDayZhi = bazi.pillars[2].zhi;
    let days = computeMonthCalendar(state.year, state.month, ownDayZhi, bazi.strength.favorable, bazi.strength.unfavorable);
    if (state.event) days = filterGoodDaysForEvent(days, state.event);

    if (days.length === 0) {
      grid.innerHTML = `<p class="hint">--</p>`;
      detail.innerHTML = "";
      return;
    }

    const allDays = computeMonthCalendar(state.year, state.month, ownDayZhi, bazi.strength.favorable, bazi.strength.unfavorable);
    const highlighted = new Set(days.map((d) => d.date));

    grid.innerHTML = allDays
      .map((d) => {
        const dim = state.event && !highlighted.has(d.date) ? " cal-dim" : "";
        return `
        <button type="button" class="cal-cell ${scoreClass(d.score)}${dim}" data-date="${d.date}">
          <span class="cal-day-num">${d.day}</span>
          <span class="cal-ganzhi">${d.ganZhi}</span>
          ${d.isChongDayZhu ? `<span class="cal-chong-badge">${t(lang, "calendar.chongDayZhu")}</span>` : ""}
        </button>`;
      })
      .join("");

    grid.querySelectorAll<HTMLButtonElement>(".cal-cell").forEach((btn) => {
      btn.addEventListener("click", () => {
        const d = allDays.find((x) => x.date === btn.dataset.date);
        if (d) showDetail(d);
      });
    });
  }

  function showDetail(d: DayScore) {
    detail.innerHTML = `
      <h4>${d.date} · ${d.ganZhi} · ${d.lunarLabel}</h4>
      <p><strong>${t(lang, "calendar.yi")}：</strong>${d.yi.join("、") || "--"}</p>
      <p><strong>${t(lang, "calendar.ji")}：</strong>${d.ji.join("、") || "--"}</p>
    `;
  }

  container.querySelector("#cal-prev")!.addEventListener("click", () => {
    state.month--;
    if (state.month < 1) {
      state.month = 12;
      state.year--;
    }
    draw();
  });
  container.querySelector("#cal-next")!.addEventListener("click", () => {
    state.month++;
    if (state.month > 12) {
      state.month = 1;
      state.year++;
    }
    draw();
  });
  profileSel.addEventListener("change", () => {
    state.profileId = profileSel.value;
    draw();
  });
  eventSel.addEventListener("change", () => {
    state.event = eventSel.value as EventType | "";
    draw();
  });

  // ---- best-day finder ----
  const rangeStartInput = container.querySelector<HTMLInputElement>("#range-start")!;
  const rangeDaysInput = container.querySelector<HTMLInputElement>("#range-days")!;
  const rangeEventSel = container.querySelector<HTMLSelectElement>("#range-event")!;
  const rangeResult = container.querySelector<HTMLDivElement>("#range-result")!;

  container.querySelector("#range-search")!.addEventListener("click", () => {
    const profile = currentProfile();
    if (!profile) return;
    const [sy, sm, sd] = rangeStartInput.value.split("-").map(Number);
    if (!sy || !sm || !sd) return;
    const numDays = Math.max(1, Math.min(365, Number(rangeDaysInput.value) || 60));
    const event = (rangeEventSel.value || null) as EventType | null;

    const { bazi } = computeFromProfile(profile);
    const ownDayZhi = bazi.pillars[2].zhi;
    const days = computeDateRangeCalendar(new Date(sy, sm - 1, sd), numDays, ownDayZhi, bazi.strength.favorable, bazi.strength.unfavorable);
    const ranked = rankBestDays(days, event, 8, lang);

    if (ranked.length === 0) {
      rangeResult.innerHTML = `<p class="hint">${t(lang, "calendar.rangeNoResults")}</p>`;
      return;
    }

    rangeResult.innerHTML = `
      <p class="hint">${t(lang, "calendar.rangeResultsTitle")}</p>
      <div class="range-results">
        ${ranked
          .map(
            ({ day, reason }) => `
          <div class="range-result-card">
            <div class="range-result-head">
              <span class="range-result-date">${day.date}</span>
              <span class="range-result-ganzhi">${day.ganZhi}</span>
              <span class="range-result-score">+${day.score}</span>
            </div>
            <p class="range-result-reason">${reason}</p>
            <button type="button" class="btn-secondary btn-small range-result-view" data-date="${day.date}">${t(lang, "calendar.viewInMonth")}</button>
          </div>`,
          )
          .join("")}
      </div>
    `;

    rangeResult.querySelectorAll<HTMLButtonElement>(".range-result-view").forEach((btn) => {
      btn.addEventListener("click", () => {
        const [y, m] = btn.dataset.date!.split("-").map(Number);
        state.year = y;
        state.month = m;
        container.querySelector<HTMLButtonElement>('.nav-btn[data-tab="month"]')!.click();
        draw();
        const target = ranked.find((r) => r.day.date === btn.dataset.date);
        if (target) showDetail(target.day);
      });
    });
  });

  draw();
}
