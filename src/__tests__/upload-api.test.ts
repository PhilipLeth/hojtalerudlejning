// @vitest-environment node
/**
 * Sikrer at billede-upload i admin virker: /api/upload gemmer filen i KV og
 * returnerer en URL som /api/image/[key] kan servere.
 *
 * Regressionstest for to bugs der har ramt upload:
 * 1. `instanceof File`-tjek der fejlede i Workers-runtime ("No file")
 * 2. Fil-endelse i nøglen (.png) — stier med endelse behandles som statiske
 *    assets af Cloudflare Pages-routeren, så billedet kunne aldrig hentes.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { onRequestPost as uploadPost } from "../../functions/api/upload";
import { onRequestGet as imageGet } from "../../functions/api/image/[key]";

const SECRET = "test-secret";

function fakeKv() {
  const store = new Map<string, string>();
  return {
    store,
    put: vi.fn(async (k: string, v: string) => {
      store.set(k, v);
    }),
    get: vi.fn(async (k: string) => store.get(k) ?? null),
    delete: vi.fn(async (k: string) => {
      store.delete(k);
    }),
  };
}

function uploadContext(kv: ReturnType<typeof fakeKv>, opts: { secret?: string; file?: File | string; fieldName?: string } = {}) {
  const fd = new FormData();
  if (opts.file !== undefined) fd.append(opts.fieldName ?? "file", opts.file);
  const secret = opts.secret ?? SECRET;
  const request = new Request(`https://lejhojtaler.dk/api/upload?secret=${encodeURIComponent(secret)}`, {
    method: "POST",
    body: fd,
  });
  return { request, env: { BOOKINGS: kv, ADMIN_SECRET: SECRET } } as any;
}

// Samme feltnavn som ImageField.tsx sender — ændres det ét sted, skal det ændres begge steder
const FIELD_NAME = "file";

function pngFile(bytes = 1000, name = "produkt.png") {
  return new File([new Uint8Array(bytes).fill(137)], name, { type: "image/png" });
}

describe("Admin billede-upload (/api/upload)", () => {
  let kv: ReturnType<typeof fakeKv>;
  beforeEach(() => {
    kv = fakeKv();
  });

  it("uploader en PNG og returnerer en brugbar URL", async () => {
    const res = await uploadPost(uploadContext(kv, { file: pngFile() }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.url).toMatch(/^\/api\/image\/img_/);
    expect(kv.put).toHaveBeenCalledOnce();
  });

  it("nøglen har INGEN fil-endelse (punktum) — ellers rammer URL'en aldrig funktionen", async () => {
    const res = await uploadPost(uploadContext(kv, { file: pngFile(1000, "billede.med.punktummer.png") }));
    const body = await res.json();
    const key = body.url.replace("/api/image/", "");
    expect(key).not.toContain(".");
  });

  it("uploadet billede kan hentes retur via /api/image/[key] med korrekt mime", async () => {
    const upRes = await uploadPost(uploadContext(kv, { file: pngFile(2048) }));
    const { url } = await upRes.json();
    const key = url.replace("/api/image/", "");

    const getRes = await imageGet({ params: { key }, env: { BOOKINGS: kv } } as any);
    expect(getRes.status).toBe(200);
    expect(getRes.headers.get("Content-Type")).toBe("image/png");
    const buf = await getRes.arrayBuffer();
    expect(buf.byteLength).toBe(2048);
  });

  it("afviser uden korrekt admin-kode (401)", async () => {
    const res = await uploadPost(uploadContext(kv, { file: pngFile(), secret: "forkert" }));
    expect(res.status).toBe(401);
    expect(kv.put).not.toHaveBeenCalled();
  });

  it("svarer 'No file' hvis feltnavnet ikke er 'file'", async () => {
    const res = await uploadPost(uploadContext(kv, { file: pngFile(), fieldName: "image" }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe("No file");
  });

  it("afviser filer over 500 kB (413)", async () => {
    const res = await uploadPost(uploadContext(kv, { file: pngFile(600_000) }));
    expect(res.status).toBe(413);
  });

  it("afviser tomme filer", async () => {
    const res = await uploadPost(uploadContext(kv, { file: pngFile(0) }));
    expect(res.status).toBe(400);
  });

  it("håndterer Blob uden File-navn (Workers-runtime kompatibilitet)", async () => {
    const fd = new FormData();
    fd.append(FIELD_NAME, new Blob([new Uint8Array(500)], { type: "image/webp" }), "x");
    const request = new Request(`https://lejhojtaler.dk/api/upload?secret=${SECRET}`, { method: "POST", body: fd });
    const res = await uploadPost({ request, env: { BOOKINGS: kv, ADMIN_SECRET: SECRET } } as any);
    expect(res.status).toBe(200);
  });
});
