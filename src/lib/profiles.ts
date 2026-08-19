/** 命盘档案：可命名、可管理的多人排盘记录，存于浏览器 localStorage，
 * 支持 JSON 导出/导入备份，并从旧版 history 记录一次性迁移。 */

export interface Profile {
  id: string;
  label: string;
  name: string;
  gender: "male" | "female";
  date: string; // yyyy-mm-dd
  time: string; // HH:MM
  hourUnknown: boolean;
  city: string;
  longitude: number;
  utcOffset: number;
  useTrueSolar: boolean;
  useEot: boolean;
  createdAt: number;
  updatedAt: number;
}

const KEY = "mingli-fengshui:profiles";
const OLD_HISTORY_KEY = "mingli-fengshui:history";
const MAX = 50;

function genId(): string {
  return `p_${Math.random().toString(36).slice(2, 10)}_${Math.random().toString(36).slice(2, 6)}`;
}

function readRaw(): Profile[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const list = JSON.parse(raw);
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

function writeRaw(list: Profile[]): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(list.slice(0, MAX)));
  } catch {
    // 存储失败（如隐私模式）时静默忽略
  }
}

/** 从旧版 history.ts 的记录迁移为档案（仅在档案为空且存在旧记录时运行一次）。 */
export function migrateFromHistory(): void {
  if (readRaw().length > 0) return;
  try {
    const raw = localStorage.getItem(OLD_HISTORY_KEY);
    if (!raw) return;
    const old = JSON.parse(raw);
    if (!Array.isArray(old) || old.length === 0) return;
    const now = Date.now();
    const migrated: Profile[] = old.map((e: Record<string, unknown>, i: number) => ({
      id: genId(),
      label: (e.name as string) || `未命名记录 ${i + 1}`,
      name: (e.name as string) || "",
      gender: (e.gender as "male" | "female") || "male",
      date: (e.date as string) || "",
      time: (e.time as string) || "12:00",
      hourUnknown: false,
      city: (e.city as string) || "",
      longitude: Number(e.longitude) || 0,
      utcOffset: Number(e.utcOffset) || 8,
      useTrueSolar: e.useTrueSolar !== false,
      useEot: e.useEot !== false,
      createdAt: Number(e.savedAt) || now,
      updatedAt: Number(e.savedAt) || now,
    }));
    writeRaw(migrated);
  } catch {
    // ignore malformed old data
  }
}

export function loadProfiles(): Profile[] {
  return readRaw().sort((a, b) => b.updatedAt - a.updatedAt);
}

export function getProfile(id: string): Profile | undefined {
  return readRaw().find((p) => p.id === id);
}

/** 新建或更新档案（按 id 存在与否判断）。 */
export function saveProfile(input: Omit<Profile, "id" | "createdAt" | "updatedAt"> & { id?: string }): Profile {
  const list = readRaw();
  const now = Date.now();
  if (input.id) {
    const idx = list.findIndex((p) => p.id === input.id);
    if (idx >= 0) {
      const updated: Profile = { ...list[idx], ...input, id: list[idx].id, updatedAt: now };
      list[idx] = updated;
      writeRaw(list);
      return updated;
    }
  }
  const created: Profile = { ...input, id: genId(), createdAt: now, updatedAt: now };
  list.unshift(created);
  writeRaw(list);
  return created;
}

export function deleteProfile(id: string): void {
  writeRaw(readRaw().filter((p) => p.id !== id));
}

export function renameProfile(id: string, label: string): void {
  const list = readRaw();
  const idx = list.findIndex((p) => p.id === id);
  if (idx >= 0) {
    list[idx] = { ...list[idx], label, updatedAt: Date.now() };
    writeRaw(list);
  }
}

export function clearProfiles(): void {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // ignore
  }
}

export function exportProfilesJson(): string {
  return JSON.stringify({ version: 1, exportedAt: Date.now(), profiles: readRaw() }, null, 2);
}

export interface ImportResult {
  added: number;
  skipped: number;
}

/** 导入 JSON 备份，按内容签名（姓名+性别+日期+时间+城市）去重合并。 */
export function importProfilesJson(json: string): ImportResult {
  const parsed = JSON.parse(json);
  const incoming: Profile[] = Array.isArray(parsed) ? parsed : parsed?.profiles;
  if (!Array.isArray(incoming)) throw new Error("文件格式不正确");

  const existing = readRaw();
  const sig = (p: Profile) => `${p.name}|${p.gender}|${p.date}|${p.time}|${p.city}`;
  const existingSigs = new Set(existing.map(sig));

  let added = 0;
  let skipped = 0;
  for (const raw of incoming) {
    if (!raw || typeof raw !== "object" || !raw.date || !raw.time) {
      skipped++;
      continue;
    }
    const candidate: Profile = {
      id: genId(),
      label: raw.label || raw.name || "导入档案",
      name: raw.name || "",
      gender: raw.gender === "female" ? "female" : "male",
      date: raw.date,
      time: raw.time,
      hourUnknown: !!raw.hourUnknown,
      city: raw.city || "",
      longitude: Number(raw.longitude) || 0,
      utcOffset: Number(raw.utcOffset) || 8,
      useTrueSolar: raw.useTrueSolar !== false,
      useEot: raw.useEot !== false,
      createdAt: Number(raw.createdAt) || Date.now(),
      updatedAt: Number(raw.updatedAt) || Date.now(),
    };
    if (existingSigs.has(sig(candidate))) {
      skipped++;
      continue;
    }
    existing.unshift(candidate);
    existingSigs.add(sig(candidate));
    added++;
  }
  writeRaw(existing);
  return { added, skipped };
}
