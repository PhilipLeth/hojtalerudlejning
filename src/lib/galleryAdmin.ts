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
  /** Vises for kunderne — intet vises, før det er slået til */
  aktiv?: boolean;
  /** Gravsten fra før toggle'n; læses som inaktiv */
  fjernet?: boolean;
  /** Billedteksten er rettet i hånden — skabelonen skriver den ikke over ved "Lav om" */
  egenTekst?: boolean;
}

export interface Forslag {
  billede: string;
  mime: string;
  /** Den kommentar der blev sendt med — vises tilbage, så man kan se hvad man bad om */
  note?: string;
  /** Lavet ud fra det forrige billede — ikke fra bunden */
  forrige?: boolean;
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
/** Det billede der rettes: en sti på sitet, eller et forslag der kun findes i browseren */
export type Forrige = { url: string } | { billede: string; mime: string };

export async function generer(
  productId: string,
  scene: string,
  note?: string,
  forrige?: Forrige,
): Promise<Forslag> {
  const ren = note?.trim() || undefined;
  // Med `forrige` rettes det billede, man kigger på; uden er det en ny optagelse
  const data = await kald({ action: "generate", productId, scene, note: ren, forrige });
  return {
    billede: data.image,
    mime: data.mime ?? "image/jpeg",
    note: data.note ?? undefined,
    forrige: data.forrige === true,
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
 * Retter billedteksten under et billede — dansk og engelsk.
 *
 * Skabelonen i gallery/scenes.json rammer ikke altid: "det der ligger i
 * kassen" passer dårligt på en enkelt højtaler. Tomme felter sætter
 * skabelonens tekst tilbage. Ligger billedet kun som fil fra bulk-kørslen,
 * får det sin post i manifestet her og tæller som gennemgået.
 */
export async function gemTekst(
  productId: string,
  scene: string,
  caption_da: string,
  caption_en: string,
): Promise<GalleryEntry[]> {
  const data = await kald({ action: "tekst", productId, scene, caption_da, caption_en });
  manifestCache = null;
  return data.billeder ?? [];
}

/**
 * Slår et billede til eller fra for kunderne.
 *
 * Det koster ingenting og laver intet nyt. Et billede fra bulk-kørslen får
 * sin post i manifestet, første gang det slås til; et der slås fra bliver
 * stående inaktivt, så det kan slås til igen.
 */
export async function saetAktiv(productId: string, scene: string, aktiv: boolean): Promise<GalleryEntry[]> {
  const data = await kald({ action: "aktiv", productId, scene, aktiv });
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

