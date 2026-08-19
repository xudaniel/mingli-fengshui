export interface CityEntry {
  name: string;
  region: string;
  longitude: number;
  latitude: number;
  /** Standard UTC offset in hours historically used for BaZi purposes (DST ignored). */
  utcOffset: number;
}

/** A curated quick-pick list covering China's provincial capitals / major
 * cities plus a few common overseas destinations. Anything else can be found
 * via the live place search, or entered manually. */
export const CITIES: CityEntry[] = [
  { name: "北京", region: "华北", longitude: 116.4074, latitude: 39.9042, utcOffset: 8 },
  { name: "天津", region: "华北", longitude: 117.2010, latitude: 39.0842, utcOffset: 8 },
  { name: "石家庄", region: "河北", longitude: 114.5149, latitude: 38.0428, utcOffset: 8 },
  { name: "太原", region: "山西", longitude: 112.5489, latitude: 37.8706, utcOffset: 8 },
  { name: "呼和浩特", region: "内蒙古", longitude: 111.6708, latitude: 40.8183, utcOffset: 8 },
  { name: "沈阳", region: "辽宁", longitude: 123.4315, latitude: 41.8057, utcOffset: 8 },
  { name: "大连", region: "辽宁", longitude: 121.6147, latitude: 38.9140, utcOffset: 8 },
  { name: "长春", region: "吉林", longitude: 125.3245, latitude: 43.8868, utcOffset: 8 },
  { name: "哈尔滨", region: "黑龙江", longitude: 126.5349, latitude: 45.8038, utcOffset: 8 },
  { name: "上海", region: "华东", longitude: 121.4737, latitude: 31.2304, utcOffset: 8 },
  { name: "南京", region: "江苏", longitude: 118.7969, latitude: 32.0603, utcOffset: 8 },
  { name: "苏州", region: "江苏", longitude: 120.5853, latitude: 31.2989, utcOffset: 8 },
  { name: "杭州", region: "浙江", longitude: 120.1551, latitude: 30.2741, utcOffset: 8 },
  { name: "宁波", region: "浙江", longitude: 121.5440, latitude: 29.8683, utcOffset: 8 },
  { name: "合肥", region: "安徽", longitude: 117.2830, latitude: 31.8612, utcOffset: 8 },
  { name: "福州", region: "福建", longitude: 119.2965, latitude: 26.0745, utcOffset: 8 },
  { name: "厦门", region: "福建", longitude: 118.0894, latitude: 24.4798, utcOffset: 8 },
  { name: "南昌", region: "江西", longitude: 115.8582, latitude: 28.6820, utcOffset: 8 },
  { name: "济南", region: "山东", longitude: 117.0009, latitude: 36.6758, utcOffset: 8 },
  { name: "青岛", region: "山东", longitude: 120.3826, latitude: 36.0671, utcOffset: 8 },
  { name: "郑州", region: "河南", longitude: 113.6254, latitude: 34.7466, utcOffset: 8 },
  { name: "武汉", region: "湖北", longitude: 114.3055, latitude: 30.5928, utcOffset: 8 },
  { name: "长沙", region: "湖南", longitude: 112.9388, latitude: 28.2282, utcOffset: 8 },
  { name: "广州", region: "广东", longitude: 113.2644, latitude: 23.1291, utcOffset: 8 },
  { name: "深圳", region: "广东", longitude: 114.0579, latitude: 22.5431, utcOffset: 8 },
  { name: "东莞", region: "广东", longitude: 113.7518, latitude: 23.0207, utcOffset: 8 },
  { name: "珠海", region: "广东", longitude: 113.5767, latitude: 22.2707, utcOffset: 8 },
  { name: "南宁", region: "广西", longitude: 108.3665, latitude: 22.8170, utcOffset: 8 },
  { name: "海口", region: "海南", longitude: 110.3312, latitude: 20.0311, utcOffset: 8 },
  { name: "三亚", region: "海南", longitude: 109.5119, latitude: 18.2528, utcOffset: 8 },
  { name: "重庆", region: "西南", longitude: 106.5516, latitude: 29.5630, utcOffset: 8 },
  { name: "成都", region: "四川", longitude: 104.0668, latitude: 30.5728, utcOffset: 8 },
  { name: "贵阳", region: "贵州", longitude: 106.7135, latitude: 26.5783, utcOffset: 8 },
  { name: "昆明", region: "云南", longitude: 102.8329, latitude: 24.8801, utcOffset: 8 },
  { name: "拉萨", region: "西藏", longitude: 91.1409, latitude: 29.6456, utcOffset: 8 },
  { name: "西安", region: "陕西", longitude: 108.9398, latitude: 34.3416, utcOffset: 8 },
  { name: "兰州", region: "甘肃", longitude: 103.8236, latitude: 36.0581, utcOffset: 8 },
  { name: "西宁", region: "青海", longitude: 101.7787, latitude: 36.6171, utcOffset: 8 },
  { name: "银川", region: "宁夏", longitude: 106.2782, latitude: 38.4664, utcOffset: 8 },
  { name: "乌鲁木齐", region: "新疆", longitude: 87.6168, latitude: 43.8256, utcOffset: 8 },
  { name: "香港", region: "港澳台", longitude: 114.1694, latitude: 22.3193, utcOffset: 8 },
  { name: "澳门", region: "港澳台", longitude: 113.5439, latitude: 22.1987, utcOffset: 8 },
  { name: "台北", region: "港澳台", longitude: 121.5654, latitude: 25.0330, utcOffset: 8 },
  { name: "高雄", region: "港澳台", longitude: 120.3014, latitude: 22.6273, utcOffset: 8 },
  { name: "新加坡", region: "海外", longitude: 103.8198, latitude: 1.3521, utcOffset: 8 },
  { name: "吉隆坡", region: "海外", longitude: 101.6869, latitude: 3.1390, utcOffset: 8 },
  { name: "东京", region: "海外", longitude: 139.6917, latitude: 35.6895, utcOffset: 9 },
  { name: "首尔", region: "海外", longitude: 126.9780, latitude: 37.5665, utcOffset: 9 },
  { name: "曼谷", region: "海外", longitude: 100.5018, latitude: 13.7563, utcOffset: 7 },
  { name: "悉尼", region: "海外", longitude: 151.2093, latitude: -33.8688, utcOffset: 10 },
  { name: "洛杉矶", region: "海外", longitude: -118.2437, latitude: 34.0522, utcOffset: -8 },
  { name: "纽约", region: "海外", longitude: -74.0060, latitude: 40.7128, utcOffset: -5 },
  { name: "温哥华", region: "海外", longitude: -123.1207, latitude: 49.2827, utcOffset: -8 },
  { name: "多伦多", region: "海外", longitude: -79.3832, latitude: 43.6532, utcOffset: -5 },
  { name: "伦敦", region: "海外", longitude: -0.1278, latitude: 51.5074, utcOffset: 0 },
  { name: "巴黎", region: "海外", longitude: 2.3522, latitude: 48.8566, utcOffset: 1 },
];

export interface GeocodeResult {
  displayName: string;
  longitude: number;
  latitude: number;
}

/** Best-effort UTC offset guess from longitude alone (15° per hour), used
 * only as a starting suggestion for places outside the curated list — the
 * user should confirm it, since real timezone boundaries follow borders,
 * not meridians. */
export function guessUtcOffset(longitude: number): number {
  return Math.round(longitude / 15);
}

/** Live place search via OpenStreetMap Nominatim, for locations not in the
 * curated CITIES list. Runs entirely in the browser. */
export async function searchPlace(query: string): Promise<GeocodeResult[]> {
  const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=6&accept-language=zh,en&q=${encodeURIComponent(
    query,
  )}`;
  const res = await fetch(url, {
    headers: { Accept: "application/json" },
  });
  if (!res.ok) throw new Error(`地点搜索失败 (${res.status})`);
  const data = (await res.json()) as Array<{
    display_name: string;
    lon: string;
    lat: string;
  }>;
  return data.map((d) => ({
    displayName: d.display_name,
    longitude: parseFloat(d.lon),
    latitude: parseFloat(d.lat),
  }));
}
