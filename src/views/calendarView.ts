import { loadProfiles, type Profile } from "../lib/profiles";
import { computeFromProfile } from "../lib/profileCompute";
import { computeMonthCalendar, filterGoodDaysForEvent, type DayScore, type EventType } from "../lib/calendar";
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

  container.innerHTML = `
    <div class="card">
      <h2>${t(lang, "calendar.title")}</h2>
      ${
        profiles.length === 0
          ? `<p class="hint">${t(lang, "calendar.needProfile")}</p>`
          : `
        <div class="cal-controls">
          <select id="cal-profile"></select>
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

  draw();
}
