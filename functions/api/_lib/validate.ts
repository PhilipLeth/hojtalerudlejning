/** Inputvalidering — serveren stoler aldrig på klienten. */

import type { Product } from "../../../shared/types";

export function validSlug(s: unknown): s is string {
  return typeof s === "string" && /^[a-z0-9][a-z0-9-]{1,30}$/.test(s);
}

export function validEmail(s: unknown): s is string {
  return typeof s === "string" && s.length <= 200 && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(s);
}

export function validPhone(s: unknown): s is string {
  return typeof s === "string" && /^[+\d][\d\s]{5,19}$/.test(s.trim());
}

/** Media-id som scene.ts/generate.ts udsteder: <randomId>.<ext> */
export function validMediaId(s: unknown): s is string {
  return typeof s === "string" && /^[a-z0-9]{8,32}\.(jpg|jpeg|png|webp)$/.test(s);
}

export function trimTo(s: unknown, max: number): string {
  return typeof s === "string" ? s.trim().slice(0, max) : "";
}

/** Hex-farve som #rgb eller #rrggbb. */
export function validHexColor(s: unknown): s is string {
  return typeof s === "string" && /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(s);
}

/** Returnerer fejltekst hvis produktet er ugyldigt, ellers null. */
export function badProduct(p: unknown): string | null {
  if (typeof p !== "object" || p === null) return "Produkt er ikke et objekt";
  const prod = p as Partial<Product>;
  if (typeof prod.id !== "string" || !/^[a-z0-9][a-z0-9-]{0,40}$/.test(prod.id)) {
    return "Ugyldigt produkt-id (små bogstaver, tal og bindestreg)";
  }
  if (typeof prod.name !== "string" || !prod.name.trim() || prod.name.length > 100) {
    return `Produkt "${prod.id}": navn mangler eller er for langt`;
  }
  if (typeof prod.description !== "string" || prod.description.length > 1000) {
    return `Produkt "${prod.id}": beskrivelse mangler eller er for lang`;
  }
  if (!Array.isArray(prod.images) || prod.images.length > 6 || prod.images.some((u) => typeof u !== "string" || u.length > 300 || !u.startsWith("/"))) {
    return `Produkt "${prod.id}": billeder skal være relative stier (maks 6)`;
  }
  if (typeof prod.active !== "boolean") return `Produkt "${prod.id}": active mangler`;
  return null;
}

/** Tilladte upload-typer og deres filendelser. */
export const BILLEDTYPER: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;
