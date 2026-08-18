/** Fælles typer for klient (src/) og Pages Functions (functions/). */

/** Det klienten må se om en tenant. */
export interface TenantPublic {
  slug: string;
  name: string;
  brandColor: string;
  welcomeText: string;
  logoUrl?: string;
  variantsPerGeneration: number;
  maxProductsPerScene: number;
}

/** Det tenant-admin må se og redigere. */
export interface TenantSettings extends TenantPublic {
  notifyEmail: string;
  monthlyGenerationLimit: number;
  aiModel?: string;
}

/** Fuld record i KV — indeholder auth-felter og må ALDRIG sendes til klienten. */
export interface TenantRecord extends TenantSettings {
  adminSalt: string;
  adminHash: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Product {
  id: string;
  name: string;
  /** Bruges også i AI-prompten — beskriv materiale, stil og farve. */
  description: string;
  /** Fx "120×80×75 cm" — hjælper AI'en med korrekt skala. */
  dimensions?: string;
  /** Kun visning, fx "fra 4.500 kr." — ingen beregninger på klientpriser. */
  priceText?: string;
  /** URL-stier: statiske assets eller /media/… (R2). Første er primær. */
  images: string[];
  active: boolean;
}

/** Et genereret billede. */
export interface Variant {
  id: string;
  url: string;
  /** true når GEMINI_API_KEY mangler og scenen returneres uændret. */
  demo?: boolean;
  /** Opstillings-hintet varianten blev genereret med (index i ARRANGEMENT_HINTS). */
  hintIndex?: number;
}

export interface QuoteRequest {
  id: string;
  createdAt: string;
  name: string;
  email: string;
  phone: string;
  message?: string;
  productIds: string[];
  productNames: string[];
  sceneUrl?: string;
  imageUrl?: string;
  status: "ny" | "besvaret";
}
