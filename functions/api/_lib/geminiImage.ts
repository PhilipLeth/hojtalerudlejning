/** Gemini billedredigering. Uden GEMINI_API_KEY kører vi demo (scenen uændret). */
export const DEFAULT_IMAGE_MODEL = "gemini-3.1-flash-image";

export function tilB64(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf);
  let bin = "";
  const CHUNK = 0x8000;
  for (let i = 0; i < bytes.length; i += CHUNK) bin += String.fromCharCode(...bytes.subarray(i, i + CHUNK));
  return btoa(bin);
}

export function fraB64(b64: string): ArrayBuffer {
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes.buffer;
}

type GeminiPart = {
  text?: string;
  inlineData?: { mimeType?: string; data?: string };
  inline_data?: { mime_type?: string; data?: string };
};

function billedDel(p: GeminiPart): { data: string; mime: string } | null {
  if (p.inlineData?.data) return { data: p.inlineData.data, mime: p.inlineData.mimeType ?? "image/jpeg" };
  if (p.inline_data?.data) return { data: p.inline_data.data, mime: p.inline_data.mime_type ?? "image/jpeg" };
  return null;
}

export async function geminiEditImage(opts: {
  apiKey?: string;
  model?: string;
  prompt: string;
  scene: { bytes: ArrayBuffer; mime: string };
  refs: Array<{ bytes: ArrayBuffer; mime: string }>;
}): Promise<{ ok: true; bytes: ArrayBuffer; mime: string } | { ok: true; demo: true } | { ok: false; fejl: string }> {
  const key = opts.apiKey?.trim();
  if (!key) return { ok: true, demo: true };
  const model = opts.model || DEFAULT_IMAGE_MODEL;
  const parts: Array<Record<string, unknown>> = [
    { text: opts.prompt },
    { inlineData: { mimeType: opts.scene.mime, data: tilB64(opts.scene.bytes) } },
    ...opts.refs.map((r) => ({ inlineData: { mimeType: r.mime, data: tilB64(r.bytes) } })),
  ];
  let res: Response;
  try {
    res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": key },
      body: JSON.stringify({
        contents: [{ role: "user", parts }],
        generationConfig: { responseModalities: ["TEXT", "IMAGE"] },
      }),
    });
  } catch (e) {
    return { ok: false, fejl: e instanceof Error ? e.message : "Netværksfejl mod AI" };
  }
  if (!res.ok) {
    const body = await res.text();
    console.log("[lys-ai] gemini-fejl", res.status, body.slice(0, 240));
    return { ok: false, fejl: `AI-tjenesten svarede ${res.status}` };
  }
  const data = (await res.json()) as { candidates?: Array<{ content?: { parts?: GeminiPart[] } }> };
  const billed = (data.candidates?.[0]?.content?.parts ?? []).map(billedDel).find((b) => b);
  if (!billed) return { ok: false, fejl: "AI'en returnerede intet billede" };
  return { ok: true, bytes: fraB64(billed.data), mime: billed.mime };
}
