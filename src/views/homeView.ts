import { renderTodayAlmanacCard } from "./almanacView";
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

export function renderHomeView(container: HTMLElement, lang: Lang, onNavigate: (key: string) => void): void {
  container.innerHTML = `
    <div class="home-intro">
      <p class="hint" style="text-align:center;font-size:0.95rem">${t(lang, "home.subtitle")}</p>
    </div>
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

  container.querySelectorAll<HTMLButtonElement>(".home-tool-card").forEach((btn) => {
    btn.addEventListener("click", () => onNavigate(btn.dataset.key!));
  });
}
