/** 周公解梦词典：传统民俗解梦说法的白话摘要，纯娱乐参考，
 * 不构成医学或心理学意见。词条来自广为流传的民间解梦典籍主题归纳，
 * 而非逐字引用古籍原文。 */

export type DreamCategory = "人物" | "动物" | "自然" | "生活" | "建筑器物" | "身体" | "灵异" | "数字颜色";

export interface DreamEntry {
  keywords: string[];
  category: DreamCategory;
  meaning: string;
}

export const DREAMS: DreamEntry[] = [
  // 人物
  { keywords: ["父亲", "爸爸"], category: "人物", meaning: "梦见父亲，主家中平安，或提示近期该多与长辈沟通。" },
  { keywords: ["母亲", "妈妈"], category: "人物", meaning: "梦见母亲，多为思念之情的投射，也主家庭和睦。" },
  { keywords: ["已故亲人", "去世的人", "逝去的亲人"], category: "人物", meaning: "梦见已故亲人，传统说法多为思念寄托，未必是不祥之兆。" },
  { keywords: ["陌生人"], category: "人物", meaning: "梦见陌生人，主近期人际圈将有新接触。" },
  { keywords: ["情人", "恋人"], category: "人物", meaning: "梦见情人，主感情运走高，宜主动表达心意。" },
  { keywords: ["前任"], category: "人物", meaning: "梦见前任，多为对过往情感未了心结的反映，未必代表复合。" },
  { keywords: ["婴儿", "小孩", "孩子"], category: "人物", meaning: "梦见婴儿，主新的开始或家中添丁之喜的心理期待。" },
  { keywords: ["孕妇", "怀孕"], category: "人物", meaning: "梦见怀孕，主事业或计划将有新进展、新孕育。" },
  { keywords: ["老人"], category: "人物", meaning: "梦见老人，主智慧提点，近期宜多听取他人经验。" },
  { keywords: ["医生"], category: "人物", meaning: "梦见医生，提示需关注健康，或有难题待人指点解决。" },
  { keywords: ["老师"], category: "人物", meaning: "梦见老师，主学业/事业将有指点或考验。" },
  { keywords: ["领导", "上司", "老板"], category: "人物", meaning: "梦见领导，主工作压力或对认可的期待，宜表现积极。" },
  { keywords: ["明星", "偶像"], category: "人物", meaning: "梦见明星，主渴望被关注或对理想生活的向往。" },
  { keywords: ["和尚", "僧人"], category: "人物", meaning: "梦见和尚，主心境将趋于平静，宜看淡烦恼。" },
  { keywords: ["新娘", "新郎", "结婚"], category: "人物", meaning: "梦见结婚，主人生将有重要转折或喜事将至。" },
  { keywords: ["吵架", "争吵"], category: "人物", meaning: "梦见与人争吵，反主关系将趋于和睦，忧虑将消。" },
  { keywords: ["打架"], category: "人物", meaning: "梦见打架，提示近期人际或内心有压抑情绪待疏导。" },

  // 动物
  { keywords: ["蛇"], category: "动物", meaning: "梦见蛇，传统说法多主财运，蛇入怀主意外之财，惧蛇则宜留意小人。" },
  { keywords: ["龙"], category: "动物", meaning: "梦见龙，主大吉大利、地位提升，是传统解梦中最吉利的意象之一。" },
  { keywords: ["老虎", "虎"], category: "动物", meaning: "梦见老虎，主权威与魄力，亦提示近期需防强势对手。" },
  { keywords: ["狗"], category: "动物", meaning: "梦见狗，主忠诚朋友相助，狗对你友善主人缘佳。" },
  { keywords: ["猫"], category: "动物", meaning: "梦见猫，主生活将添情趣，也提示需留意身边小心思。" },
  { keywords: ["鱼"], category: "动物", meaning: "梦见鱼，主年年有余，财运与人际关系皆有好兆头。" },
  { keywords: ["鸟", "小鸟"], category: "动物", meaning: "梦见鸟，主好消息将至，或渴望自由与远行。" },
  { keywords: ["凤凰"], category: "动物", meaning: "梦见凤凰，主尊贵吉祥，女性梦之尤主喜事临门。" },
  { keywords: ["马"], category: "动物", meaning: "梦见马，主事业顺利、马到成功，奔马尤主进取心强。" },
  { keywords: ["牛"], category: "动物", meaning: "梦见牛，主辛勤耕耘终有收获，宜脚踏实地。" },
  { keywords: ["羊"], category: "动物", meaning: "梦见羊，主家庭和顺、财源稳定。" },
  { keywords: ["猪"], category: "动物", meaning: "梦见猪，主财运亨通、衣食无忧。" },
  { keywords: ["兔子", "兔"], category: "动物", meaning: "梦见兔子，主平安喜乐，亦提示行事宜谨慎细心。" },
  { keywords: ["老鼠", "耗子"], category: "动物", meaning: "梦见老鼠，提示需留意身边琐碎的破财之事。" },
  { keywords: ["狼"], category: "动物", meaning: "梦见狼，提示需防身边潜在的竞争或威胁。" },
  { keywords: ["蜘蛛"], category: "动物", meaning: "梦见蜘蛛结网，主辛勤经营终将有成。" },
  { keywords: ["蝴蝶"], category: "动物", meaning: "梦见蝴蝶，主美好姻缘或心境将趋于愉悦轻盈。" },
  { keywords: ["乌龟"], category: "动物", meaning: "梦见乌龟，主长寿健康、根基稳固。" },
  { keywords: ["蚊子"], category: "动物", meaning: "梦见蚊子叮咬，提示身边有琐碎烦恼需及时处理。" },
  { keywords: ["蟑螂"], category: "动物", meaning: "梦见蟑螂，提示环境或人际中有需清理的隐患。" },
  { keywords: ["狮子"], category: "动物", meaning: "梦见狮子，主威望与领导力，亦需防与强者正面冲突。" },
  { keywords: ["大象"], category: "动物", meaning: "梦见大象，主稳重厚实，事业根基将更加牢固。" },
  { keywords: ["熊"], category: "动物", meaning: "梦见熊，提示需以柔克刚，避免与人正面硬碰。" },
  { keywords: ["鹰"], category: "动物", meaning: "梦见老鹰，主志向高远、能一展抱负。" },
  { keywords: ["鸡"], category: "动物", meaning: "梦见鸡鸣，主好消息将至、新的开始。" },
  { keywords: ["蜜蜂"], category: "动物", meaning: "梦见蜜蜂，主辛勤劳作终将迎来甜蜜回报。" },
  { keywords: ["青蛙"], category: "动物", meaning: "梦见青蛙，主子嗣兴旺或财运将有转机。" },
  { keywords: ["孔雀"], category: "动物", meaning: "梦见孔雀开屏，主好运与美好姻缘将至。" },

  // 自然
  { keywords: ["下雨", "雨"], category: "自然", meaning: "梦见下雨，主烦恼将被洗涤一空，心情转晴。" },
  { keywords: ["洪水", "发大水"], category: "自然", meaning: "梦见洪水，提示情绪或压力积累已久，宜适时纾解。" },
  { keywords: ["火", "着火", "大火"], category: "自然", meaning: "梦见火，主运势将旺，亦提示需留意脾气冲动。" },
  { keywords: ["地震"], category: "自然", meaning: "梦见地震，提示生活或计划将有较大变动，宜提前准备。" },
  { keywords: ["太阳"], category: "自然", meaning: "梦见太阳，主前程光明、心境积极向上。" },
  { keywords: ["月亮"], category: "自然", meaning: "梦见月亮，主思念之情浓厚，亦主感情将趋圆满。" },
  { keywords: ["星星"], category: "自然", meaning: "梦见满天星斗，主希望与好运正在靠近。" },
  { keywords: ["彩虹"], category: "自然", meaning: "梦见彩虹，主苦尽甘来、好事将近。" },
  { keywords: ["雪", "下雪"], category: "自然", meaning: "梦见下雪，主心境将趋纯净，亦提示宜注意保暖健康。" },
  { keywords: ["打雷", "雷电"], category: "自然", meaning: "梦见打雷，提示将有突发消息或转折，宜有心理准备。" },
  { keywords: ["大海", "海洋"], category: "自然", meaning: "梦见大海，主胸怀开阔、格局将有提升。" },
  { keywords: ["高山", "爬山"], category: "自然", meaning: "梦见爬山，主目标虽有难度，坚持终能登顶。" },
  { keywords: ["森林", "树林"], category: "自然", meaning: "梦见森林，主生机勃勃，亦提示前路选择较多需理清思路。" },
  { keywords: ["花", "鲜花"], category: "自然", meaning: "梦见鲜花盛开，主好事将至、姻缘或事业皆有好兆头。" },
  { keywords: ["果树", "水果"], category: "自然", meaning: "梦见果实累累，主辛勤付出将有收获。" },
  { keywords: ["风", "大风"], category: "自然", meaning: "梦见大风，提示局势将有变化，宜灵活应对。" },
  { keywords: ["沙漠"], category: "自然", meaning: "梦见沙漠，提示当下处境较为艰难，宜坚持寻找出路。" },
  { keywords: ["云"], category: "自然", meaning: "梦见白云，主心境闲适；乌云密布则提示烦恼将至但会散去。" },

  // 生活场景
  { keywords: ["考试"], category: "生活", meaning: "梦见考试，反映近期对自我表现的压力与期待，宜放松心态。" },
  { keywords: ["迟到"], category: "生活", meaning: "梦见迟到，提示内心对错失机会的焦虑，宜提前规划。" },
  { keywords: ["飞", "飞翔"], category: "生活", meaning: "梦见飞翔，主心境自由、渴望摆脱束缚，多为好兆头。" },
  { keywords: ["坠落", "掉下去", "摔倒"], category: "生活", meaning: "梦见坠落，反映安全感不足，提示近期宜稳扎稳打。" },
  { keywords: ["追赶", "被追"], category: "生活", meaning: "梦见被追赶，提示现实中有压力或问题在逃避，宜正面处理。" },
  { keywords: ["迷路"], category: "生活", meaning: "梦见迷路，提示对当下方向感到迷茫，宜停下来重新规划。" },
  { keywords: ["搬家"], category: "生活", meaning: "梦见搬家，主生活将有新变化，多为好的开始。" },
  { keywords: ["旅行", "出行"], category: "生活", meaning: "梦见旅行，主运势将有新机遇，宜把握出行/合作良机。" },
  { keywords: ["丢东西", "丢失物品"], category: "生活", meaning: "梦见丢失物品，提示近期需留意财物或人际关系的疏漏。" },
  { keywords: ["找东西", "寻找"], category: "生活", meaning: "梦见寻找东西，反映内心对某种缺失的渴望，宜厘清真正所求。" },
  { keywords: ["中奖", "彩票"], category: "生活", meaning: "梦见中奖，多为对好运的美好期待，未必对应现实中奖。" },
  { keywords: ["吃饭", "聚餐"], category: "生活", meaning: "梦见聚餐，主人际和睦、家庭美满。" },
  { keywords: ["生病"], category: "生活", meaning: "梦见生病，提示需多关注自身健康与休息。" },
  { keywords: ["开车", "驾驶"], category: "生活", meaning: "梦见开车，主对人生方向的掌控感，车况顺畅则运势平稳。" },
  { keywords: ["排队"], category: "生活", meaning: "梦见排队，提示当下需要耐心等待时机成熟。" },
  { keywords: ["打电话"], category: "生活", meaning: "梦见打电话，主渴望与某人沟通或有未尽之言。" },
  { keywords: ["工作", "上班"], category: "生活", meaning: "梦见工作，反映对事业现状的关注或压力。" },
  { keywords: ["裸体", "没穿衣服"], category: "生活", meaning: "梦见自己裸体，反映对某事感到脆弱或害怕被评判。" },
  { keywords: ["游泳"], category: "生活", meaning: "梦见游泳，主顺利渡过难关，水流平缓则运势平顺。" },
  { keywords: ["逃跑"], category: "生活", meaning: "梦见逃跑，提示对某种压力选择回避，宜正视问题根源。" },

  // 建筑与器物
  { keywords: ["房子", "房屋"], category: "建筑器物", meaning: "梦见房子，主家庭运势，新房主运势上升，旧房破损则提示需关注家宅平安。" },
  { keywords: ["桥"], category: "建筑器物", meaning: "梦见过桥，主将顺利渡过当下难关、迎来转机。" },
  { keywords: ["楼梯"], category: "建筑器物", meaning: "梦见上楼梯，主运势步步高升；下楼梯则提示需谨慎决策。" },
  { keywords: ["门"], category: "建筑器物", meaning: "梦见开门，主新机遇将至；门关闭则提示当下路径受阻，需另寻他法。" },
  { keywords: ["镜子"], category: "建筑器物", meaning: "梦见镜子，主自我反思，亦提示需留意他人眼中的自己。" },
  { keywords: ["钱", "金钱"], category: "建筑器物", meaning: "梦见捡钱，多为心理对财运的期待；丢钱则提示需留意破财。" },
  { keywords: ["黄金", "金子"], category: "建筑器物", meaning: "梦见黄金，主财运与地位皆有提升的好兆头。" },
  { keywords: ["戒指"], category: "建筑器物", meaning: "梦见戒指，主感情将有归属或承诺将至。" },
  { keywords: ["钥匙"], category: "建筑器物", meaning: "梦见钥匙，主问题即将找到解决办法。" },
  { keywords: ["书", "书本"], category: "建筑器物", meaning: "梦见读书，主学业进步或渴望充实自己。" },
  { keywords: ["手机"], category: "建筑器物", meaning: "梦见手机（尤其损坏或没信号），反映对沟通/联系的焦虑。" },
  { keywords: ["刀"], category: "建筑器物", meaning: "梦见刀，提示需以果断态度处理当下棘手之事。" },
  { keywords: ["棺材"], category: "建筑器物", meaning: "梦见棺材，民俗中素有「见棺发财」之说，多主财运将有转机。" },
  { keywords: ["坟墓"], category: "建筑器物", meaning: "梦见坟墓，提示旧事将了结，是了断而非不祥。" },
  { keywords: ["车祸"], category: "建筑器物", meaning: "梦见车祸，反映对失控局面的担忧，宜谨慎行事、避免冒进。" },
  { keywords: ["婚纱"], category: "建筑器物", meaning: "梦见婚纱，主对美好姻缘的期待渐近实现。" },
  { keywords: ["行李箱", "打包"], category: "建筑器物", meaning: "梦见收拾行李，主人生阶段将有转换，新篇章即将开启。" },

  // 身体
  { keywords: ["掉牙", "牙齿掉了"], category: "身体", meaning: "梦见掉牙，传统说法多与家人健康或长辈相关，宜多关心家人。" },
  { keywords: ["头发", "掉头发"], category: "身体", meaning: "梦见掉头发，提示近期压力较大，宜注意休息与情绪调节。" },
  { keywords: ["怀孕", "生孩子"], category: "身体", meaning: "梦见生孩子，主新计划、新项目即将迎来成果。" },
  { keywords: ["流血", "出血"], category: "身体", meaning: "梦见流血，多主破财或消耗，也可能反映对健康的担忧。" },
  { keywords: ["受伤"], category: "身体", meaning: "梦见受伤，提示近期需多加小心，避免冲动行事。" },
  { keywords: ["死亡", "自己死了"], category: "身体", meaning: "梦见自己死亡，传统解梦中反主旧阶段结束、新生开始，未必不祥。" },

  // 灵异
  { keywords: ["鬼"], category: "灵异", meaning: "梦见鬼，多反映内心的恐惧或未解的心结，宜正视而非回避。" },
  { keywords: ["神仙", "菩萨", "佛"], category: "灵异", meaning: "梦见神佛，主心灵将获得指引与庇佑，宜心怀善念。" },
  { keywords: ["祖先", "祖宗"], category: "灵异", meaning: "梦见祖先，主家族庇佑，宜多念根本、慎终追远。" },
  { keywords: ["飞升", "成仙"], category: "灵异", meaning: "梦见飞升成仙，主心境超脱、渴望摆脱世俗烦恼。" },

  // 数字与颜色
  { keywords: ["红色"], category: "数字颜色", meaning: "梦见红色，主喜庆吉祥，亦提示情绪较为热烈需适度收敛。" },
  { keywords: ["白色"], category: "数字颜色", meaning: "梦见白色，主心境纯净，亦传统上与丧事相关，需结合具体情境看待。" },
  { keywords: ["黑色"], category: "数字颜色", meaning: "梦见黑色，提示近期情绪较为低落，宜多寻求光明面。" },
  { keywords: ["金色"], category: "数字颜色", meaning: "梦见金色，主财运与地位皆有提升的好兆头。" },
  { keywords: ["数字8", "八"], category: "数字颜色", meaning: "梦见数字八，传统谐音「发」，主财运亨通。" },
  { keywords: ["数字4", "四"], category: "数字颜色", meaning: "梦见数字四，提示需留意身边琐事，稳扎稳打为宜。" },
];

/** 关键字模糊匹配：命中任一 keyword 子串即视为匹配，按关键字命中数与
 * 匹配长度排序，优先展示最贴近的结果。 */
export function searchDreams(query: string): DreamEntry[] {
  const q = query.trim();
  if (!q) return [];
  const scored = DREAMS.map((entry) => {
    let score = 0;
    for (const kw of entry.keywords) {
      if (kw === q) score += 100;
      else if (kw.includes(q) || q.includes(kw)) score += 10;
    }
    return { entry, score };
  }).filter((s) => s.score > 0);

  scored.sort((a, b) => b.score - a.score);
  return scored.map((s) => s.entry);
}

export function dreamsByCategory(category: DreamCategory): DreamEntry[] {
  return DREAMS.filter((d) => d.category === category);
}

export const DREAM_CATEGORIES: DreamCategory[] = ["人物", "动物", "自然", "生活", "建筑器物", "身体", "灵异", "数字颜色"];
