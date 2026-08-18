/**
 * Servér billeder fra R2. Kun de kendte prefixes (scenes/gen/products) under
 * t/<slug>/ er tilladt — id'erne er kryptografisk tilfældige, så stierne kan
 * ikke gættes. Signerede URL'er er PRD-opgave 5.5.
 */

interface Env {
  MEDIA: R2Bucket;
}

const TILLADT = /^t\/[a-z0-9-]+\/(scenes|gen|products)\/[a-z0-9._-]+$/;

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const dele = context.params.path;
  const sti = Array.isArray(dele) ? dele.join("/") : (dele ?? "");
  if (!TILLADT.test(sti)) return new Response("Not found", { status: 404 });

  const obj = await context.env.MEDIA.get(sti);
  if (!obj) return new Response("Not found", { status: 404 });

  return new Response(obj.body, {
    status: 200,
    headers: {
      "Content-Type": obj.httpMetadata?.contentType ?? "image/jpeg",
      "Content-Length": String(obj.size),
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
};
