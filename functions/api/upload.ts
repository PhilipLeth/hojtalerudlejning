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
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...cors, "Content-Type": "application/json" } });
  }

  let formData: FormData;
  try {
    formData = await context.request.formData();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid form data" }), { status: 400, headers: { ...cors, "Content-Type": "application/json" } });
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return new Response(JSON.stringify({ error: "No file" }), { status: 400, headers: { ...cors, "Content-Type": "application/json" } });
  }

  if (file.size > MAX_BYTES) {
    return new Response(JSON.stringify({ error: `Filen er for stor (maks 500 kB)` }), { status: 413, headers: { ...cors, "Content-Type": "application/json" } });
  }

  const buf = await file.arrayBuffer();
  const bytes = new Uint8Array(buf);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  const b64 = btoa(binary);

  const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const key = `img_${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
  const value = JSON.stringify({ mime: file.type || "image/jpeg", data: b64 });

  await context.env.BOOKINGS.put(`image:${key}`, value, { expirationTtl: 60 * 60 * 24 * 365 * 5 }); // 5 years

  return new Response(JSON.stringify({ url: `/api/image/${key}` }), {
    status: 200,
    headers: { ...cors, "Content-Type": "application/json" },
  });
};
