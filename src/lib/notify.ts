/** 本地每日提醒：完全客户端的 Web Notification——在用户选定的时间点，
 * 若应用（含已安装的 PWA）处于打开状态，弹出当日运势提醒。
 * 不经任何服务器、无推送服务，与本应用「一切本地」的架构一致；
 * 浏览器不支持或权限被拒时优雅降级（隐藏/提示）。 */

const PREF_KEY = "mingli-fengshui:notify";

export interface NotifyPref {
  enabled: boolean;
  /** HH:MM（24 小时制） */
  time: string;
  /** 上次成功弹出提醒的日期（yyyy-mm-dd），防止同日重复 */
  lastFired: string;
}

const DEFAULT_PREF: NotifyPref = { enabled: false, time: "08:00", lastFired: "" };

export function loadNotifyPref(): NotifyPref {
  try {
    const raw = localStorage.getItem(PREF_KEY);
    if (!raw) return { ...DEFAULT_PREF };
    return { ...DEFAULT_PREF, ...(JSON.parse(raw) as Partial<NotifyPref>) };
  } catch {
    return { ...DEFAULT_PREF };
  }
}

export function saveNotifyPref(pref: NotifyPref): void {
  localStorage.setItem(PREF_KEY, JSON.stringify(pref));
}

export function notifySupported(): boolean {
  return typeof Notification !== "undefined";
}

function dateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/** 纯函数：当前时刻是否应该弹出提醒（已启用、已过设定时间、今日未弹过）。 */
export function shouldFireNow(pref: NotifyPref, now: Date): boolean {
  if (!pref.enabled) return false;
  const [h, m] = pref.time.split(":").map(Number);
  if (!Number.isFinite(h) || !Number.isFinite(m)) return false;
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  if (nowMinutes < h * 60 + m) return false;
  return pref.lastFired !== dateKey(now);
}

/** 启动分钟级轮询；到点且权限允许时弹出通知并记录已弹。
 * buildBody 延迟到弹出时才调用，避免每分钟做无谓的排盘计算。 */
export function startNotifyLoop(buildBody: () => string | null): void {
  if (!notifySupported()) return;
  const tick = () => {
    const pref = loadNotifyPref();
    if (!shouldFireNow(pref, new Date())) return;
    if (Notification.permission !== "granted") return;
    const body = buildBody();
    if (!body) return;
    try {
      new Notification("命理风水 · 今日运势", { body, tag: "mingli-daily" });
      saveNotifyPref({ ...pref, lastFired: dateKey(new Date()) });
    } catch {
      // 某些平台（如部分移动端）构造 Notification 会抛错——静默放弃
    }
  };
  tick();
  setInterval(tick, 60_000);
}

/** 请求通知权限；返回是否已获授权。 */
export async function requestNotifyPermission(): Promise<boolean> {
  if (!notifySupported()) return false;
  if (Notification.permission === "granted") return true;
  if (Notification.permission === "denied") return false;
  return (await Notification.requestPermission()) === "granted";
}
