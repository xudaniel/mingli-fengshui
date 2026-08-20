export type Lang = "zh" | "en";

const KEY = "mingli-fengshui:lang";

/** 默认中文界面；仅当用户曾主动切换过语言时才读取保存的偏好。 */
export function getLang(): Lang {
  try {
    const saved = localStorage.getItem(KEY);
    if (saved === "zh" || saved === "en") return saved;
  } catch {
    // ignore
  }
  return "zh";
}

export function setLang(lang: Lang): void {
  try {
    localStorage.setItem(KEY, lang);
  } catch {
    // ignore
  }
}
