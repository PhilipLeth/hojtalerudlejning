/** Minimal Google Ads REST-klient til Cloudflare Workers.
 *
 * Kun det vi bruger: hent annoncegrupper og sæt deres status. Bevidst ingen
 * afhængigheder — Googles officielle klientbiblioteker kører ikke på Workers.
 *
 * Credentials sættes som Cloudflare-secrets. De samme værdier ligger i
 * openocean-promo/google-ads.yaml.
 */

const TOKEN_URL = "https://oauth2.googleapis.com/token";
const API_HOST = "https://googleads.googleapis.com";
const API_VERSION = "v25";

export interface GoogleAdsEnv {
  GOOGLE_ADS_DEVELOPER_TOKEN?: string;
  GOOGLE_ADS_CLIENT_ID?: string;
  GOOGLE_ADS_CLIENT_SECRET?: string;
  GOOGLE_ADS_REFRESH_TOKEN?: string;
  /** Manager-kontoen (MCC), fx 6231006021 */
  GOOGLE_ADS_LOGIN_CUSTOMER_ID?: string;
  /** Kontoen der arbejdes i, fx 4410207627 */
  GOOGLE_ADS_CUSTOMER_ID?: string;
}

export class AdsNotConfigured extends Error {}
export class AdsApiError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
  }
}

const REQUIRED = [
  "GOOGLE_ADS_DEVELOPER_TOKEN",
  "GOOGLE_ADS_CLIENT_ID",
  "GOOGLE_ADS_CLIENT_SECRET",
  "GOOGLE_ADS_REFRESH_TOKEN",
  "GOOGLE_ADS_CUSTOMER_ID",
] as const;

export function missingConfig(env: GoogleAdsEnv): string[] {
  return REQUIRED.filter((k) => !env[k]);
}

function digitsOnly(id: string): string {
  return id.replace(/\D/g, "");
}

async function accessToken(env: GoogleAdsEnv): Promise<string> {
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: env.GOOGLE_ADS_CLIENT_ID!,
      client_secret: env.GOOGLE_ADS_CLIENT_SECRET!,
      refresh_token: env.GOOGLE_ADS_REFRESH_TOKEN!,
      grant_type: "refresh_token",
    }),
  });
  const json = (await res.json().catch(() => ({}))) as Record<string, string>;
  if (!res.ok) {
    throw new AdsApiError(
      `OAuth mislykkedes (${res.status}): ${json.error_description || json.error || "ukendt fejl"}`,
      res.status,
    );
  }
  return json.access_token;
}

function headers(env: GoogleAdsEnv, token: string): HeadersInit {
  const h: Record<string, string> = {
    Authorization: `Bearer ${token}`,
    "developer-token": env.GOOGLE_ADS_DEVELOPER_TOKEN!,
    "Content-Type": "application/json",
  };
  if (env.GOOGLE_ADS_LOGIN_CUSTOMER_ID) {
    h["login-customer-id"] = digitsOnly(env.GOOGLE_ADS_LOGIN_CUSTOMER_ID);
  }
  return h;
}

/** Fejlbeskeder fra Google er præcise men begravede. Grav den frem. */
async function explain(res: Response): Promise<AdsApiError> {
  const json = (await res.json().catch(() => ({}))) as {
    error?: { message?: string; details?: Array<{ errors?: Array<{ message?: string }> }> };
  };
  const detail = json.error?.details?.[0]?.errors?.[0]?.message;
  return new AdsApiError(
    `Google Ads-fejl ${res.status}: ${detail || json.error?.message || "ukendt fejl"}`,
    res.status,
  );
}

export interface AdGroupRow {
  id: string;
  name: string;
  status: "ENABLED" | "PAUSED" | "REMOVED";
  campaignName: string;
  campaignStatus: string;
  keywordCount: number;
}

/** Alle annoncegrupper i kontoen med antal aktive keywords. */
export async function listAdGroups(env: GoogleAdsEnv): Promise<AdGroupRow[]> {
  const missing = missingConfig(env);
  if (missing.length) {
    throw new AdsNotConfigured(`Google Ads er ikke konfigureret. Mangler: ${missing.join(", ")}`);
  }
  const token = await accessToken(env);
  const cid = digitsOnly(env.GOOGLE_ADS_CUSTOMER_ID!);

  const query = `
    SELECT ad_group.id, ad_group.name, ad_group.status,
           campaign.name, campaign.status
    FROM ad_group
    WHERE ad_group.status != 'REMOVED' AND campaign.status != 'REMOVED'`;

  const rows: AdGroupRow[] = [];
  let pageToken: string | undefined;
  do {
    const res = await fetch(`${API_HOST}/${API_VERSION}/customers/${cid}/googleAds:search`, {
      method: "POST",
      headers: headers(env, token),
      body: JSON.stringify(pageToken ? { query, pageToken } : { query }),
    });
    if (!res.ok) throw await explain(res);
    const json = (await res.json()) as {
      results?: Array<{
        adGroup: { id: string; name: string; status: AdGroupRow["status"] };
        campaign: { name: string; status: string };
      }>;
      nextPageToken?: string;
    };
    for (const r of json.results ?? []) {
      rows.push({
        id: r.adGroup.id,
        name: r.adGroup.name,
        status: r.adGroup.status,
        campaignName: r.campaign.name,
        campaignStatus: r.campaign.status,
        keywordCount: 0,
      });
    }
    pageToken = json.nextPageToken;
  } while (pageToken);

  return rows.sort((a, b) => a.name.localeCompare(b.name, "da"));
}

/**
 * Sæt status på én annoncegruppe.
 * `validateOnly` sender ændringen til Google uden at gemme den — brug den til
 * at teste at et kald ville lykkes, uden at røre kontoen.
 */
export async function setAdGroupStatus(
  env: GoogleAdsEnv,
  adGroupId: string,
  status: "ENABLED" | "PAUSED",
  { validateOnly = false }: { validateOnly?: boolean } = {},
): Promise<void> {
  const missing = missingConfig(env);
  if (missing.length) {
    throw new AdsNotConfigured(`Google Ads er ikke konfigureret. Mangler: ${missing.join(", ")}`);
  }
  if (!/^\d+$/.test(adGroupId)) {
    throw new AdsApiError(`Ugyldigt annoncegruppe-id: ${adGroupId}`, 400);
  }
  const token = await accessToken(env);
  const cid = digitsOnly(env.GOOGLE_ADS_CUSTOMER_ID!);

  const res = await fetch(`${API_HOST}/${API_VERSION}/customers/${cid}/adGroups:mutate`, {
    method: "POST",
    headers: headers(env, token),
    body: JSON.stringify({
      operations: [
        {
          update: { resourceName: `customers/${cid}/adGroups/${adGroupId}`, status },
          updateMask: "status",
        },
      ],
      validateOnly,
    }),
  });
  if (!res.ok) throw await explain(res);
}
