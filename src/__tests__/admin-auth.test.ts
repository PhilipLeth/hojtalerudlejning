import { describe, expect, it } from "vitest";
import {
  consumeMagicLink,
  createMagicLink,
  ensureDefaultUsers,
  hashPassword,
  isValidEmail,
  maskEmail,
  randomSalt,
  verifyPassword,
  publicUserList,
  isPlausibleAdminToken,
  type AdminUserRecord,
} from "../../functions/api/_lib/adminAuth";

describe("adminAuth", () => {
  it("hashPassword er deterministisk med samme salt", async () => {
    const salt = "dGVzdC1zYWx0LWhlcmU=";
    const a = await hashPassword("hemmelig", salt);
    const b = await hashPassword("hemmelig", salt);
    expect(a).toBe(b);
    expect(a).not.toBe(await hashPassword("anden", salt));
  });

  it("verifyPassword accepterer korrekt kode", async () => {
    const salt = randomSalt();
    const hash = await hashPassword("frederik123", salt);
    const user: AdminUserRecord = {
      id: "frederik",
      name: "Frederik",
      salt,
      hash,
      active: true,
      createdAt: new Date().toISOString(),
    };
    expect(await verifyPassword(user, "frederik123")).toBe(true);
    expect(await verifyPassword(user, "forkert")).toBe(false);
  });

  it("afviser for lange eller flerlinjede tokens", () => {
    expect(isPlausibleAdminToken("abc123")).toBe(true);
    expect(isPlausibleAdminToken("a".repeat(257))).toBe(false);
    expect(isPlausibleAdminToken("En advarsel\nom noget")).toBe(false);
  });

  it("publicUserList viser kun aktive", () => {
    const users: AdminUserRecord[] = [
      { id: "a", name: "A", salt: "", hash: "", active: true, createdAt: "" },
      { id: "b", name: "B", salt: "", hash: "", active: false, createdAt: "" },
    ];
    expect(publicUserList(users)).toEqual([{ id: "a", name: "A", hasEmail: false }]);
  });
});

/** Lille KV i hukommelsen — nok til tokens med TTL. */
type Kv = Parameters<typeof createMagicLink>[0];
function fakeKv(): Kv {
  const store = new Map<string, string>();
  return {
    get: async (k: string) => store.get(k) ?? null,
    put: async (k: string, v: string) => { store.set(k, v); },
    delete: async (k: string) => { store.delete(k); },
    list: async () => ({ keys: [...store.keys()].map((name) => ({ name })), list_complete: true, cacheStatus: null }),
  } as unknown as Kv;
}

describe("login-link (magic link)", () => {
  const philip: AdminUserRecord = {
    id: "philip",
    name: "Philip",
    email: "philip@example.com",
    salt: "",
    hash: "",
    active: true,
    createdAt: "",
  };

  it("et link kan kun indløses én gang", async () => {
    const kv = fakeKv();
    await kv.put("admin_users", JSON.stringify([philip]));
    const token = await createMagicLink(kv, philip);
    expect(token).toBeTruthy();
    const first = await consumeMagicLink(kv, token!);
    expect(first?.id).toBe("philip");
    const second = await consumeMagicLink(kv, token!);
    expect(second).toBeNull();
  });

  it("højst ét link pr. bruger pr. minut", async () => {
    const kv = fakeKv();
    expect(await createMagicLink(kv, philip)).toBeTruthy();
    expect(await createMagicLink(kv, philip)).toBeNull();
  });

  it("et link til en deaktiveret bruger giver ikke adgang", async () => {
    const kv = fakeKv();
    const token = await createMagicLink(kv, philip);
    await kv.put("admin_users", JSON.stringify([{ ...philip, active: false }]));
    expect(await consumeMagicLink(kv, token!)).toBeNull();
  });

  it("ukendte og uplausible tokens afvises", async () => {
    const kv = fakeKv();
    expect(await consumeMagicLink(kv, "findes-ikke")).toBeNull();
    expect(await consumeMagicLink(kv, "a".repeat(300))).toBeNull();
  });

  it("brugerlisten fortæller om der kan sendes link, uden at afsløre adressen", () => {
    const uden: AdminUserRecord = { ...philip, id: "frederik", name: "Frederik", email: undefined };
    expect(publicUserList([philip, uden])).toEqual([
      { id: "philip", name: "Philip", hasEmail: true },
      { id: "frederik", name: "Frederik", hasEmail: false },
    ]);
    expect(maskEmail("philipleth@gmail.com")).toBe("ph…@gmail.com");
    expect(JSON.stringify(publicUserList([philip]))).not.toContain("example.com");
  });

  it("bootstrap giver begge brugere en e-mail, så linket virker fra dag ét", async () => {
    const kv = fakeKv();
    const users = await ensureDefaultUsers(kv, "startkode");
    expect(users.map((u) => u.id)).toEqual(["frederik", "philip"]);
    expect(users.every((u) => isValidEmail(u.email ?? ""))).toBe(true);
    expect(await verifyPassword(users[1], "startkode")).toBe(true);
  });
});
