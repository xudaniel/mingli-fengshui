import { renderTodayAlmanacCard } from "./almanacView";
import { loadProfiles, type Profile } from "../lib/profiles";
import { computeFromProfile } from "../lib/profileCompute";
import { computeTodayBrief } from "../lib/todayBrief";
import { t } from "../lib/i18n/dict";
import type { Lang } from "../lib/i18n/state";

export interface ToolCard {
  key: string;
  titleKey: string;
  descKey: string;
  icon: string;
}

export const TOOL_SECTIONS: { sectionKey: string; tools: ToolCard[] }[] = [
  {
    sectionKey: "home.section.charts",
    tools: [
      { key: "chart", titleKey: "nav.chart", descKey: "home.card.chart.desc", icon: "☯" },
      { key: "ziwei", titleKey: "nav.ziwei", descKey: "home.card.ziwei.desc", icon: "⭐" },
    ],
  },
  {
    sectionKey: "home.section.fengshui",
    tools: [
      { key: "chart", titleKey: "gua.title", descKey: "home.card.gua.desc", icon: "🧭" },
      { key: "flyingstar", titleKey: "nav.flyingstar", descKey: "home.card.flyingstar.desc", icon: "🏠" },
    ],
  },
  {
    sectionKey: "home.section.quick",
    tools: [
      { key: "naming", titleKey: "nav.naming", descKey: "home.card.naming.desc", icon: "✒️" },
      { key: "dreams", titleKey: "nav.dreams", descKey: "home.card.dreams.desc", icon: "💭" },
      { key: "iching", titleKey: "nav.iching", descKey: "home.card.iching.desc", icon: "☰" },
      { key: "qimen", titleKey: "nav.qimen", descKey: "home.card.qimen.desc", icon: "🔮" },
    ],
  },
  {
    sectionKey: "home.section.tools",
    tools: [
      { key: "compat", titleKey: "nav.compat", descKey: "home.card.compat.desc", icon: "💑" },
      { key: "calendar", titleKey: "nav.calendar", descKey: "home.card.calendar.desc", icon: "📅" },
      { key: "report", titleKey: "report.title", descKey: "home.card.report.desc", icon: "📜" },
    ],
  },
];

const VERDICT_CLASS: Record<string, string> = {
  favorable: "today-brief-good",
  neutral: "today-brief-neutral",
  unfavorable: "today-brief-bad",
};

/** 已有存档时，在通用黄历卡片旁再加一张「今天对这份命盘而言如何」的个性化
 * 卡片——把择吉评分、犯太岁检测、奇门局数几处已验证过的计算组合起来，
 * 不新增排盘逻辑。默认取最近使用的档案（loadProfiles 已按 updatedAt 排序）。 */
function renderTodayBriefInto(target: HTMLElement, profiles: Profile[], lang: Lang): void {
  if (profiles.length === 0) return;

  function draw(profile: Profile) {
    const { bazi } = computeFromProfile(profile);
    const brief = computeTodayBrief(bazi, lang);
    target.innerHTML = `
      <div class="card">
        <h2>${t(lang, "home.todayBrief.title")}${profiles.length > 1 ? "" : ` · ${profile.label || "--"}`}</h2>
        ${
          profiles.length > 1
            ? `<div class="field"><label>${t(lang, "home.todayBrief.pickProfile")}</label><select id="today-brief-profile"></select></div>`
            : ""
        }
        <p class="today-brief-verdict ${VERDICT_CLASS[brief.verdict]}">${brief.verdictText}</p>
        <div class="today-brief-meta">
          <span>${t(lang, "home.todayBrief.dayPillar")}：${brief.dayScore.ganZhi}（${brief.dayScore.score >= 0 ? "+" : ""}${brief.dayScore.score}）</span>
          <span>${t(lang, "home.todayBrief.qimen")}：${brief.qimenLabel}</span>
        </div>
      </div>
    `;
    if (profiles.length > 1) {
      const sel = target.querySelector<HTMLSelectElement>("#today-brief-profile")!;
      sel.innerHTML = profiles.map((p) => `<option value="${p.id}">${p.label || "--"}</option>`).join("");
      sel.value = profile.id;
      sel.addEventListener("change", () => {
        const next = profiles.find((p) => p.id === sel.value);
        if (next) draw(next);
      });
    }
  }

  draw(profiles[0]);
}

export function renderHomeView(container: HTMLElement, lang: Lang, onNavigate: (key: string) => void): void {
  container.innerHTML = `
    <div class="home-intro">
      <p class="hint" style="text-align:center;font-size:0.95rem">${t(lang, "home.subtitle")}</p>
    </div>
    <div id="home-today-brief"></div>
    <div id="home-almanac"></div>
    ${TOOL_SECTIONS.map(
      (section) => `
      <div class="home-section">
        <h3 class="home-section-title">${t(lang, section.sectionKey)}</h3>
        <div class="home-grid">
          ${section.tools
            .map(
              (tool) => `
            <button type="button" class="home-tool-card" data-key="${tool.key}">
              <span class="home-tool-icon">${tool.icon}</span>
              <span class="home-tool-title">${t(lang, tool.titleKey)}</span>
              <span class="home-tool-desc">${t(lang, tool.descKey)}</span>
            </button>`,
            )
            .join("")}
        </div>
      </div>`,
    ).join("")}
  `;

  container.querySelector<HTMLDivElement>("#home-almanac")!.innerHTML = renderTodayAlmanacCard(lang);
  renderTodayBriefInto(container.querySelector<HTMLDivElement>("#home-today-brief")!, loadProfiles(), lang);

  container.querySelectorAll<HTMLButtonElement>(".home-tool-card").forEach((btn) => {
    btn.addEventListener("click", () => onNavigate(btn.dataset.key!));
  });
}
