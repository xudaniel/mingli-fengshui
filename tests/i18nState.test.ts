import { beforeEach, describe, expect, it } from "vitest";
import { getLang, setLang } from "../src/lib/i18n/state";

beforeEach(() => {
  localStorage.clear();
});

describe("getLang", () => {
  it("默认返回中文，忽略浏览器语言", () => {
    expect(getLang()).toBe("zh");
  });

  it("用户主动切换后持久化偏好", () => {
    setLang("en");
    expect(getLang()).toBe("en");
    setLang("zh");
    expect(getLang()).toBe("zh");
  });

  it("localStorage 中的非法值时安全回退中文", () => {
    localStorage.setItem("mingli-fengshui:lang", "fr");
    expect(getLang()).toBe("zh");
  });
});
