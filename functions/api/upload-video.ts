/** Video upload → R2. Body er selve videofilen (rå bytes, IKKE multipart),
 *  så store filer streames direkte til R2 uden at fylde workerens hukommelse.
 *  Returnerer /api/video/<key> URL som gemmes på produktet i kataloget. */

interface Env {
  MEDIA: R2Bucket;
  ADMIN_SECRET: string;
}

const MAX_BYTES = 100_000_000; // 100 MB (Cloudflare request-body grænse)

const ALLOWED_TYPES = ["video/mp4", "video/webm", "video/quicktime"];

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

function json(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  });
}

export const onRequestOptions: PagesFunction<Env> = async () =>
  new Response(null, { status: 204, headers: cors });

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;
  const secret = new URL(request.url).searchParams.get("secret") ?? "";
  if (!env.ADMIN_SECRET || secret !== env.ADMIN_SECRET) {
    return json({ error: "Unauthorized" }, 401);
  }

  const contentType = (request.headers.get("Content-Type") || "").split(";")[0].trim();
  if (!ALLOWED_TYPES.includes(contentType)) {
    return json({ error: "Kun video (MP4, WebM eller MOV)" }, 415);
  }

  const contentLength = Number(request.headers.get("Content-Length") || 0);
  if (!contentLength) {
    return json({ error: "Filen er tom" }, 400);
  }
  if (contentLength > MAX_BYTES) {
    return json({ error: "Videoen er for stor (maks 100 MB)" }, 413);
  }

  const key = `vid_${Date.now()}_${Math.random().toString(36).slice(2)}`;

  // Stream direkte til R2 — request.body buffer ikke hele filen i hukommelsen
  if (!request.body) {
    return json({ error: "Filen er tom" }, 400);
  }
  await env.MEDIA.put(`vid/${key}`, request.body, {
    httpMetadata: { contentType },
  });
  console.log("[upload-video] Saved to R2", key, "size=", contentLength, "type=", contentType);

  return json({ url: `/api/video/${key}` }, 200);
};
