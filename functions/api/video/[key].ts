/** Serve uploadede produktvideoer fra R2 — med Range-support så
 *  browseren kan spole/streame (<video> sender Range-requests). */

interface Env {
  MEDIA: R2Bucket;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const key = (context.params.key as string) ?? "";
  const objectKey = `vid/${key}`;

  const rangeHeader = context.request.headers.get("Range");

  // Range-request: "bytes=start-end" (end kan mangle)
  if (rangeHeader) {
    const m = rangeHeader.match(/^bytes=(\d*)-(\d*)$/);
    if (m && (m[1] !== "" || m[2] !== "")) {
      const head = await context.env.MEDIA.head(objectKey);
      if (!head) return new Response("Not found", { status: 404 });
      const size = head.size;

      let start: number;
      let end: number;
      if (m[1] === "") {
        // suffix-range: sidste N bytes
        const suffix = Number(m[2]);
        start = Math.max(0, size - suffix);
        end = size - 1;
      } else {
        start = Number(m[1]);
        end = m[2] === "" ? size - 1 : Math.min(Number(m[2]), size - 1);
      }
      if (start >= size || start > end) {
        return new Response("Range Not Satisfiable", {
          status: 416,
          headers: { "Content-Range": `bytes */${size}` },
        });
      }

      const object = await context.env.MEDIA.get(objectKey, {
        range: { offset: start, length: end - start + 1 },
      });
      if (!object) return new Response("Not found", { status: 404 });

      return new Response(object.body, {
        status: 206,
        headers: {
          "Content-Type": object.httpMetadata?.contentType ?? "video/mp4",
          "Content-Range": `bytes ${start}-${end}/${size}`,
          "Content-Length": String(end - start + 1),
          "Accept-Ranges": "bytes",
          "Cache-Control": "public, max-age=31536000, immutable",
        },
      });
    }
  }

  const object = await context.env.MEDIA.get(objectKey);
  if (!object) return new Response("Not found", { status: 404 });

  return new Response(object.body, {
    status: 200,
    headers: {
      "Content-Type": object.httpMetadata?.contentType ?? "video/mp4",
      "Content-Length": String(object.size),
      "Accept-Ranges": "bytes",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
};
