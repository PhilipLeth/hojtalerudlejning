/**
 * Pæn slutkunde-URL: /t/<slug> serverer den statiske app-skal (/app).
 * Klienten læser selv slugget ud af stien.
 */

interface Env {
  ASSETS: Fetcher;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const slug = context.params.slug as string;
  if (!/^[a-z0-9][a-z0-9-]{1,30}$/.test(slug)) {
    return new Response("Not found", { status: 404 });
  }
  const url = new URL(context.request.url);
  url.pathname = "/app";
  const res = await context.env.ASSETS.fetch(new Request(url.toString(), context.request));
  // HTML-skallen må ikke caches hårdt — den skifter ved hvert deploy
  return new Response(res.body, {
    status: res.status,
    headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-cache" },
  });
};
