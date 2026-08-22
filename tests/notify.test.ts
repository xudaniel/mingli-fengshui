import { describe, expect, it, beforeEach } from "vitest";
import { shouldFireNow, loadNotifyPref, saveNotifyPref, type NotifyPref } from "../src/lib/notify";

const at = (h: number, m: number) => new Date(2026, 7, 22, h, m);

describe("shouldFireNow", () => {
  const base: NotifyPref = { enabled: true, time: "08:00", lastFired: "" };

  it("fires only at/after the chosen time", () => {
    expect(shouldFireNow(base, at(7, 59))).toBe(false);
    expect(shouldFireNow(base, at(8, 0))).toBe(true);
    expect(shouldFireNow(base, at(23, 30))).toBe(true);
  });

  it("never fires when disabled", () => {
    expect(shouldFireNow({ ...base, enabled: false }, at(12, 0))).toBe(false);
  });

  it("fires at most once per day", () => {
    expect(shouldFireNow({ ...base, lastFired: "2026-08-22" }, at(12, 0))).toBe(false);
    expect(shouldFireNow({ ...base, lastFired: "2026-08-21" }, at(12, 0))).toBe(true);
  });

  it("rejects malformed time strings instead of throwing", () => {
    expect(shouldFireNow({ ...base, time: "not-a-time" }, at(12, 0))).toBe(false);
  });
});

describe("notify pref storage", () => {
  beforeEach(() => localStorage.clear());

  it("round-trips through localStorage with defaults for missing fields", () => {
    expect(loadNotifyPref()).toEqual({ enabled: false, time: "08:00", lastFired: "" });
    saveNotifyPref({ enabled: true, time: "09:30", lastFired: "2026-08-22" });
    expect(loadNotifyPref()).toEqual({ enabled: true, time: "09:30", lastFired: "2026-08-22" });
  });

  it("survives corrupted storage", () => {
    localStorage.setItem("mingli-fengshui:notify", "{corrupt");
    expect(loadNotifyPref().enabled).toBe(false);
  });
});
