import { describe, expect, it } from "vitest";
import {
  hashPassword,
  randomSalt,
  verifyPassword,
  publicUserList,
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

  it("publicUserList viser kun aktive", () => {
    const users: AdminUserRecord[] = [
      { id: "a", name: "A", salt: "", hash: "", active: true, createdAt: "" },
      { id: "b", name: "B", salt: "", hash: "", active: false, createdAt: "" },
    ];
    expect(publicUserList(users)).toEqual([{ id: "a", name: "A" }]);
  });
});
