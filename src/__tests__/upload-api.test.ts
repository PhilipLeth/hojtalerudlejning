// @vitest-environment node
/**
 * Sikrer at medie-upload i admin virker:
 * - /api/upload gemmer billeder i R2 og returnerer en URL som /api/image/[key] serverer
 *   (gamle billeder i KV serveres stadig som fallback)
 * - /api/upload-video streamer video til R2 og /api/video/[key] serverer med Range-support
 *
 * Regressionstest for tre bugs der har ramt upload:
 * 1. `instanceof File`-tjek der fejlede i Workers-runtime ("No file")
 * 2. Fil-endelse i nøglen (.png) — stier med endelse behandles som statiske
 *    assets af Cloudflare Pages-routeren, så billedet kunne aldrig hentes.
 * 3. KV's 500 kB-grænse afviste almindelige fotos — nu R2 med 10 MB (billeder) / 100 MB (video).
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { onRequestPost as uploadPost } from "../../functions/api/upload";
import { onRequestPost as uploadVideoPost } from "../../functions/api/upload-video";
import { onRequestGet as imageGet } from "../../functions/api/image/[key]";
import { onRequestGet as videoGet } from "../../functions/api/video/[key]";

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

/** Minimal R2-simulering: put (buffer/stream), get med range, head */
function fakeR2() {
  const store = new Map<string, { bytes: Uint8Array; contentType?: string }>();
  return {
    store,
    put: vi.fn(async (key: string, value: unknown, opts?: { httpMetadata?: { contentType?: string } }) => {
      // Normaliser ArrayBuffer/TypedArray/ReadableStream/Blob til bytes
      const buf = await new Response(value as BodyInit).arrayBuffer();
      store.set(key, { bytes: new Uint8Array(buf), contentType: opts?.httpMetadata?.contentType });
    }),
    get: vi.fn(async (key: string, opts?: { range?: { offset: number; length: number } }) => {
      const obj = store.get(key);
      if (!obj) return null;
      let bytes = obj.bytes;
      if (opts?.range) {
        bytes = bytes.slice(opts.range.offset, opts.range.offset + opts.range.length);
      }
      return {
        body: bytes,
        size: obj.bytes.length,
        httpMetadata: { contentType: obj.contentType },
      };
    }),
    head: vi.fn(async (key: string) => {
      const obj = store.get(key);
      return obj ? { size: obj.bytes.length } : null;
    }),
  };
}

function uploadContext(
  kv: ReturnType<typeof fakeKv>,
  r2: ReturnType<typeof fakeR2>,
  opts: { secret?: string; file?: File | string; fieldName?: string } = {}
) {
  const fd = new FormData();
  if (opts.file !== undefined) fd.append(opts.fieldName ?? "file", opts.file);
  const secret = opts.secret ?? SECRET;
  const request = new Request(`https://lejhojtaler.dk/api/upload?secret=${encodeURIComponent(secret)}`, {
    method: "POST",
    body: fd,
  });
  return { request, env: { BOOKINGS: kv, MEDIA: r2, ADMIN_SECRET: SECRET } } as any;
}

// Samme feltnavn som ImageField.tsx sender — ændres det ét sted, skal det ændres begge steder
const FIELD_NAME = "file";

function pngFile(bytes = 1000, name = "produkt.png") {
  return new File([new Uint8Array(bytes).fill(137)], name, { type: "image/png" });
}

describe("Admin billede-upload (/api/upload → R2)", () => {
  let kv: ReturnType<typeof fakeKv>;
  let r2: ReturnType<typeof fakeR2>;
  beforeEach(() => {
    kv = fakeKv();
    r2 = fakeR2();
  });

  it("uploader en PNG til R2 og returnerer en brugbar URL", async () => {
    const res = await uploadPost(uploadContext(kv, r2, { file: pngFile() }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.url).toMatch(/^\/api\/image\/img_/);
    expect(r2.put).toHaveBeenCalledOnce();
    expect(kv.put).not.toHaveBeenCalled();
  });

  it("nøglen har INGEN fil-endelse (punktum) — ellers rammer URL'en aldrig funktionen", async () => {
    const res = await uploadPost(uploadContext(kv, r2, { file: pngFile(1000, "billede.med.punktummer.png") }));
    const body = await res.json();
    const key = body.url.replace("/api/image/", "");
    expect(key).not.toContain(".");
  });

  it("uploadet billede kan hentes retur via /api/image/[key] med korrekt mime", async () => {
    const upRes = await uploadPost(uploadContext(kv, r2, { file: pngFile(2048) }));
    const { url } = await upRes.json();
    const key = url.replace("/api/image/", "");

    const getRes = await imageGet({ params: { key }, env: { BOOKINGS: kv, MEDIA: r2 } } as any);
    expect(getRes.status).toBe(200);
    expect(getRes.headers.get("Content-Type")).toBe("image/png");
    const buf = await getRes.arrayBuffer();
    expect(buf.byteLength).toBe(2048);
  });

  it("gamle KV-billeder (base64) serveres stadig som fallback", async () => {
    const bytes = new Uint8Array(64).fill(7);
    const b64 = Buffer.from(bytes).toString("base64");
    kv.store.set("image:img_legacy123", JSON.stringify({ mime: "image/webp", data: b64 }));

    const res = await imageGet({ params: { key: "img_legacy123" }, env: { BOOKINGS: kv, MEDIA: r2 } } as any);
    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toBe("image/webp");
    expect((await res.arrayBuffer()).byteLength).toBe(64);
  });

  it("afviser uden korrekt admin-kode (401)", async () => {
    const res = await uploadPost(uploadContext(kv, r2, { file: pngFile(), secret: "forkert" }));
    expect(res.status).toBe(401);
    expect(r2.put).not.toHaveBeenCalled();
  });

  it("svarer 'No file' hvis feltnavnet ikke er 'file'", async () => {
    const res = await uploadPost(uploadContext(kv, r2, { file: pngFile(), fieldName: "image" }));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe("No file");
  });

  it("accepterer almindelige fotos over 500 kB (gammel KV-grænse)", async () => {
    const res = await uploadPost(uploadContext(kv, r2, { file: pngFile(3_000_000) }));
    expect(res.status).toBe(200);
  });

  it("afviser filer over 10 MB (413)", async () => {
    const res = await uploadPost(uploadContext(kv, r2, { file: pngFile(11_000_000) }));
    expect(res.status).toBe(413);
  });

  it("afviser ikke-billeder (415)", async () => {
    const pdf = new File([new Uint8Array(1000)], "manual.pdf", { type: "application/pdf" });
    const res = await uploadPost(uploadContext(kv, r2, { file: pdf }));
    expect(res.status).toBe(415);
  });

  it("afviser tomme filer", async () => {
    const res = await uploadPost(uploadContext(kv, r2, { file: pngFile(0) }));
    expect(res.status).toBe(400);
  });

  it("håndterer Blob uden File-navn (Workers-runtime kompatibilitet)", async () => {
    const fd = new FormData();
    fd.append(FIELD_NAME, new Blob([new Uint8Array(500)], { type: "image/webp" }), "x");
    const request = new Request(`https://lejhojtaler.dk/api/upload?secret=${SECRET}`, { method: "POST", body: fd });
    const res = await uploadPost({ request, env: { BOOKINGS: kv, MEDIA: r2, ADMIN_SECRET: SECRET } } as any);
    expect(res.status).toBe(200);
  });
});

function videoContext(
  r2: ReturnType<typeof fakeR2>,
  opts: { secret?: string; bytes?: Uint8Array; contentType?: string } = {}
) {
  const bytes = opts.bytes ?? new Uint8Array(5000).map((_, i) => i % 251);
  const secret = opts.secret ?? SECRET;
  const request = new Request(`https://lejhojtaler.dk/api/upload-video?secret=${encodeURIComponent(secret)}`, {
    method: "POST",
    headers: {
      "Content-Type": opts.contentType ?? "video/mp4",
      "Content-Length": String(bytes.length),
    },
    body: bytes,
  });
  return { request, env: { MEDIA: r2, ADMIN_SECRET: SECRET } } as any;
}

describe("Admin video-upload (/api/upload-video → R2) + serving med Range", () => {
  let r2: ReturnType<typeof fakeR2>;
  beforeEach(() => {
    r2 = fakeR2();
  });

  it("uploader MP4 og returnerer /api/video/<key> uden fil-endelse", async () => {
    const res = await uploadVideoPost(videoContext(r2));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.url).toMatch(/^\/api\/video\/vid_/);
    expect(body.url.replace("/api/video/", "")).not.toContain(".");
    expect(r2.put).toHaveBeenCalledOnce();
  });

  it("afviser uden korrekt admin-kode (401)", async () => {
    const res = await uploadVideoPost(videoContext(r2, { secret: "forkert" }));
    expect(res.status).toBe(401);
  });

  it("afviser ikke-video (415)", async () => {
    const res = await uploadVideoPost(videoContext(r2, { contentType: "application/pdf" }));
    expect(res.status).toBe(415);
  });

  it("uploadet video serveres med korrekt type, længde og Accept-Ranges", async () => {
    const src = new Uint8Array(10_000).map((_, i) => i % 256);
    const upRes = await uploadVideoPost(videoContext(r2, { bytes: src }));
    const { url } = await upRes.json();
    const key = url.replace("/api/video/", "");

    const res = await videoGet({
      params: { key },
      env: { MEDIA: r2 },
      request: new Request(`https://lejhojtaler.dk${url}`),
    } as any);
    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toBe("video/mp4");
    expect(res.headers.get("Accept-Ranges")).toBe("bytes");
    expect((await res.arrayBuffer()).byteLength).toBe(10_000);
  });

  it("Range-request giver 206 med præcis de rigtige bytes (spoling i <video>)", async () => {
    const src = new Uint8Array(10_000).map((_, i) => i % 256);
    const upRes = await uploadVideoPost(videoContext(r2, { bytes: src }));
    const { url } = await upRes.json();
    const key = url.replace("/api/video/", "");

    const res = await videoGet({
      params: { key },
      env: { MEDIA: r2 },
      request: new Request(`https://lejhojtaler.dk${url}`, { headers: { Range: "bytes=100-199" } }),
    } as any);
    expect(res.status).toBe(206);
    expect(res.headers.get("Content-Range")).toBe("bytes 100-199/10000");
    const chunk = new Uint8Array(await res.arrayBuffer());
    expect(chunk.length).toBe(100);
    expect([...chunk]).toEqual([...src.slice(100, 200)]);
  });

  it("åben Range (bytes=9900-) giver resten af filen", async () => {
    const src = new Uint8Array(10_000).map((_, i) => i % 256);
    const upRes = await uploadVideoPost(videoContext(r2, { bytes: src }));
    const { url } = await upRes.json();
    const key = url.replace("/api/video/", "");

    const res = await videoGet({
      params: { key },
      env: { MEDIA: r2 },
      request: new Request(`https://lejhojtaler.dk${url}`, { headers: { Range: "bytes=9900-" } }),
    } as any);
    expect(res.status).toBe(206);
    expect((await res.arrayBuffer()).byteLength).toBe(100);
  });

  it("Range uden for filen giver 416", async () => {
    const upRes = await uploadVideoPost(videoContext(r2));
    const { url } = await upRes.json();
    const key = url.replace("/api/video/", "");

    const res = await videoGet({
      params: { key },
      env: { MEDIA: r2 },
      request: new Request(`https://lejhojtaler.dk${url}`, { headers: { Range: "bytes=99999-" } }),
    } as any);
    expect(res.status).toBe(416);
  });

  it("ukendt video giver 404", async () => {
    const res = await videoGet({
      params: { key: "vid_findes_ikke" },
      env: { MEDIA: r2 },
      request: new Request("https://lejhojtaler.dk/api/video/vid_findes_ikke"),
    } as any);
    expect(res.status).toBe(404);
  });
});
