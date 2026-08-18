import { describe, expect, it } from "vitest";
import type { TenantRecord } from "../shared/types";
import {
  createSession,
  extractToken,
  hasSession,
  hashSecret,
  randomSalt,
  requireTenantAdmin,
  sessionToken,
  verifySecret,
} from "../functions/api/_lib/auth";
import { kvMock } from "./kvMock";

function req(headers: Record<string, string> = {}): Request {
  return new Request("https://x.dk/api", { headers });
}

describe("hashSecret", () => {
  it("er deterministisk med samme salt og forskellig med nyt salt", async () => {
    const salt = randomSalt();
    const a = await hashSecret("hemmeligt-kodeord", salt);
    const b = await hashSecret("hemmeligt-kodeord", salt);
    const c = await hashSecret("hemmeligt-kodeord", randomSalt());
    expect(a).toBe(b);
    expect(a).not.toBe(c);
  });
});

describe("verifySecret", () => {
  it("matcher kun den rigtige adgangskode", async () => {
    const salt = randomSalt();
    const tenant = { adminSalt: salt, adminHash: await hashSecret("korrekt", salt) } as TenantRecord;
    expect(await verifySecret(tenant, "korrekt")).toBe(true);
    expect(await verifySecret(tenant, "forkert")).toBe(false);
  });
});

describe("sessionToken", () => {
  it("er URL-sikkert og langt nok", () => {
    const t = sessionToken();
    expect(t).toMatch(/^[A-Za-z0-9_-]{40,}$/);
    expect(sessionToken()).not.toBe(t);
  });
});

describe("extractToken", () => {
  it("læser Bearer og X-Admin-Token", () => {
    expect(extractToken(req({ Authorization: "Bearer abc123" }))).toBe("abc123");
    expect(extractToken(req({ "X-Admin-Token": "xyz" }))).toBe("xyz");
    expect(extractToken(req())).toBeNull();
    expect(extractToken(req({ Authorization: "Bearer " }))).toBeNull();
  });
});

describe("sessioner + requireTenantAdmin", () => {
  it("udsteder og finder en session — kun for den rigtige tenant", async () => {
    const kv = kvMock();
    const token = await createSession(kv as never, "demo");
    expect(await hasSession(kv as never, "demo", token)).toBe(true);
    expect(await hasSession(kv as never, "anden-butik", token)).toBe(false);
    expect(await hasSession(kv as never, "demo", "forkert-token")).toBe(false);
  });

  it("giver adgang med session eller PLATFORM_SECRET og afviser ellers", async () => {
    const kv = kvMock();
    const token = await createSession(kv as never, "demo");
    const env = { DATA: kv as never, PLATFORM_SECRET: "master-hemmelighed" };

    expect(await requireTenantAdmin(env, req({ Authorization: `Bearer ${token}` }), "demo")).toBeNull();
    expect(await requireTenantAdmin(env, req({ Authorization: "Bearer master-hemmelighed" }), "demo")).toBeNull();

    const afvist = await requireTenantAdmin(env, req({ Authorization: "Bearer nix" }), "demo");
    expect(afvist).toBeInstanceOf(Response);
    expect((afvist as Response).status).toBe(401);

    const udenHeader = await requireTenantAdmin(env, req(), "demo");
    expect((udenHeader as Response).status).toBe(401);
  });
});
