/**
 * AI-adapter: indsætter produkter fotorealistisk i kundens billede.
 *
 * Det ENESTE sted billedmodellen kendes. Default er Googles
 * gemini-2.5-flash-image ("Nano Banana") — god til scene-bevarende
 * redigering, tager flere input-billeder og koster ~0,04 USD/billede.
 * Opgradering til gemini-3-pro-image-preview sker pr. tenant (aiModel)
 * eller globalt (GEMINI_MODEL) uden andre ændringer.
 *
 * Uden GEMINI_API_KEY kører demo-mode: scenen returneres uændret og UI'et
 * viser en DEMO-mærkat, så hele flowet kan testes gratis.
 */

import type { Product } from "../../../shared/types";
import { tilB64, fraB64 } from "./id";

export const DEFAULT_MODEL = "gemini-2.5-flash-image";

/** Ét hint pr. variant — samme produkter, forskellig opstilling. */
export const ARRANGEMENT_HINTS = [
  "Arrange the furniture as one natural, inviting grouping in the most suitable open area.",
  "Use an airy, minimalist placement with generous space between the pieces.",
  "Make the space feel fully furnished and cozy, using the available area well.",
];

export interface ProductRef {
  bytes: ArrayBuffer;
  mime: string;
}

export interface GenInput {
  sceneBytes: ArrayBuffer;
  sceneMime: string;
  productRefs: ProductRef[];
  products: Product[];
  hintIndex: number;
  model: string;
  apiKey?: string;
}

export type GenResultat =
  | { ok: true; bytes: ArrayBuffer; mime: string }
  | { ok: true; demo: true }
  | { ok: false; fejl: string };

/**
 * Prompten er på engelsk — billedmodeller følger engelsk mest præcist.
 * Produktreferencerne vedhæftes EFTER scenen i samme rækkefølge som listen.
 */
export function buildPrompt(products: Product[], hintIndex: number, antalRefs: number): string {
  const hint = ARRANGEMENT_HINTS[hintIndex] ?? ARRANGEMENT_HINTS[0];
  const linjer = products.map((p, i) => {
    const dele = [`${i + 1}. "${p.name}"`];
    if (p.dimensions) dele.push(`size ${p.dimensions}`);
    if (p.description) dele.push(p.description);
    return dele.join(" — ");
  });
  return [
    "Edit the FIRST attached photo (the customer's own garden or room).",
    `Insert the following furniture product(s) into the photo:`,
    ...linjer,
    antalRefs > 0
      ? `The ${antalRefs} following attached image(s) are product reference photos, in the order listed above. The inserted furniture MUST look exactly like these products — do not redesign, recolor or restyle them.`
      : "No reference photos are attached; follow the product descriptions precisely.",
    "Requirements:",
    "- Keep everything else in the customer's photo unchanged (background, buildings, plants, lighting, framing).",
    "- Place the furniture on the ground plane with correct perspective and realistic scale, using cues in the photo (doors, tiles, fences) and the product dimensions.",
    "- Match the scene's lighting and add natural contact shadows.",
    "- Do not add people, text, watermarks or extra objects.",
    `- ${hint}`,
    "Return only the edited photograph.",
  ].join("\n");
}

interface GeminiPart {
  text?: string;
  inlineData?: { mimeType?: string; data?: string };
}

/** Kør ét genererings-kald. Demo-mode når apiKey mangler. */
export async function generateOne(input: GenInput): Promise<GenResultat> {
  if (!input.apiKey) return { ok: true, demo: true };

  const parts: Array<Record<string, unknown>> = [
    { text: buildPrompt(input.products, input.hintIndex, input.productRefs.length) },
    { inlineData: { mimeType: input.sceneMime, data: tilB64(input.sceneBytes) } },
    ...input.productRefs.map((r) => ({ inlineData: { mimeType: r.mime, data: tilB64(r.bytes) } })),
  ];

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${input.model}:generateContent`;
  let res: Response;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": input.apiKey,
      },
      body: JSON.stringify({
        contents: [{ role: "user", parts }],
        generationConfig: { responseModalities: ["IMAGE"] },
      }),
    });
  } catch (e) {
    return { ok: false, fejl: `Netværksfejl mod AI-tjenesten: ${e instanceof Error ? e.message : "ukendt"}` };
  }

  if (!res.ok) {
    const tekst = (await res.text()).slice(0, 300);
    return { ok: false, fejl: `AI-tjenesten svarede ${res.status}: ${tekst}` };
  }

  const data = (await res.json()) as {
    candidates?: Array<{ content?: { parts?: GeminiPart[] } }>;
  };
  const svarParts = data.candidates?.[0]?.content?.parts ?? [];
  const billede = svarParts.find((p) => p.inlineData?.data);
  if (!billede?.inlineData?.data) {
    const tekst = svarParts.map((p) => p.text ?? "").join(" ").slice(0, 200);
    return { ok: false, fejl: `AI'en returnerede intet billede${tekst ? `: ${tekst}` : ""}` };
  }

  return {
    ok: true,
    bytes: fraB64(billede.inlineData.data),
    mime: billede.inlineData.mimeType ?? "image/png",
  };
}
