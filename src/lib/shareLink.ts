/** 分享链接：把排盘所需的出生信息编码进 URL hash，接收端本地重算，
 * 不经过任何服务器。 */

export interface ShareState {
  name: string;
  gender: "male" | "female";
  date: string;
  time: string;
  hourUnknown: boolean;
  city: string;
  longitude: number;
  utcOffset: number;
  useTrueSolar: boolean;
  useEot: boolean;
}

const VERSION = "1";

export function encodeShareHash(s: ShareState): string {
  const params = new URLSearchParams();
  params.set("v", VERSION);
  if (s.name) params.set("n", s.name);
  params.set("g", s.gender === "male" ? "m" : "f");
  params.set("d", s.date);
  if (!s.hourUnknown) params.set("t", s.time);
  params.set("h", s.hourUnknown ? "1" : "0");
  params.set("c", s.city);
  params.set("lo", String(s.longitude));
  params.set("u", String(s.utcOffset));
  params.set("ts", s.useTrueSolar ? "1" : "0");
  params.set("eot", s.useEot ? "1" : "0");
  return params.toString();
}

/** 解析失败或缺少必要字段时返回 null，调用方应静默忽略而非报错。 */
export function decodeShareHash(hash: string): ShareState | null {
  try {
    const raw = hash.startsWith("#") ? hash.slice(1) : hash;
    if (!raw) return null;
    const params = new URLSearchParams(raw);
    if (params.get("v") !== VERSION) return null;

    const date = params.get("d");
    const city = params.get("c");
    const longitude = Number(params.get("lo"));
    const utcOffset = Number(params.get("u"));
    if (!date || !city || Number.isNaN(longitude) || Number.isNaN(utcOffset)) return null;

    const hourUnknown = params.get("h") === "1";
    return {
      name: params.get("n") ?? "",
      gender: params.get("g") === "f" ? "female" : "male",
      date,
      time: hourUnknown ? "" : params.get("t") ?? "12:00",
      hourUnknown,
      city,
      longitude,
      utcOffset,
      useTrueSolar: params.get("ts") !== "0",
      useEot: params.get("eot") !== "0",
    };
  } catch {
    return null;
  }
}
