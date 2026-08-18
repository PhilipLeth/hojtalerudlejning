import { describe, expect, it } from "vitest";
import { checkAndCount, hourKey, ipHash, monthKey, parseCount } from "../functions/api/_lib/limits";
import { kvMock } from "./kvMock";

describe("tidsnøgler", () => {
  const tid = new Date("2026-08-18T14:23:45Z");
  it("hourKey er YYYYMMDDHH i UTC", () => {
    expect(hourKey(tid)).toBe("2026081814");
  });
  it("monthKey er YYYYMM", () => {
    expect(monthKey(tid)).toBe("202608");
  });
});

describe("parseCount", () => {
  it("læser tal og falder tilbage til 0", () => {
    expect(parseCount("7")).toBe(7);
    expect(parseCount(null)).toBe(0);
    expect(parseCount("volapyk")).toBe(0);
    expect(parseCount("-3")).toBe(0);
  });
});

describe("checkAndCount", () => {
  it("tillader op til grænsen og afviser derefter", async () => {
    const kv = kvMock();
    expect(await checkAndCount(kv as never, "rl:x", 3, 1)).toBe(true);
    expect(await checkAndCount(kv as never, "rl:x", 3, 1)).toBe(true);
    expect(await checkAndCount(kv as never, "rl:x", 3, 1)).toBe(true);
    expect(await checkAndCount(kv as never, "rl:x", 3, 1)).toBe(false);
    expect(kv.store.get("rl:x")).toBe("3");
  });
  it("tæller flere ad gangen (varianter) og afviser når puljen er for lille", async () => {
    const kv = kvMock();
    expect(await checkAndCount(kv as never, "usage:demo", 5, 3)).toBe(true);
    expect(await checkAndCount(kv as never, "usage:demo", 5, 3)).toBe(false);
    expect(await checkAndCount(kv as never, "usage:demo", 5, 2)).toBe(true);
  });
});

describe("ipHash", () => {
  it("er stabil, kort og uden rå IP", async () => {
    const a = await ipHash("203.0.113.7");
    const b = await ipHash("203.0.113.7");
    const c = await ipHash("203.0.113.8");
    expect(a).toBe(b);
    expect(a).not.toBe(c);
    expect(a).toMatch(/^[0-9a-f]{16}$/);
  });
});
