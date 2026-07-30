/** Image upload: stores images in KV as base64, returns /api/image/<key> URL */

interface Env {
  BOOKINGS: KVNamespace;
  ADMIN_SECRET: string;
}

const MAX_BYTES = 500_000; // 500 kB limit

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export const onRequestOptions: PagesFunction<Env> = async () =>
  new Response(null, { status: 204, headers: cors });

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const secret = new URL(context.request.url).searchParams.get("secret") ?? "";
  if (secret !== context.env.ADMIN_SECRET) {
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
  const fileName =
    "name" in entry && typeof (entry as File).name === "string"
      ? (entry as File).name
      : "upload.jpg";

  if (blob.size > MAX_BYTES) {
    return new Response(JSON.stringify({ error: `Filen er for stor (maks 500 kB)` }), {
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

  const buf = await blob.arrayBuffer();
  const bytes = new Uint8Array(buf);

  // Base64-encode uden String.fromCharCode-stack-overflow på store filer
  let binary = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  const b64 = btoa(binary);

  const ext = fileName.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
  const key = `img_${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
  const mime = blob.type || "image/jpeg";
  const value = JSON.stringify({ mime, data: b64 });

  // KV max TTL er ~1 år hvis sat — gem uden expiry så billeder ikke forsvinder
  await context.env.BOOKINGS.put(`image:${key}`, value);
  console.log("[upload] Saved", key, "size=", blob.size, "mime=", mime);

  return new Response(JSON.stringify({ url: `/api/image/${key}` }), {
    status: 200,
    headers: { ...cors, "Content-Type": "application/json" },
  });
};
