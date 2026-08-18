import { describe, expect, it } from "vitest";
import { DEMO_PRODUCTS, getTenant, toPublic, toSettings } from "../functions/api/_lib/tenants";
import { kvMock } from "./kvMock";

describe("demo-tenant bootstrap", () => {
  it("opretter demo-tenanten med produkter ved første opslag", async () => {
    const kv = kvMock();
    const tenant = await getTenant(kv as never, "demo");
    expect(tenant?.slug).toBe("demo");
    expect(tenant?.name).toContain("demo");
    expect(kv.store.has("tenant:demo")).toBe(true);
    expect(JSON.parse(kv.store.get("products:demo")!)).toHaveLength(DEMO_PRODUCTS.length);
    expect(JSON.parse(kv.store.get("tenants_index")!)).toContain("demo");
  });

  it("genbruger den gemte record ved næste opslag", async () => {
    const kv = kvMock();
    const foerste = await getTenant(kv as never, "demo");
    const anden = await getTenant(kv as never, "demo");
    expect(anden?.adminHash).toBe(foerste?.adminHash);
  });

  it("kender ikke andre slugs", async () => {
    const kv = kvMock();
    expect(await getTenant(kv as never, "findes-ikke")).toBeNull();
  });
});

describe("toPublic / toSettings", () => {
  it("lækker aldrig auth-felter", async () => {
    const kv = kvMock();
    const tenant = (await getTenant(kv as never, "demo"))!;
    const pub = toPublic(tenant) as Record<string, unknown>;
    const settings = toSettings(tenant) as Record<string, unknown>;
    for (const felt of ["adminSalt", "adminHash"]) {
      expect(pub[felt]).toBeUndefined();
      expect(settings[felt]).toBeUndefined();
    }
    expect(pub.notifyEmail).toBeUndefined();
    expect(settings.notifyEmail).toBeDefined();
  });
});
