/** 二十四节气养生手册：各节气的时令说明与传统养生要点（一般性民俗建议，
 * 非医疗意见），并复用 lunar-javascript 的节气表判断给定日期所处节气。 */

import { Solar } from "lunar-javascript";

export interface SolarTermInfo {
  name: string;
  season: "春" | "夏" | "秋" | "冬";
  approx: string; // 大致公历日期
  description: string;
  wellness: string;
}

export const SOLAR_TERMS: SolarTermInfo[] = [
  { name: "立春", season: "春", approx: "2月3-5日", description: "四时之始，阳气初生，万物开始复苏。", wellness: "宜早睡早起、舒展形体，饮食少酸多甘，如韭菜、萝卜等辛甘发散之品助阳气生发。" },
  { name: "雨水", season: "春", approx: "2月18-20日", description: "冰雪消融，降水渐多，草木萌动。", wellness: "天气乍暖还寒，注意「春捂」护住腰腹下肢；饮食宜平补，山药、薏米粥健脾祛湿。" },
  { name: "惊蛰", season: "春", approx: "3月5-7日", description: "春雷乍动，蛰虫惊醒，生机勃发。", wellness: "宜适度运动唤醒身体，梨子润肺防春燥；情绪易波动，注意疏肝理气、保持心平气和。" },
  { name: "春分", season: "春", approx: "3月20-22日", description: "昼夜平分，寒暑适中，燕归花开。", wellness: "起居饮食讲求阴阳平衡，忌大寒大热；多到户外踏青，借天地生发之气调畅情志。" },
  { name: "清明", season: "春", approx: "4月4-6日", description: "天清景明，草木繁茂，祭祖踏青之时。", wellness: "湿气渐重，宜食荠菜、香椿等时令野蔬；踏青出游助气血流通，忌久坐伤脾。" },
  { name: "谷雨", season: "春", approx: "4月19-21日", description: "雨生百谷，春季最后一个节气。", wellness: "防潮祛湿为要，可饮谷雨茶清肝明目；过敏体质注意防花粉，晨练不宜过早。" },
  { name: "立夏", season: "夏", approx: "5月5-7日", description: "夏季之始，万物繁茂，气温渐升。", wellness: "养心为重，宜午间小憩养心气；饮食清淡，苦瓜、莲子清心火，忌过食生冷。" },
  { name: "小满", season: "夏", approx: "5月20-22日", description: "麦粒渐满，未至全熟，雨水增多。", wellness: "湿热渐盛，宜食赤小豆、冬瓜利湿；情绪戒躁，「小满不满」提醒凡事留有余地。" },
  { name: "芒种", season: "夏", approx: "6月5-7日", description: "有芒之谷可种，仲夏农忙时节。", wellness: "暑湿并重易困倦，晚睡早起午补眠；饮食宜清补，乌梅汤生津，忌贪凉冲凉。" },
  { name: "夏至", season: "夏", approx: "6月21-22日", description: "白昼最长，阳气至极，一阴始生。", wellness: "宜静养护阳，避烈日剧汗；面条、绿豆汤是传统时令之选，空调温度不宜过低。" },
  { name: "小暑", season: "夏", approx: "7月6-8日", description: "暑热渐盛，尚未至极，雷雨频繁。", wellness: "防暑降温为要，多饮温开水少食冰饮；莲藕、鳝鱼为时令佳品，静心即是纳凉。" },
  { name: "大暑", season: "夏", approx: "7月22-24日", description: "一年中最热时节，湿热交蒸。", wellness: "谨防中暑，户外活动避开正午；冬病夏治正当时，姜茶温中，切忌整日闭门吹冷气。" },
  { name: "立秋", season: "秋", approx: "8月7-9日", description: "秋季之始，暑去凉来，禾谷渐熟。", wellness: "「贴秋膘」宜适度，先清后补；早卧早起收敛神气，防「秋老虎」余热伤津。" },
  { name: "处暑", season: "秋", approx: "8月22-24日", description: "暑气至此而止，天气渐凉。", wellness: "昼夜温差拉大，注意添衣防凉；鸭肉、百合滋阴润燥，宜早睡以缓秋乏。" },
  { name: "白露", season: "秋", approx: "9月7-9日", description: "露凝而白，秋意渐浓，鸿雁南飞。", wellness: "「白露身不露」，早晚务必添衣；银耳、蜂蜜、梨润肺防燥，晨练不宜空腹过久。" },
  { name: "秋分", season: "秋", approx: "9月22-24日", description: "昼夜再度平分，此后夜长昼短。", wellness: "收敛安神为要，宜登高望远解秋郁；蟹肥菊黄食有时，寒凉之物需有节制。" },
  { name: "寒露", season: "秋", approx: "10月8-9日", description: "露气寒冷，将欲凝结，深秋来临。", wellness: "「寒露脚不露」，足部保暖尤为重要；芝麻、核桃养阴润燥，宜温水泡脚助眠。" },
  { name: "霜降", season: "秋", approx: "10月23-24日", description: "初霜出现，秋季最后一个节气。", wellness: "民谚「补冬不如补霜降」，柿子、栗子、萝卜正当时；护膝保暖，防秋郁伤怀。" },
  { name: "立冬", season: "冬", approx: "11月7-8日", description: "冬季之始，万物收藏，水始成冰。", wellness: "进补养藏正当时，温补脾肾如羊肉、桂圆；早卧晚起，必待日光，避寒就温。" },
  { name: "小雪", season: "冬", approx: "11月22-23日", description: "气温下降，开始降雪，未至大雪。", wellness: "天冷情绪易低落，多晒太阳畅情志；黑色食物入肾，黑豆、黑芝麻皆宜。" },
  { name: "大雪", season: "冬", approx: "12月6-8日", description: "雪盛之时，天寒地冻，瑞雪兆丰年。", wellness: "防寒保暖头颈足，进补可稍加大；围炉暖饮宜适量，室内注意通风防燥。" },
  { name: "冬至", season: "冬", approx: "12月21-23日", description: "白昼最短，阴极阳生，数九寒天始。", wellness: "「冬至大如年」，饺子汤圆应节令；阳气初生宜静养，早睡晚起藏精蓄锐。" },
  { name: "小寒", season: "冬", approx: "1月5-7日", description: "天气渐寒，尚未大冷，雁北乡时。", wellness: "一年中最冷时段将至，防寒护阳为要；腊八粥温养脾胃，运动宜日出后进行。" },
  { name: "大寒", season: "冬", approx: "1月20-21日", description: "一年中最后一个节气，寒极将春。", wellness: "冬藏转春生的过渡，进补渐减、渐添升散之品；扫尘迎新，身心同做辞旧准备。" },
];

const TERM_NAMES = new Set(SOLAR_TERMS.map((t) => t.name));

/** 判断给定日期处于哪个节气区间（即最近一个已开始的节气）。
 * 汇总目标年与次年的节气表（lunar-javascript 的表存在冬至年份偏移的
 * 已知怪癖，见 qimen.ts——合并相邻两年的表按时间排序后取「最近已开始」
 * 一条，可完全绕开该怪癖）。 */
export function currentSolarTerm(date: Date): SolarTermInfo {
  const targetMs = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
  const entries: { name: string; ms: number }[] = [];
  for (const probeYear of [date.getFullYear(), date.getFullYear() + 1]) {
    const table = Solar.fromYmdHms(probeYear, 6, 1, 12, 0, 0).getLunar().getJieQiTable();
    for (const [name, solar] of Object.entries(table)) {
      if (!TERM_NAMES.has(name)) continue;
      entries.push({ name, ms: Date.UTC(solar.getYear(), solar.getMonth() - 1, solar.getDay()) });
    }
  }
  entries.sort((a, b) => a.ms - b.ms);
  let current = entries[0];
  for (const e of entries) {
    if (e.ms <= targetMs) current = e;
    else break;
  }
  const info = SOLAR_TERMS.find((t) => t.name === current.name);
  if (!info) throw new Error(`未知节气：${current.name}`);
  return info;
}
