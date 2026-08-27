/**
 * Prompten til produktgalleriet — ét sted, tre brugere.
 *
 * `scripts/product-images/generate.mjs` kører den i massevis fra terminalen,
 * `functions/api/gallery.ts` kører den for ét billede ad gangen, når Frederik
 * trykker på knappen i /admin/produkter, og admin-panelet bruger scenelisten
 * til at vise hvilke knapper der findes.
 *
 * Da logikken lå i scriptet alene, kunne knappen og scriptet nå at lave hver
 * sin slags billede af det samme produkt. Nu kan de ikke drive fra hinanden:
 * opskrifterne står i gallery/scenes.json, delene slås op i kataloget, og
 * begge veje går gennem byggPrompt().
 */

import scener from "../../gallery/scenes.json";
import { LADDER_FEST, type Addon, type RentalProduct, type Speaker } from "./products";

export interface GalleryScene {
  id: string;
  /** "pakker" eller "enkelt" — scenen springes over for den anden slags produkt */
  kun?: string;
  titel_da: string;
  titel_en: string;
  /** Fx "16:9" */
  ratio: string;
  /** "alle" = alle dele i pakken, "hoved" = de tre vigtigste */
  referencer: string;
  prompt: string;
  alt_da: string;
  alt_en: string;
  caption_da: string;
  caption_en: string;
}

export interface GallerySpec {
  endpoint: string;
  api_revision: string;
  model: string;
  image_size: string;
  usd_per_image: number;
  max_referencer: number;
  bredde: number;
  thumb_bredde: number;
  kvalitet: number;
  thumb_kvalitet: number;
}

export const GALLERY_SPEC = scener.spec as GallerySpec;
export const GALLERY_SCENER = scener.scener as GalleryScene[];

/** Ét fladt produkt — de tre produkttyper har hver sit feltnavn til det samme. */
export interface FladtProdukt {
  id: string;
  page?: string;
  hidden: boolean;
  navn: string;
  navn_en: string;
  /** Sti til produktfotoet, fx /images/product-festival.webp eller /api/image/<key> */
  billede: string | null;
  kapacitet: string | null;
  kapacitet_en: string | null;
  indhold: string[];
  /** Pakkens dele som produkt-id'er — null for et enkeltprodukt */
  dele: string[] | null;
  kategori: string;
}

export interface Katalog {
  speakers: Speaker[];
  addons: Addon[];
  rentalProducts: RentalProduct[];
}

export function fladtKatalog(kat: Katalog): Map<string, FladtProdukt> {
  const ud = new Map<string, FladtProdukt>();
  for (const s of kat.speakers) {
    ud.set(s.id, {
      id: s.id, page: s.page, hidden: !!s.hidden,
      navn: s.da.name, navn_en: s.en.name, billede: s.product,
      kapacitet: s.da.capacity, kapacitet_en: s.en.capacity,
      indhold: s.contents ?? [], dele: null, kategori: "lyd",
    });
  }
  for (const a of kat.addons) {
    ud.set(a.id, {
      id: a.id, page: a.page, hidden: !!a.hidden,
      navn: a.da.label, navn_en: a.en.label, billede: a.image,
      kapacitet: null, kapacitet_en: null,
      indhold: a.contents ?? [], dele: null, kategori: "lyd",
    });
  }
  for (const r of kat.rentalProducts) {
    ud.set(r.id, {
      id: r.id, page: r.page, hidden: !!r.hidden,
      navn: r.name_da, navn_en: r.name_en, billede: r.image,
      kapacitet: null, kapacitet_en: null,
      indhold: r.contents ?? [],
      dele: r.bundle?.parts?.length ? r.bundle.parts.map((d) => d.productId) : null,
      kategori: r.category,
    });
  }
  return ud;
}

/**
 * "Alt det du får" har to udgaver: pakkens dele stillet op sammen, og
 * enkeltproduktet med det, der ligger i kassen. Kun den ene giver mening.
 */
export function scenerFor(p: FladtProdukt): GalleryScene[] {
  return GALLERY_SCENER.filter((s) => {
    if (s.kun === "pakker" && !p.dele) return false;
    if (s.kun === "enkelt" && p.dele) return false;
    return true;
  });
}

export interface Reference {
  id: string;
  navn: string;
  navn_en: string;
  /** Sti på sitet — hentes af den, der kalder (fil på disk eller fetch mod origin) */
  billede: string;
}

/**
 * Hvilke produktfotos der sendes med.
 *
 * "alle" er pakkens dele — dubletter slået sammen, for Festpakke 250 lister den
 * samme højtaler to gange, og to identiske referencer lærer modellen ingenting
 * nyt. "hoved" er de tre første; en scene med seks ting i skarphed bliver et
 * katalogbillede, ikke en oplevelse.
 */
export function referencerFor(
  p: FladtProdukt,
  flad: Map<string, FladtProdukt>,
  hvilke: string,
  maks: number = GALLERY_SPEC.max_referencer,
): { billeder: Reference[]; skaaret: string[]; mangler: string[] } {
  const ider = p.dele ? [...new Set(p.dele)] : [p.id];
  const valgte = hvilke === "hoved" ? ider.slice(0, 3) : ider;
  const fundet: Reference[] = [];
  const mangler: string[] = [];
  for (const id of valgte) {
    const del = flad.get(id);
    if (del?.billede) fundet.push({ id, navn: del.navn, navn_en: del.navn_en, billede: del.billede });
    else mangler.push(id);
  }
  return { billeder: fundet.slice(0, maks), skaaret: fundet.slice(maks).map((r) => r.id), mangler };
}

function udfyld(skabelon: string, felter: Record<string, string>): string {
  return skabelon.replace(/\{(\w+)\}/g, (hel, navn) => felter[navn] ?? hel);
}

/** Delene som en engelsk opremsning — prompten er engelsk, navnene har en en-udgave. */
function engelskListe(dele: Reference[]): string {
  const navne = dele.map((d) => d.navn_en || d.navn);
  if (navne.length <= 1) return navne[0] ?? "";
  return `${navne.slice(0, -1).join(", ")} and ${navne[navne.length - 1]}`;
}

/** Gæstetallet står i pakkestigen, ikke på produktet. */
function kapacitetFor(p: FladtProdukt): [string | null, string | null] {
  if (p.kapacitet) return [p.kapacitet, p.kapacitet_en ?? p.kapacitet];
  const trin = LADDER_FEST.find((t) => t.productId === p.id);
  if (trin) return [`${trin.gaester} gæster`, `${trin.gaester.replace("op til", "up to")} guests`];
  return [null, null];
}

export interface ByggetPrompt {
  prompt: string;
  ratio: string;
  referencer: Reference[];
  /** Dele der ikke kunne komme med, fordi modellen kun holder så mange i skarphed */
  skaaret: string[];
  /** Dele uden produktfoto */
  mangler: string[];
  titel_da: string;
  titel_en: string;
  alt_da: string;
  alt_en: string;
  caption_da: string;
  caption_en: string;
}

/**
 * Prompten til ét (produkt, scene). Returnerer null, hvis der ikke er et eneste
 * produktfoto at vise modellen — så ville den digte grejet frit, og det er
 * præcis det, hele konstruktionen er bygget for at undgå.
 */
export function byggPrompt(
  p: FladtProdukt,
  scene: GalleryScene,
  flad: Map<string, FladtProdukt>,
): ByggetPrompt | null {
  const ref = referencerFor(p, flad, scene.referencer);
  if (ref.billeder.length === 0) return null;
  const hoved = referencerFor(p, flad, "hoved", 3);
  const [kap, kapEn] = kapacitetFor(p);
  const over = (scener.produkter as Record<string, { sted?: string; opstilling?: string }>)[p.id] ?? {};
  const stedNoegle = over.sted ?? (scener.standard_sted as Record<string, string>)[p.kategori] ?? "fest";
  const g = scener._gaester as Record<string, string>;

  const felter: Record<string, string> = {
    navn: p.navn,
    navn_en: p.navn_en,
    navn_lav: p.navn.charAt(0).toLowerCase() + p.navn.slice(1),
    navn_en_lav: p.navn_en.charAt(0).toLowerCase() + p.navn_en.slice(1),
    dele: engelskListe(ref.billeder),
    hoveddele: engelskListe(hoved.billeder),
    // Uden en indholdsliste ville prompten stå med "og intet andet: ." —
    // så beskriver vi i stedet kablet, der altid følger med.
    indhold: p.indhold.length ? p.indhold.join(", ") : "its own cable and nothing else",
    sted: (scener.steder as Record<string, string>)[stedNoegle],
    opstilling: over.opstilling ?? "",
    kapacitet: kap ?? "",
    kapacitet_en: kapEn ?? "",
    gaester_da: kap ? udfyld(g.med_tal_da, { kapacitet: kap }) : g.uden_tal_da,
    gaester_en: kapEn ? udfyld(g.med_tal_en, { kapacitet_en: kapEn }) : g.uden_tal_en,
  };

  return {
    prompt: [
      udfyld(scene.prompt, felter),
      scener.stil.faelles,
      scener.stil.kamera_hoejde,
      scener.stil.forbudt,
    ].join(" "),
    ratio: scene.ratio,
    referencer: ref.billeder,
    skaaret: ref.skaaret,
    mangler: ref.mangler,
    titel_da: scene.titel_da,
    titel_en: scene.titel_en,
    alt_da: udfyld(scene.alt_da, felter),
    alt_en: udfyld(scene.alt_en, felter),
    caption_da: udfyld(scene.caption_da, felter),
    caption_en: udfyld(scene.caption_en, felter),
  };
}
