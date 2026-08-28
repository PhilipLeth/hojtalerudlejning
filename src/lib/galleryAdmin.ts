"use client";

/**
 * Kaldene bag galleriknapperne — ét sted for både produktkortet i
 * /admin/produkter og listen i /admin/galleri.
 *
 * Alle tre handlinger går gennem /api/gallery. Ingen af dem gør et billede
 * synligt for kunder undtagen `udgiv`, og den kaldes kun, når nogen har
 * trykket på knappen.
 */

import { getAdminToken } from "@/lib/useAdminAuth";
import { compressImage, formatBytes, MAX_UPLOAD_BYTES } from "@/lib/compressImage";

export interface GalleryEntry {
  src: string;
  thumb: string;
  scene: string;
  ratio: string;
  titel_da: string;
  titel_en?: string;
  alt_da: string;
  alt_en?: string;
  caption_da: string;
  caption_en?: string;
  updatedBy?: string;
  updatedAt?: string;
  /** Gravsten: scenen er fjernet, også selvom billedet ligger som fil i repoet */
  fjernet?: boolean;
}

export interface Forslag {
  billede: string;
  mime: string;
  /** Den kommentar der blev sendt med — vises tilbage, så man kan se hvad man bad om */
  note?: string;
  titel_da: string;
  alt_da: string;
  caption_da: string;
  skaaret: string[];
  mangler: string[];
  forbrugt?: number;
  loft?: number;
}

async function kald(body: Record<string, unknown>) {
  const secret = getAdminToken();
  const res = await fetch(`/api/gallery?secret=${encodeURIComponent(secret)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? `Fejl ${res.status}`);
  return data;
}

/**
 * Hele manifestet — hvad admin har godkendt, pr. produkt.
 *
 * Svaret deles mellem alle kaldere. /admin/produkter har et galleri-felt på
 * hvert af de 45 produktkort, og uden det her ville en sideindlæsning sende 45
 * ens forespørgsler af sted. Kaldene efter en ændring nulstiller den, så
 * kortene ikke står med et forældet manifest.
 */
let manifestCache: Promise<Record<string, GalleryEntry[]>> | null = null;

export function hentManifest(paanyt = false): Promise<Record<string, GalleryEntry[]>> {
  if (!manifestCache || paanyt) {
    manifestCache = (async () => {
      try {
        const res = await fetch("/api/gallery");
        if (!res.ok) return {};
        return (await res.json()) as Record<string, GalleryEntry[]>;
      } catch {
        return {};
      }
    })();
  }
  return manifestCache;
}

/**
 * Laver et forslag. Det gemmes ingen steder — det lever i browseren.
 *
 * `note` er fritekst fra den, der trykker: "det samme uden stativer",
 * "tættere på". Den vinder over scenens beskrivelse, men ikke over reglen om,
 * at grejet skal være vores eget.
 */
export async function generer(productId: string, scene: string, note?: string): Promise<Forslag> {
  const data = await kald({ action: "generate", productId, scene, note: note?.trim() || undefined });
  return {
    billede: data.image,
    mime: data.mime ?? "image/jpeg",
    note: data.note ?? undefined,
    titel_da: data.titel_da,
    alt_da: data.alt_da,
    caption_da: data.caption_da,
    skaaret: data.skaaret ?? [],
    mangler: data.mangler ?? [],
    forbrugt: data.forbrugt,
    loft: data.loft,
  };
}

/**
 * Godkender et forslag: komprimér i browseren, upload til R2, skriv i
 * manifestet. Først her bliver billedet synligt på produktsiden.
 */
export async function udgivForslag(
  productId: string,
  scene: string,
  forslag: Forslag,
): Promise<{ billeder: GalleryEntry[]; bytes: number }> {
  const binaer = atob(forslag.billede);
  const bytes = new Uint8Array(binaer.length);
  for (let i = 0; i < binaer.length; i++) bytes[i] = binaer.charCodeAt(i);
  const raa = new File([bytes], `${productId}-${scene}.jpg`, { type: forslag.mime });

  const { file, bytes: stoerrelse } = await compressImage(raa);
  if (stoerrelse > MAX_UPLOAD_BYTES) {
    throw new Error(
      `Billedet fylder ${formatBytes(stoerrelse)} efter komprimering — max ${formatBytes(MAX_UPLOAD_BYTES)}.`,
    );
  }

  const secret = getAdminToken();
  const up = await fetch(`/api/upload?secret=${encodeURIComponent(secret)}`, {
    method: "POST",
    headers: { "Content-Type": file.type || "image/webp" },
    body: file,
  });
  const updata = await up.json();
  if (!up.ok) throw new Error(updata.error ?? "Upload fejlede");

  const data = await kald({ action: "publish", productId, scene, url: updata.url });
  manifestCache = null;
  return { billeder: data.billeder ?? [], bytes: stoerrelse };
}

/**
 * Godkender et billede, der allerede ligger som fil — de 77 fra
 * bulk-kørslen. Der genereres ikke noget nyt, og det koster ingenting:
 * billedet flytter bare fra "ikke gennemgået" til "godkendt".
 */
export async function godkendEksisterende(
  productId: string,
  scene: string,
  url: string,
): Promise<GalleryEntry[]> {
  const data = await kald({ action: "publish", productId, scene, url });
  manifestCache = null;
  return data.billeder ?? [];
}

/**
 * Uploader et forslag til R2 og giver URL'en tilbage — uden at røre galleriet.
 *
 * Bruges af produktfotoet, som hører til i produktets image-felt og gemmes
 * sammen med resten af kataloget, når der trykkes "Gem ændringer".
 */
export async function uploadForslag(productId: string, scene: string, forslag: Forslag): Promise<string> {
  const binaer = atob(forslag.billede);
  const bytes = new Uint8Array(binaer.length);
  for (let i = 0; i < binaer.length; i++) bytes[i] = binaer.charCodeAt(i);
  const raa = new File([bytes], `${productId}-${scene}.jpg`, { type: forslag.mime });

  const { file, bytes: stoerrelse } = await compressImage(raa);
  if (stoerrelse > MAX_UPLOAD_BYTES) {
    throw new Error(
      `Billedet fylder ${formatBytes(stoerrelse)} efter komprimering — max ${formatBytes(MAX_UPLOAD_BYTES)}.`,
    );
  }

  const secret = getAdminToken();
  const up = await fetch(`/api/upload?secret=${encodeURIComponent(secret)}`, {
    method: "POST",
    headers: { "Content-Type": file.type || "image/webp" },
    body: file,
  });
  const data = await up.json();
  if (!up.ok) throw new Error(data.error ?? "Upload fejlede");
  return data.url as string;
}

/** Fjerner et godkendt billede fra manifestet igen. */
export async function fjern(productId: string, scene: string): Promise<GalleryEntry[]> {
  const data = await kald({ action: "remove", productId, scene });
  manifestCache = null;
  return data.billeder ?? [];
}
