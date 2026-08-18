/**
 * Tenants og produkter i KV — plus demo-tenanten, der bootstrapper sig selv
 * med franske havemøbler første gang den rammes.
 */

import type { Product, TenantPublic, TenantRecord, TenantSettings } from "../../../shared/types";
import { randomSalt } from "./auth";

export const DEFAULTS = {
  brandColor: "#2f6b46",
  welcomeText: "Se vores møbler i din egen have — tag et billede og prøv.",
  variantsPerGeneration: 3,
  maxProductsPerScene: 4,
  monthlyGenerationLimit: 300,
};

export async function getTenant(kv: KVNamespace, slug: string): Promise<TenantRecord | null> {
  const raw = await kv.get(`tenant:${slug}`);
  if (raw) {
    try {
      return JSON.parse(raw) as TenantRecord;
    } catch {
      return null;
    }
  }
  if (slug === "demo") return bootstrapDemo(kv);
  return null;
}

export async function saveTenant(kv: KVNamespace, t: TenantRecord): Promise<void> {
  await kv.put(`tenant:${t.slug}`, JSON.stringify({ ...t, updatedAt: new Date().toISOString() }));
}

export async function getProducts(kv: KVNamespace, slug: string): Promise<Product[]> {
  const raw = await kv.get(`products:${slug}`);
  if (!raw) return [];
  try {
    const list = JSON.parse(raw) as Product[];
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

export async function saveProducts(kv: KVNamespace, slug: string, list: Product[]): Promise<void> {
  await kv.put(`products:${slug}`, JSON.stringify(list));
}

/** Skræl auth- og driftfelter af før data sendes til slutkunden. */
export function toPublic(t: TenantRecord): TenantPublic {
  return {
    slug: t.slug,
    name: t.name,
    brandColor: t.brandColor,
    welcomeText: t.welcomeText,
    logoUrl: t.logoUrl,
    variantsPerGeneration: t.variantsPerGeneration,
    maxProductsPerScene: t.maxProductsPerScene,
  };
}

/** Til tenant-admin — alt undtagen auth-felter. */
export function toSettings(t: TenantRecord): TenantSettings {
  const { adminSalt: _s, adminHash: _h, createdAt: _c, updatedAt: _u, ...rest } = t;
  return rest;
}

/** Regs univers: franske havemøbler som pladsholdere til demoen. */
export const DEMO_PRODUCTS: Product[] = [
  {
    id: "cafesaet-provence",
    name: "Cafésæt Provence",
    description: "Klassisk fransk bistrosæt i mørkegrønt smedejern: rundt bord (Ø60 cm) og to stole med buede rygge og filigran-mønster.",
    dimensions: "Bord Ø60×72 cm, stole 42×45×88 cm",
    priceText: "fra 6.900 kr.",
    images: ["/demo/cafesaet.svg"],
    active: true,
  },
  {
    id: "bistrostol-camille",
    name: "Bistrostol Camille",
    description: "Sammenklappelig fransk bistrostol i støvet blåt metal med lameller i lyst egetræ på sæde og ryg.",
    dimensions: "42×48×86 cm",
    priceText: "fra 1.450 kr.",
    images: ["/demo/bistrostol.svg"],
    active: true,
  },
  {
    id: "loungesofa-toulouse",
    name: "Loungesofa Toulouse",
    description: "To-personers havesofa med ramme i pulverlakeret antracit stål og dybe hynder i råhvid, vejrbestandig hør.",
    dimensions: "160×80×70 cm",
    priceText: "fra 12.800 kr.",
    images: ["/demo/loungesofa.svg"],
    active: true,
  },
  {
    id: "spisebord-bordeaux",
    name: "Spisebord Bordeaux",
    description: "Langbord til seks personer i massiv, ubehandlet teak med kraftige vanger — patinerer smukt gråt udendørs.",
    dimensions: "200×95×74 cm",
    priceText: "fra 18.500 kr.",
    images: ["/demo/spisebord.svg"],
    active: true,
  },
  {
    id: "baenk-marais",
    name: "Bænk Marais",
    description: "Parkbænk i sortgrønt smedejern med tremmesæde i olieret fransk kastanje og svungne armlæn.",
    dimensions: "150×60×85 cm",
    priceText: "fra 7.200 kr.",
    images: ["/demo/baenk.svg"],
    active: true,
  },
  {
    id: "parasol-riviera",
    name: "Parasol Riviera",
    description: "Håndsyet markise-parasol i cremefarvet canvas med frynsekant og stang i lakeret ask.",
    dimensions: "Ø270×250 cm",
    priceText: "fra 4.300 kr.",
    images: ["/demo/parasol.svg"],
    active: true,
  },
];

/**
 * Opret demo-tenanten ved første besøg. Adgangskoden er bevidst umulig
 * (tilfældig hash uden kendt klartekst) — admin på demoen sker kun via
 * PLATFORM_SECRET.
 */
async function bootstrapDemo(kv: KVNamespace): Promise<TenantRecord> {
  const nu = new Date().toISOString();
  const tenant: TenantRecord = {
    slug: "demo",
    name: "Maison Reg (demo)",
    brandColor: DEFAULTS.brandColor,
    welcomeText: "Se vores franske havemøbler i din egen have — tag et billede og prøv.",
    variantsPerGeneration: DEFAULTS.variantsPerGeneration,
    maxProductsPerScene: DEFAULTS.maxProductsPerScene,
    monthlyGenerationLimit: DEFAULTS.monthlyGenerationLimit,
    notifyEmail: "",
    adminSalt: randomSalt(),
    adminHash: `laast-${crypto.randomUUID()}`,
    createdAt: nu,
  };
  await kv.put(`tenant:demo`, JSON.stringify(tenant));
  await saveProducts(kv, "demo", DEMO_PRODUCTS);
  const rawIndex = await kv.get("tenants_index");
  const index: string[] = rawIndex ? JSON.parse(rawIndex) : [];
  if (!index.includes("demo")) await kv.put("tenants_index", JSON.stringify([...index, "demo"]));
  return tenant;
}
