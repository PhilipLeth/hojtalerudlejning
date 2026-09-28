/**
 * Fælles for billedmodel-kaldene: galleriet (/api/gallery) og
 * stemningsbillederne i hero (/api/hero). Flyttet hertil 28. sept 2026, så de
 * to ikke henter referencer og læser svaret på hver sin måde.
 */
import { billedeUrlFraHtml } from "../../../src/lib/galleryPrompt";

/**
 * Produktfotoet hentes fra sitet selv. Det dækker begge slags: de statiske
 * /images/… og de /api/image/… som admin har uploadet til R2.
 *
 * Og siden 22. september 2026 en tredje: et produkt uden eget foto bærer
 * leverandørens link fra arket (refFoto). Det er en absolut URL, og den peger
 * som regel på produktSIDEN — derfor følges den ét skridt videre til og:image,
 * så Frederik kan nøjes med at kopiere linket fra arkets kolonne.
 *
 * Leverandørens foto bliver aldrig udgivet. Det er dét, modellen ser; det vi
 * gemmer, er modellens gengivelse i husstilen.
 */
export async function hentReference(
  sti: string,
  base: URL,
  følgSide = true,
): Promise<{ mime: string; data: string } | null> {
  try {
    const url = new URL(sti, base).toString();
    const res = await fetch(url, { cf: { cacheTtl: 3600 } } as RequestInit);
    if (!res.ok) return null;
    const type = res.headers.get("Content-Type") || "";
    if (følgSide && type.includes("text/html")) {
      // En shopside, ikke et billede. Find billedet i den, og hent dét.
      const html = (await res.text()).slice(0, 200_000);
      const billedeUrl = billedeUrlFraHtml(html, url);
      return billedeUrl ? hentReference(billedeUrl, base, false) : null;
    }
    const buf = await res.arrayBuffer();
    if (buf.byteLength === 0 || buf.byteLength > 5_000_000) return null;
    let binaer = "";
    const bytes = new Uint8Array(buf);
    for (let i = 0; i < bytes.length; i += 0x8000) {
      binaer += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
    }
    return { mime: type || "image/webp", data: btoa(binaer) };
  } catch {
    return null;
  }
}

/** Billedet ligger enten i genvejen eller nede i et trin — vi leder begge steder. */
export function udtrækBillede(json: unknown): string | null {
  const genvej = (json as { output_image?: { data?: string } })?.output_image?.data;
  if (genvej) return genvej;
  const stak: unknown[] = [json];
  while (stak.length) {
    const n = stak.pop();
    if (!n || typeof n !== "object") continue;
    const d = (n as { data?: unknown }).data;
    if (typeof d === "string" && d.length > 1000) return d;
    for (const v of Object.values(n as Record<string, unknown>)) {
      if (v && typeof v === "object") stak.push(v);
    }
  }
  return null;
}
