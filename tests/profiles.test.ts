import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  loadProfiles,
  saveProfile,
  deleteProfile,
  renameProfile,
  clearProfiles,
  exportProfilesJson,
  importProfilesJson,
  migrateFromHistory,
  getProfile,
} from "../src/lib/profiles";

const base = {
  label: "测试",
  name: "张三",
  gender: "male" as const,
  date: "1990-06-15",
  time: "08:30",
  hourUnknown: false,
  city: "北京",
  longitude: 116.4074,
  utcOffset: 8,
  useTrueSolar: true,
  useEot: true,
};

beforeEach(() => {
  localStorage.clear();
});

describe("profiles CRUD", () => {
  it("save 新建并可读回", () => {
    const p = saveProfile(base);
    expect(p.id).toBeTruthy();
    const list = loadProfiles();
    expect(list).toHaveLength(1);
    expect(list[0].name).toBe("张三");
    expect(getProfile(p.id)?.city).toBe("北京");
  });

  it("save 带 id 更新而非新建", () => {
    const p = saveProfile(base);
    const updated = saveProfile({ ...base, id: p.id, city: "上海" });
    expect(updated.id).toBe(p.id);
    expect(loadProfiles()).toHaveLength(1);
    expect(getProfile(p.id)?.city).toBe("上海");
  });

  it("delete 移除档案", () => {
    const p = saveProfile(base);
    deleteProfile(p.id);
    expect(loadProfiles()).toHaveLength(0);
  });

  it("rename 更新标签与 updatedAt", () => {
    const p = saveProfile(base);
    renameProfile(p.id, "新名字");
    expect(getProfile(p.id)?.label).toBe("新名字");
  });

  it("clearProfiles 清空", () => {
    saveProfile(base);
    clearProfiles();
    expect(loadProfiles()).toHaveLength(0);
  });

  it("按 updatedAt 降序排列", () => {
    vi.useFakeTimers();
    const a = saveProfile({ ...base, name: "A" });
    vi.advanceTimersByTime(10);
    const b = saveProfile({ ...base, name: "B" });
    vi.advanceTimersByTime(10);
    renameProfile(a.id, "A2");
    const list = loadProfiles();
    expect(list[0].id).toBe(a.id);
    expect(list[1].id).toBe(b.id);
    vi.useRealTimers();
  });
});

describe("导出导入", () => {
  it("导出后导入到空档案库能还原", () => {
    saveProfile({ ...base, name: "甲" });
    saveProfile({ ...base, name: "乙", date: "1995-03-08" });
    const json = exportProfilesJson();
    clearProfiles();
    expect(loadProfiles()).toHaveLength(0);
    const result = importProfilesJson(json);
    expect(result.added).toBe(2);
    expect(loadProfiles()).toHaveLength(2);
  });

  it("重复内容按签名去重", () => {
    saveProfile({ ...base, name: "甲" });
    const json = exportProfilesJson();
    const result = importProfilesJson(json);
    expect(result.added).toBe(0);
    expect(result.skipped).toBe(1);
    expect(loadProfiles()).toHaveLength(1);
  });

  it("格式非法时抛出错误", () => {
    expect(() => importProfilesJson("{}")).toThrow();
    expect(() => importProfilesJson("not json")).toThrow();
  });

  it("兼容旧版纯数组格式", () => {
    const arr = JSON.stringify([{ ...base, name: "旧格式", id: "x", createdAt: 1, updatedAt: 1 }]);
    const result = importProfilesJson(arr);
    expect(result.added).toBe(1);
  });
});

describe("migrateFromHistory", () => {
  it("从旧版 history 记录迁移一次", () => {
    localStorage.setItem(
      "mingli-fengshui:history",
      JSON.stringify([
        {
          name: "老用户",
          gender: "female",
          date: "1988-08-08",
          time: "12:30",
          city: "上海",
          longitude: 121.47,
          utcOffset: 8,
          useTrueSolar: true,
          useEot: true,
          savedAt: 12345,
        },
      ]),
    );
    migrateFromHistory();
    const list = loadProfiles();
    expect(list).toHaveLength(1);
    expect(list[0].name).toBe("老用户");
    expect(list[0].gender).toBe("female");
  });

  it("已有档案时不重复迁移", () => {
    saveProfile(base);
    localStorage.setItem(
      "mingli-fengshui:history",
      JSON.stringify([{ name: "不应出现", date: "1988-08-08", time: "12:30" }]),
    );
    migrateFromHistory();
    expect(loadProfiles()).toHaveLength(1);
    expect(loadProfiles()[0].name).toBe("张三");
  });

  it("无旧记录时安全跳过", () => {
    migrateFromHistory();
    expect(loadProfiles()).toHaveLength(0);
  });
});
