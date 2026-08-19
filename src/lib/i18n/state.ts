export type Lang = "zh" | "en";

const KEY = "mingli-fengshui:lang";

export function getLang(): Lang {
  try {
    const saved = localStorage.getItem(KEY);
    if (saved === "zh" || saved === "en") return saved;
  } catch {
    // ignore
  }
  if (typeof navigator !== "undefined" && navigator.language?.toLowerCase().startsWith("zh")) return "zh";
  if (typeof navigator !== "undefined" && navigator.language) return "en";
  return "zh";
}

export function setLang(lang: Lang): void {
  try {
    localStorage.setItem(KEY, lang);
  } catch {
    // ignore
  }
}
