/** Image upload → R2 (tidligere KV/base64). Returnerer /api/image/<key> URL.
 *  KV bruges stadig som læse-fallback for gamle billeder i /api/image/[key]. */

interface Env {
  BOOKINGS: KVNamespace;
  MEDIA: R2Bucket;
  ADMIN_SECRET: string;
}

const MAX_BYTES = 10_000_000; // 10 MB — R2 har ingen 500 kB-begrænsning som KV

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export const onRequestOptions: PagesFunction<Env> = async () =>
  new Response(null, { status: 204, headers: cors });

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const secret = new URL(context.request.url).searchParams.get("secret") ?? "";
  if (!context.env.ADMIN_SECRET || secret !== context.env.ADMIN_SECRET) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  }

  let formData: FormData;
  try {
    formData = await context.request.formData();
  } catch (err) {
    console.error("[upload] formData parse failed:", err);
    return new Response(JSON.stringify({ error: "Invalid form data" }), {
      status: 400,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  }

  // Workers kan returnere File eller Blob — ikke altid instanceof File
  const entry = formData.get("file");
  if (!entry || typeof entry === "string") {
    console.error("[upload] No file in formData. Keys:", [...formData.keys()]);
    return new Response(JSON.stringify({ error: "No file" }), {
      status: 400,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  }

  const blob = entry as Blob;

  if (blob.size > MAX_BYTES) {
    return new Response(JSON.stringify({ error: "Filen er for stor (maks 10 MB)" }), {
      status: 413,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  }

  if (blob.size === 0) {
    return new Response(JSON.stringify({ error: "Filen er tom" }), {
      status: 400,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  }

  const mime = blob.type || "image/jpeg";
  if (!mime.startsWith("image/")) {
    return new Response(JSON.stringify({ error: "Kun billedfiler (JPG, PNG, WebP)" }), {
      status: 415,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  }

  // VIGTIGT: ingen fil-endelse i nøglen — stier med endelse (fx .png) behandles
  // som statiske assets af Pages-routeren og rammer aldrig serverings-funktionen.
  const key = `img_${Date.now()}_${Math.random().toString(36).slice(2)}`;
  await context.env.MEDIA.put(`img/${key}`, await blob.arrayBuffer(), {
    httpMetadata: { contentType: mime },
  });
  console.log("[upload] Saved to R2", key, "size=", blob.size, "mime=", mime);

  return new Response(JSON.stringify({ url: `/api/image/${key}` }), {
    status: 200,
    headers: { ...cors, "Content-Type": "application/json" },
  });
};
