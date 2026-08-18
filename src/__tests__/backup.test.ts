import { describe, it, expect } from "vitest";
import {
  BACKUP_PREFIX,
  backupKey,
  buildSnapshot,
  listBackups,
  pruneBackups,
  writeBackup,
} from "../../functions/api/_lib/backup";
import { paymentMail } from "../../functions/api/_lib/ownerMail";

/** KV-stub: kun det list/get vi bruger */
function fakeKv(entries: Record<string, string>) {
  return {
    list: async () => ({ keys: Object.keys(entries).map((name) => ({ name })), list_complete: true }),
    get: async (name: string) => entries[name] ?? null,
  } as unknown as KVNamespace;
}

/** R2-stub der husker hvad der blev lagt og slettet */
function fakeR2(existing: Record<string, { size: number; uploaded: Date }> = {}) {
  const store = { ...existing };
  const deleted: string[] = [];
  return {
    deleted,
    store,
    bucket: {
      put: async (key: string, body: string) => {
        store[key] = { size: body.length, uploaded: new Date("2026-08-18T01:30:00Z") };
      },
      delete: async (key: string) => {
        delete store[key];
        deleted.push(key);
      },
      list: async () => ({
        objects: Object.entries(store).map(([key, v]) => ({ key, size: v.size, uploaded: v.uploaded, customMetadata: {} })),
        truncated: false,
      }),
    } as unknown as R2Bucket,
  };
}

describe("sikkerhedskopi", () => {
  it("tager alt med undtagen sessioner og gamle billeder", async () => {
    const kv = fakeKv({
      booking_1: '{"name":"Agnes","total":1995}',
      sms_settings: '{"enabled":false}',
      invoice_seq_2026: "7",
      admin_session_abc: '{"userId":"frederik"}',
      "image:gammel": "base64...",
    });
    const snap = await buildSnapshot(kv);

    expect(Object.keys(snap.data).sort()).toEqual(["booking_1", "invoice_seq_2026", "sms_settings"]);
    expect(snap.keys).toBe(3);
    // JSON gemmes som JSON, så filen kan læses og bruges til gendannelse
    expect(snap.data.booking_1).toEqual({ name: "Agnes", total: 1995 });
    // Fakturatælleren er gyldig JSON og bliver et tal. Det er uden betydning
    // for en gendannelse: JSON.stringify(7) giver "7" igen.
    expect(snap.data.invoice_seq_2026).toBe(7);
  });

  it("skriver én fil pr. dag, så en ekstra kørsel ikke fylder R2 op", async () => {
    const r2 = fakeR2();
    const snap = await buildSnapshot(fakeKv({ booking_1: "{}" }));
    const first = await writeBackup({ BOOKINGS: {} as KVNamespace, MEDIA: r2.bucket }, snap);
    await writeBackup({ BOOKINGS: {} as KVNamespace, MEDIA: r2.bucket }, snap);

    expect(first.key).toBe(backupKey(new Date(snap.takenAt)));
    expect(first.key.startsWith(BACKUP_PREFIX)).toBe(true);
    expect(Object.keys(r2.store)).toHaveLength(1);
  });

  it("rydder kopier ældre end 90 dage — og kun dem", async () => {
    const old = new Date("2026-01-01T02:00:00Z");
    const recent = new Date("2026-08-17T02:00:00Z");
    const r2 = fakeR2({
      "backups/2026-01-01.json": { size: 10, uploaded: old },
      "backups/2026-08-17.json": { size: 10, uploaded: recent },
    });

    const removed = await pruneBackups({ BOOKINGS: {} as KVNamespace, MEDIA: r2.bucket });

    expect(removed).toEqual(["backups/2026-01-01.json"]);
    expect(Object.keys(r2.store)).toEqual(["backups/2026-08-17.json"]);
  });

  it("viser nyeste kopi først", async () => {
    const r2 = fakeR2({
      "backups/2026-08-16.json": { size: 10, uploaded: new Date() },
      "backups/2026-08-18.json": { size: 10, uploaded: new Date() },
      "backups/2026-08-17.json": { size: 10, uploaded: new Date() },
    });
    const files = await listBackups({ BOOKINGS: {} as KVNamespace, MEDIA: r2.bucket });
    expect(files.map((f) => f.key)).toEqual([
      "backups/2026-08-18.json",
      "backups/2026-08-17.json",
      "backups/2026-08-16.json",
    ]);
  });
});

describe("betalingskvittering til os selv", () => {
  it("siger hvad der mangler, ikke bare hvad der kom ind", () => {
    const mail = paymentMail({
      bookingId: "booking_1",
      name: "Agnes Dahle Stæhr",
      total: 2000,
      paid: 500,
      amount: 500,
      method: "mobilepay",
      by: "Frederik",
    });
    expect(mail.subject).toBe("Betaling registreret: 500 kr — Agnes Dahle Stæhr");
    expect(mail.html).toContain("1.500 kr");
    expect(mail.html).toContain("Frederik");
  });

  it("skriver tydeligt når ordren er fuldt betalt", () => {
    const mail = paymentMail({ bookingId: "b", name: "Agnes", total: 1000, paid: 1000, amount: 1000, method: "kort" });
    expect(mail.html).toContain("Ingenting — ordren er betalt");
  });

  it("en fjernet betaling ser ikke ud som en indbetaling", () => {
    const mail = paymentMail({ bookingId: "b", name: "Agnes", total: 1000, paid: 0, amount: 0, method: "—", removed: true });
    expect(mail.subject).toContain("Betaling fjernet");
  });
});
