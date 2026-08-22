import { loadProfiles } from "../lib/profiles";
import { computeFromProfile } from "../lib/profileCompute";
import { lookupSurnameStrokes, lookupCharStrokes } from "../lib/strokeData";
import { buildWuGeReport, type WuGeReport } from "../lib/wuge";
import { suggestNames } from "../lib/namingSuggest";
import type { Element } from "../lib/analysis";
import { t } from "../lib/i18n/dict";
import type { Lang } from "../lib/i18n/state";

const ELEMENTS: Element[] = ["木", "火", "土", "金", "水"];

function renderReportHtml(report: WuGeReport, lang: Lang): string {
  const row = (label: string, n: number, s: WuGeReport["tianGeShuLi"]) => `
    <div class="wuge-row">
      <span class="wuge-label">${label}</span>
      <span class="wuge-num">${n}</span>
      <span class="wuge-luck wuge-luck-${s.luck}">${s.luck}</span>
      <span class="wuge-meaning">${s.meaning}</span>
    </div>`;
  return `
    <div class="wuge-table">
      ${row("天格", report.tianGe, report.tianGeShuLi)}
      ${row("人格", report.renGe, report.renGeShuLi)}
      ${row("地格", report.diGe, report.diGeShuLi)}
      ${row("外格", report.waiGe, report.waiGeShuLi)}
      ${row("总格", report.zongGe, report.zongGeShuLi)}
    </div>
    <p class="advice-summary">${t(lang, "naming.overallScore")}：${Math.round(report.goodRatio * 100)}%</p>
  `;
}

export function renderNamingView(container: HTMLElement, lang: Lang): void {
  container.innerHTML = `
    <div class="card">
      <h2>${t(lang, "naming.title")}</h2>
      <div class="top-nav" style="justify-content:flex-start;margin:0 0 1rem;">
        <button type="button" class="nav-btn active" data-tab="analyze">${t(lang, "naming.analyzeTab")}</button>
        <button type="button" class="nav-btn" data-tab="suggest">${t(lang, "naming.suggestTab")}</button>
      </div>

      <div id="naming-analyze-tab">
        <div class="field-row">
          <div class="field">
            <label>${t(lang, "naming.surname")}</label>
            <input type="text" id="naming-surname" maxlength="4" placeholder="王 / 欧阳" />
          </div>
          <div class="field">
            <label>${t(lang, "naming.given")}</label>
            <input type="text" id="naming-given" maxlength="4" placeholder="思远" />
          </div>
        </div>
        <button type="button" id="naming-analyze-btn" class="btn-primary">${t(lang, "naming.analyze")}</button>
        <div id="naming-analyze-result"></div>
      </div>

      <div id="naming-suggest-tab" hidden>
        <p class="hint">${t(lang, "naming.suggestHint")}</p>
        <div class="field">
          <label>${t(lang, "naming.pickProfile")}</label>
          <select id="naming-profile"><option value="">--</option></select>
        </div>
        <div class="field">
          <label>${t(lang, "naming.elementPref")}</label>
          <div class="dir-picker" id="naming-element-picker" style="grid-template-columns:repeat(5,1fr)">
            ${ELEMENTS.map((e) => `<button type="button" class="dir-btn" data-el="${e}">${e}</button>`).join("")}
          </div>
        </div>
        <div class="field">
          <label>${t(lang, "naming.surname")}</label>
          <input type="text" id="naming-suggest-surname" maxlength="4" placeholder="王" />
        </div>
        <button type="button" id="naming-suggest-btn" class="btn-primary">${t(lang, "naming.suggest")}</button>
        <div id="naming-suggest-result"></div>
      </div>
    </div>
  `;

  // tab switching
  container.querySelectorAll<HTMLButtonElement>(".nav-btn[data-tab]").forEach((btn) => {
    btn.addEventListener("click", () => {
      container.querySelectorAll(".nav-btn[data-tab]").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      const tab = btn.dataset.tab;
      container.querySelector<HTMLElement>("#naming-analyze-tab")!.hidden = tab !== "analyze";
      container.querySelector<HTMLElement>("#naming-suggest-tab")!.hidden = tab !== "suggest";
    });
  });

  // analyze
  const analyzeResult = container.querySelector<HTMLDivElement>("#naming-analyze-result")!;

  function runAnalysis(surnameChars: string[], givenChars: string[], manual: Record<string, number>): void {
    const strokesOf = (c: string) => manual[c] ?? lookupCharStrokes(c);
    const surnameStrokes = surnameChars.map(strokesOf);
    const givenStrokes = givenChars.map(strokesOf);
    const report = buildWuGeReport(surnameStrokes as number[], givenStrokes as number[]);
    const fullName = surnameChars.join("") + givenChars.join("");
    analyzeResult.innerHTML =
      renderReportHtml(report, lang) +
      `<button type="button" id="naming-save-image" class="btn-secondary" style="margin-top:0.9rem">${t(lang, "result.saveImage")}</button>`;
    analyzeResult.querySelector("#naming-save-image")!.addEventListener("click", async () => {
      const { renderNamingShareCanvas } = await import("./shareNamingImage");
      const { downloadCanvas } = await import("./shareCanvas");
      const canvas = await renderNamingShareCanvas(fullName, report, lang);
      downloadCanvas(canvas, `naming-${fullName}.png`);
    });
  }

  function renderManualForm(surnameChars: string[], givenChars: string[], unknown: string[]): void {
    const manual: Record<string, number> = {};
    analyzeResult.innerHTML = `
      <p class="hint">${t(lang, "naming.unknownChar")} ${unknown.join("、")}</p>
      <div class="field-row" style="flex-wrap:wrap;display:flex;gap:0.75rem">
        ${unknown
          .map(
            (c) => `
          <div class="field" style="margin-bottom:0">
            <label>${c}</label>
            <input type="number" min="1" max="60" class="naming-manual-stroke" data-char="${c}" style="width:5.5rem" />
          </div>`,
          )
          .join("")}
      </div>
      <button type="button" id="naming-manual-compute" class="btn-primary" style="margin-top:0.9rem">${t(lang, "naming.compute")}</button>
    `;
    const computeBtn = analyzeResult.querySelector<HTMLButtonElement>("#naming-manual-compute")!;
    computeBtn.addEventListener("click", () => {
      const inputs = analyzeResult.querySelectorAll<HTMLInputElement>(".naming-manual-stroke");
      let ok = true;
      inputs.forEach((input) => {
        const n = Number(input.value);
        if (!input.value || !Number.isFinite(n) || n <= 0) ok = false;
        manual[input.dataset.char!] = n;
      });
      if (!ok) return;
      runAnalysis(surnameChars, givenChars, manual);
    });
  }

  container.querySelector("#naming-analyze-btn")!.addEventListener("click", () => {
    const surname = container.querySelector<HTMLInputElement>("#naming-surname")!.value.trim();
    const given = container.querySelector<HTMLInputElement>("#naming-given")!.value.trim();
    if (!surname || !given) return;

    const surnameChars = lookupSurnameStrokes(surname) ? [surname] : [...surname];
    const givenChars = [...given];
    const unknown = [...surnameChars, ...givenChars].filter((c) => lookupCharStrokes(c) === undefined);

    if (unknown.length > 0) {
      renderManualForm(surnameChars, givenChars, unknown);
      return;
    }
    runAnalysis(surnameChars, givenChars, {});
  });

  // suggest
  const profiles = loadProfiles();
  const profileSel = container.querySelector<HTMLSelectElement>("#naming-profile")!;
  profileSel.innerHTML += profiles.map((p) => `<option value="${p.id}">${p.label || "--"}</option>`).join("");

  let selectedElements = new Set<Element>();
  container.querySelectorAll<HTMLButtonElement>("#naming-element-picker .dir-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      btn.classList.toggle("active");
      const el = btn.dataset.el as Element;
      if (selectedElements.has(el)) selectedElements.delete(el);
      else selectedElements.add(el);
    });
  });

  profileSel.addEventListener("change", () => {
    const p = profiles.find((x) => x.id === profileSel.value);
    if (!p) return;
    const { bazi } = computeFromProfile(p);
    selectedElements = new Set(bazi.strength.favorable);
    container.querySelectorAll<HTMLButtonElement>("#naming-element-picker .dir-btn").forEach((btn) => {
      btn.classList.toggle("active", selectedElements.has(btn.dataset.el as Element));
    });
  });

  const suggestResult = container.querySelector<HTMLDivElement>("#naming-suggest-result")!;
  container.querySelector("#naming-suggest-btn")!.addEventListener("click", () => {
    const surname = container.querySelector<HTMLInputElement>("#naming-suggest-surname")!.value.trim();
    const surnameStrokes = surname ? lookupSurnameStrokes(surname) : [7];
    if (!surnameStrokes) {
      suggestResult.innerHTML = `<p class="hint">${t(lang, "naming.unknownChar")} ${surname}</p>`;
      return;
    }
    const candidates = suggestNames(surnameStrokes, [...selectedElements], 8);
    suggestResult.innerHTML = `
      <p class="hint">${t(lang, "naming.candidateFor")}${surname ? `「${surname}」` : ""}</p>
      <div class="advice-grid">
        ${candidates
          .map(
            (c) => `
          <div class="advice-card">
            <h4>${surname}${c.chars}</h4>
            <p>${c.elements.join("、")}</p>
            ${renderReportHtml(c.report, lang)}
          </div>`,
          )
          .join("")}
      </div>
    `;
  });
}
