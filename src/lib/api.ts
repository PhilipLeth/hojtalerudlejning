/** Fetch-helpers mod Pages Functions — kaster Error med dansk besked fra API'et. */

import type { Product, TenantPublic, TenantSettings, QuoteRequest, Variant } from "@shared/types";

async function parse<T>(res: Response): Promise<T> {
  let data: unknown = null;
  try {
    data = await res.json();
  } catch {
    // Ikke-JSON-svar håndteres nedenfor
  }
  if (!res.ok) {
    const besked =
      data && typeof data === "object" && "error" in data && typeof (data as { error: unknown }).error === "string"
        ? (data as { error: string }).error
        : `Serveren svarede ${res.status}`;
    throw new Error(besked);
  }
  return data as T;
}

export async function hentConfig(slug: string): Promise<{ tenant: TenantPublic; products: Product[] }> {
  return parse(await fetch(`/api/tenant/${slug}/config`));
}

export async function uploadScene(slug: string, blob: Blob): Promise<{ sceneId: string; url: string }> {
  return parse(
    await fetch(`/api/tenant/${slug}/scene`, {
      method: "POST",
      headers: { "Content-Type": blob.type || "image/jpeg" },
      body: blob,
    }),
  );
}

export async function generer(
  slug: string,
  sceneId: string,
  productIds: string[],
  hintIndex?: number,
): Promise<{ variants: Variant[]; demo?: boolean }> {
  return parse(
    await fetch(`/api/tenant/${slug}/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sceneId, productIds, ...(hintIndex !== undefined ? { hintIndex } : {}) }),
    }),
  );
}

export async function sendForespoergsel(
  slug: string,
  data: { name: string; email: string; phone: string; message?: string; productIds: string[]; imageId?: string; sceneId?: string },
): Promise<{ ok: boolean; mail: string }> {
  return parse(
    await fetch(`/api/tenant/${slug}/request`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }),
  );
}

/* ---------- Admin ---------- */

function authHeaders(token: string): Record<string, string> {
  return { Authorization: `Bearer ${token}` };
}

export async function adminLogin(slug: string, secret: string): Promise<{ token: string; tenantName: string }> {
  return parse(
    await fetch(`/api/tenant/${slug}/admin/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ secret }),
    }),
  );
}

export async function adminHentProdukter(slug: string, token: string): Promise<{ products: Product[] }> {
  return parse(await fetch(`/api/tenant/${slug}/admin/products`, { headers: authHeaders(token) }));
}

export async function adminGemProdukter(slug: string, token: string, products: Product[]): Promise<{ ok: boolean }> {
  return parse(
    await fetch(`/api/tenant/${slug}/admin/products`, {
      method: "PUT",
      headers: { ...authHeaders(token), "Content-Type": "application/json" },
      body: JSON.stringify({ products }),
    }),
  );
}

export async function adminUploadProduktbillede(slug: string, token: string, blob: Blob): Promise<{ url: string }> {
  return parse(
    await fetch(`/api/tenant/${slug}/admin/product-image`, {
      method: "POST",
      headers: { ...authHeaders(token), "Content-Type": blob.type || "image/jpeg" },
      body: blob,
    }),
  );
}

export async function adminHentIndstillinger(
  slug: string,
  token: string,
): Promise<{ settings: TenantSettings; usedThisMonth: number; aiActive: boolean }> {
  return parse(await fetch(`/api/tenant/${slug}/admin/settings`, { headers: authHeaders(token) }));
}

export async function adminGemIndstillinger(
  slug: string,
  token: string,
  data: Record<string, unknown>,
): Promise<{ ok: boolean; settings: TenantSettings }> {
  return parse(
    await fetch(`/api/tenant/${slug}/admin/settings`, {
      method: "PUT",
      headers: { ...authHeaders(token), "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }),
  );
}

export async function adminHentForespoergsler(slug: string, token: string): Promise<{ requests: QuoteRequest[] }> {
  return parse(await fetch(`/api/tenant/${slug}/admin/requests`, { headers: authHeaders(token) }));
}

export async function adminSaetStatus(
  slug: string,
  token: string,
  id: string,
  status: "ny" | "besvaret",
): Promise<{ ok: boolean }> {
  return parse(
    await fetch(`/api/tenant/${slug}/admin/requests`, {
      method: "PUT",
      headers: { ...authHeaders(token), "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    }),
  );
}
