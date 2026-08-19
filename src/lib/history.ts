/** 排盘历史记录，存于浏览器 localStorage，最多保留 10 条。 */

export interface HistoryEntry {
  name: string;
  gender: "male" | "female";
  date: string; // yyyy-mm-dd
  time: string; // HH:MM
  city: string;
  longitude: number;
  utcOffset: number;
  useTrueSolar: boolean;
  useEot: boolean;
  savedAt: number;
}

const KEY = "mingli-fengshui:history";
const MAX = 10;

export function loadHistory(): HistoryEntry[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const list = JSON.parse(raw);
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

export function saveHistory(entry: HistoryEntry): HistoryEntry[] {
  const list = loadHistory().filter(
    (e) =>
      !(
        e.name === entry.name &&
        e.date === entry.date &&
        e.time === entry.time &&
        e.gender === entry.gender &&
        e.city === entry.city
      ),
  );
  list.unshift(entry);
  const trimmed = list.slice(0, MAX);
  try {
    localStorage.setItem(KEY, JSON.stringify(trimmed));
  } catch {
    // 存储失败（如隐私模式）时静默忽略
  }
  return trimmed;
}

export function clearHistory(): void {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // ignore
  }
}
