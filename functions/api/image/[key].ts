/** Serve uploadede billeder — nye ligger i R2, gamle som base64 i KV */

interface Env {
  BOOKINGS: KVNamespace;
  MEDIA: R2Bucket;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const key = (context.params.key as string) ?? "";

  // Nye billeder: R2
  const object = await context.env.MEDIA.get(`img/${key}`);
  if (object) {
    return new Response(object.body, {
      status: 200,
      headers: {
        "Content-Type": object.httpMetadata?.contentType ?? "image/jpeg",
        "Content-Length": String(object.size),
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  }

  // Legacy: base64 i KV
  const raw = await context.env.BOOKINGS.get(`image:${key}`);
  if (!raw) {
    return new Response("Not found", { status: 404 });
  }

  let mime = "image/jpeg";
  let b64 = raw;
  try {
    const parsed = JSON.parse(raw);
    mime = parsed.mime ?? mime;
    b64 = parsed.data;
  } catch {
    // legacy: raw base64
  }

  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);

  return new Response(bytes, {
    status: 200,
    headers: {
      "Content-Type": mime,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
};
