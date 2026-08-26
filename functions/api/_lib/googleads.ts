/** Minimal Google Ads REST-klient til Cloudflare Workers.
 *
 * Kun det vi bruger: læs grupper og keywords, slå søgevolumen op, sæt status,
 * og opret nye temagrupper. Bevidst ingen afhængigheder — Googles officielle
 * klientbiblioteker kører ikke på Workers.
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

/**
 * Adgangstokens holder en time hos Google.
 *
 * Uden den her cache henter hvert eneste kald sit eget token — og en
 * oprettelse af fem annoncegrupper er godt et dusin kald. Cachen lever i
 * isolatet, så den forsvinder af sig selv; marginen på et minut dækker et
 * kald, der starter lige før udløb.
 */
let cachedToken: { value: string; expires: number; key: string } | null = null;
const TOKEN_MARGIN_MS = 60_000;

async function accessToken(env: GoogleAdsEnv): Promise<string> {
  const key = `${env.GOOGLE_ADS_CLIENT_ID}:${env.GOOGLE_ADS_REFRESH_TOKEN}`;
  const now = Date.now();
  if (cachedToken && cachedToken.key === key && cachedToken.expires > now) {
    return cachedToken.value;
  }
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
  const ttl = Number(json.expires_in) * 1000;
  cachedToken = {
    value: json.access_token,
    key,
    expires: now + (Number.isFinite(ttl) && ttl > TOKEN_MARGIN_MS ? ttl - TOKEN_MARGIN_MS : 0),
  };
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


/* ───── Forbrug ───── */

export interface CampaignSpend {
  id: string;
  name: string;
  status: string;
  cost: number;
  clicks: number;
  impressions: number;
  conversions: number;
}

export interface SpendReport {
  from: string;
  to: string;
  currency: string;
  cost: number;
  clicks: number;
  impressions: number;
  conversions: number;
  campaigns: CampaignSpend[];
}

/** Google regner i mikroenheder — 1.000.000 mikro = 1 kr. */
export function microsToMajor(micros: number | string | undefined): number {
  const n = Number(micros);
  return Number.isFinite(n) ? Math.round((n / 1_000_000) * 100) / 100 : 0;
}

/**
 * Forbrug pr. kampagne i en periode. Bruges af regnskabet til at holde
 * annonceudgiften op mod omsætningen.
 */
export async function campaignSpend(env: GoogleAdsEnv, from: string, to: string): Promise<SpendReport> {
  const missing = missingConfig(env);
  if (missing.length) {
    throw new AdsNotConfigured(`Google Ads er ikke konfigureret. Mangler: ${missing.join(", ")}`);
  }
  const token = await accessToken(env);
  const cid = digitsOnly(env.GOOGLE_ADS_CUSTOMER_ID!);

  // Datoerne er allerede valideret som YYYY-MM-DD af kalderen
  const query = `
    SELECT campaign.id, campaign.name, campaign.status,
           customer.currency_code,
           metrics.cost_micros, metrics.clicks, metrics.impressions, metrics.conversions
    FROM campaign
    WHERE segments.date BETWEEN '${from}' AND '${to}'`;

  const campaigns = new Map<string, CampaignSpend>();
  let currency = "DKK";
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
        campaign: { id: string; name: string; status: string };
        customer?: { currencyCode?: string };
        metrics?: { costMicros?: string; clicks?: string; impressions?: string; conversions?: number };
      }>;
      nextPageToken?: string;
    };

    for (const r of json.results ?? []) {
      if (r.customer?.currencyCode) currency = r.customer.currencyCode;
      const id = r.campaign.id;
      // Én række pr. dag pr. kampagne — læg dem sammen
      const row = campaigns.get(id) ?? {
        id,
        name: r.campaign.name,
        status: r.campaign.status,
        cost: 0,
        clicks: 0,
        impressions: 0,
        conversions: 0,
      };
      row.cost += microsToMajor(r.metrics?.costMicros);
      row.clicks += Number(r.metrics?.clicks) || 0;
      row.impressions += Number(r.metrics?.impressions) || 0;
      row.conversions += Number(r.metrics?.conversions) || 0;
      campaigns.set(id, row);
    }
    pageToken = json.nextPageToken;
  } while (pageToken);

  const list = [...campaigns.values()]
    .map((c) => ({ ...c, cost: Math.round(c.cost * 100) / 100 }))
    .sort((a, b) => b.cost - a.cost);

  return {
    from,
    to,
    currency,
    cost: Math.round(list.reduce((s, c) => s + c.cost, 0) * 100) / 100,
    clicks: list.reduce((s, c) => s + c.clicks, 0),
    impressions: list.reduce((s, c) => s + c.impressions, 0),
    conversions: Math.round(list.reduce((s, c) => s + c.conversions, 0) * 100) / 100,
    campaigns: list,
  };
}


/* ───── Skrivevej: opret en temagruppe ─────
 *
 * Én annoncegruppe, dens keywords og dens annonce hører sammen. Bliver
 * gruppen oprettet og annoncen ikke, står der en tom gruppe i kontoen som
 * ingen opdager. Derfor sendes alle tre i ét `googleAds:mutate` med
 * midlertidige resource-navne (negative id'er) — Google udfører den slags
 * atomart, så enten kommer hele gruppen op, eller ingenting.
 *
 * Opskriften er den samme som ads-export/launch_bofu_lys.py allerede har
 * kørt mod denne konto; her er den bare oversat til REST, fordi Workers ikke
 * kan køre Googles python-bibliotek.
 */

/** Kontoens søgekampagne. Nye annoncer er grupper heri, ikke nye kampagner. */
export const SEARCH_CAMPAIGN_ID = "23973439325";

/** Label på keywords med købsintention, så de kan måles for sig. */
export const BOFU_LABEL = "BOFU — købsintention";

/**
 * Negativer hver ny gruppe får med.
 *
 * Phrase match på "lej røgmaskine" fanger også "lej røgmaskine brugt". De
 * fire ord her er dem, kontoens eksisterende grupper allerede står med, og de
 * dækker forskellen mellem en der vil leje og en der vil købe eller sælge.
 */
export const GROUP_NEGATIVES = ["køb", "sælg", "brugt", "reparation"];

export interface NewKeyword {
  text: string;
  matchType: "PHRASE" | "EXACT" | "BROAD";
}

export interface NewAdGroup {
  name: string;
  cpcBidMicros: number;
  status: "ENABLED" | "PAUSED";
  keywords: NewKeyword[];
  finalUrl: string;
  headlines: string[];
  descriptions: string[];
  path1?: string;
  /** Sæt til false for en gruppe hvor negativerne ikke giver mening. */
  negatives?: string[];
}

export interface CreatedAdGroup {
  adGroupId: string;
  adGroupResourceName: string;
  criterionResourceNames: string[];
  adResourceName: string | null;
}

function requireConfig(env: GoogleAdsEnv): void {
  const missing = missingConfig(env);
  if (missing.length) {
    throw new AdsNotConfigured(`Google Ads er ikke konfigureret. Mangler: ${missing.join(", ")}`);
  }
}

async function search<T>(env: GoogleAdsEnv, token: string, cid: string, query: string): Promise<T[]> {
  const rows: T[] = [];
  let pageToken: string | undefined;
  do {
    const res = await fetch(`${API_HOST}/${API_VERSION}/customers/${cid}/googleAds:search`, {
      method: "POST",
      headers: headers(env, token),
      body: JSON.stringify(pageToken ? { query, pageToken } : { query }),
    });
    if (!res.ok) throw await explain(res);
    const json = (await res.json()) as { results?: T[]; nextPageToken?: string };
    rows.push(...(json.results ?? []));
    pageToken = json.nextPageToken;
  } while (pageToken);
  return rows;
}

export interface ExistingKeyword {
  text: string;
  matchType: string;
  adGroupId: string;
  adGroupName: string;
  campaignName: string;
  adGroupStatus: string;
}

/**
 * Alle positive keywords i kontoen.
 *
 * Bruges til at fange, at en foreslået frase allerede ligger i en anden
 * gruppe. Det er ikke en formalitet: "leje af soundbox" ligger i dag både i
 * AG 1 og AG 4, og de to grupper byder mod hinanden på den samme søgning.
 */
export async function listKeywords(env: GoogleAdsEnv): Promise<ExistingKeyword[]> {
  requireConfig(env);
  const token = await accessToken(env);
  const cid = digitsOnly(env.GOOGLE_ADS_CUSTOMER_ID!);

  const rows = await search<{
    adGroup: { id: string; name: string; status: string };
    campaign: { name: string };
    adGroupCriterion: { keyword: { text: string; matchType: string }; negative?: boolean };
  }>(
    env,
    token,
    cid,
    `SELECT ad_group.id, ad_group.name, ad_group.status, campaign.name,
            ad_group_criterion.keyword.text, ad_group_criterion.keyword.match_type,
            ad_group_criterion.negative
     FROM ad_group_criterion
     WHERE ad_group_criterion.type = 'KEYWORD'
       AND ad_group_criterion.status != 'REMOVED'
       AND ad_group.status != 'REMOVED'
       AND campaign.status != 'REMOVED'`,
  );

  return rows
    .filter((r) => r.adGroupCriterion.negative !== true)
    .map((r) => ({
      text: r.adGroupCriterion.keyword.text.toLowerCase(),
      matchType: r.adGroupCriterion.keyword.matchType,
      adGroupId: r.adGroup.id,
      adGroupName: r.adGroup.name,
      adGroupStatus: r.adGroup.status,
      campaignName: r.campaign.name,
    }));
}

/* ───── Søgevolumen ───── */

/** Dansk og Danmark — kontoens sprog og land. */
const LANGUAGE_DA = "languageConstants/1009";
const GEO_DENMARK = "geoTargetConstants/2208";
/** Googles loft for frø-keywords i ét kald. */
const IDEA_BATCH = 20;

/**
 * Gennemsnitlige månedlige søgninger pr. frase.
 *
 * Uden det her tal genererer værktøjet præcis de tomme annoncegrupper,
 * kontoen har for mange af i forvejen: produktnavne er ikke søgefraser, og en
 * gruppe på en frase ingen søger på koster tid at vedligeholde og giver
 * ingenting. Fraser Google ikke kender igen, får `null` — det er ikke det
 * samme som nul søgninger.
 */
export async function keywordVolume(
  env: GoogleAdsEnv,
  texts: string[],
  { language = LANGUAGE_DA }: { language?: string } = {},
): Promise<Record<string, number | null>> {
  requireConfig(env);
  if (!texts.length) return {};
  const token = await accessToken(env);
  const cid = digitsOnly(env.GOOGLE_ADS_CUSTOMER_ID!);

  const out: Record<string, number | null> = {};
  for (const text of texts) out[text.toLowerCase()] = null;

  for (let i = 0; i < texts.length; i += IDEA_BATCH) {
    const batch = texts.slice(i, i + IDEA_BATCH);
    const res = await fetch(`${API_HOST}/${API_VERSION}/customers/${cid}:generateKeywordIdeas`, {
      method: "POST",
      headers: headers(env, token),
      body: JSON.stringify({
        language,
        geoTargetConstants: [GEO_DENMARK],
        keywordPlanNetwork: "GOOGLE_SEARCH",
        includeAdultKeywords: false,
        keywordSeed: { keywords: batch },
      }),
    });
    if (!res.ok) throw await explain(res);
    const json = (await res.json()) as {
      results?: Array<{ text?: string; keywordIdeaMetrics?: { avgMonthlySearches?: string } }>;
    };
    for (const r of json.results ?? []) {
      const key = (r.text ?? "").toLowerCase();
      if (!(key in out)) continue;
      out[key] = Number(r.keywordIdeaMetrics?.avgMonthlySearches ?? 0) || 0;
    }
  }
  return out;
}

/* ───── Oprettelse ───── */

/** Resource-navnet på et label, eller null hvis det ikke findes. */
export async function findLabel(env: GoogleAdsEnv, name: string): Promise<string | null> {
  requireConfig(env);
  const token = await accessToken(env);
  const cid = digitsOnly(env.GOOGLE_ADS_CUSTOMER_ID!);
  const rows = await search<{ label: { resourceName: string } }>(
    env,
    token,
    cid,
    `SELECT label.resource_name FROM label WHERE label.name = '${name.replace(/'/g, "\\'")}'`,
  );
  return rows[0]?.label.resourceName ?? null;
}

/**
 * Opret én temagruppe: gruppe + keywords + negativer + annonce, i ét kald.
 *
 * `validateOnly` sender hele operationen til Google uden at gemme den. Brug
 * den altid først — Google afviser fx en overskrift over 30 tegn eller en
 * frase mod policy, og det er billigere at få at vide før end efter.
 */
export async function createAdGroup(
  env: GoogleAdsEnv,
  group: NewAdGroup,
  { campaignId = SEARCH_CAMPAIGN_ID, validateOnly = false }: { campaignId?: string; validateOnly?: boolean } = {},
): Promise<CreatedAdGroup> {
  requireConfig(env);
  if (!/^\d+$/.test(campaignId)) throw new AdsApiError(`Ugyldigt kampagne-id: ${campaignId}`, 400);
  if (!group.keywords.length) throw new AdsApiError("En annoncegruppe uden keywords viser intet", 400);

  const token = await accessToken(env);
  const cid = digitsOnly(env.GOOGLE_ADS_CUSTOMER_ID!);
  // Negativt id = midlertidigt navn. Google erstatter det med det rigtige og
  // binder operationerne sammen i samme transaktion.
  const tempAdGroup = `customers/${cid}/adGroups/-1`;

  const operations: unknown[] = [
    {
      adGroupOperation: {
        create: {
          resourceName: tempAdGroup,
          name: group.name,
          campaign: `customers/${cid}/campaigns/${campaignId}`,
          status: group.status,
          type: "SEARCH_STANDARD",
          // Kampagnen kører MANUAL_CPC. En gruppe uden bud serverer intet —
          // det er derfor Yderområder stod stille med 0,01 kr i bud.
          cpcBidMicros: String(Math.round(group.cpcBidMicros)),
        },
      },
    },
  ];

  for (const kw of group.keywords) {
    operations.push({
      adGroupCriterionOperation: {
        create: {
          adGroup: tempAdGroup,
          status: "ENABLED",
          negative: false,
          keyword: { text: kw.text, matchType: kw.matchType },
        },
      },
    });
  }

  for (const neg of group.negatives ?? GROUP_NEGATIVES) {
    operations.push({
      adGroupCriterionOperation: {
        create: {
          adGroup: tempAdGroup,
          negative: true,
          keyword: { text: neg, matchType: "BROAD" },
        },
      },
    });
  }

  operations.push({
    adGroupAdOperation: {
      create: {
        adGroup: tempAdGroup,
        status: "ENABLED",
        ad: {
          finalUrls: [group.finalUrl],
          responsiveSearchAd: {
            headlines: group.headlines.map((text) => ({ text })),
            descriptions: group.descriptions.map((text) => ({ text })),
            ...(group.path1 ? { path1: group.path1 } : {}),
          },
        },
      },
    },
  });

  const res = await fetch(`${API_HOST}/${API_VERSION}/customers/${cid}/googleAds:mutate`, {
    method: "POST",
    headers: headers(env, token),
    body: JSON.stringify({
      mutateOperations: operations,
      validateOnly,
      responseContentType: "RESOURCE_NAME_ONLY",
    }),
  });
  if (!res.ok) throw await explain(res);

  const json = (await res.json()) as {
    mutateOperationResponses?: Array<{
      adGroupResult?: { resourceName: string };
      adGroupCriterionResult?: { resourceName: string };
      adGroupAdResult?: { resourceName: string };
    }>;
  };
  const results = json.mutateOperationResponses ?? [];
  const adGroupResourceName = results.find((r) => r.adGroupResult)?.adGroupResult?.resourceName ?? "";

  return {
    adGroupId: adGroupResourceName.split("/").pop() ?? "",
    adGroupResourceName,
    // Google svarer i samme rækkefølge som operationerne blev sendt, så de
    // positive keywords står først og negativerne bagefter. Kun de positive
    // skal mærkes med BOFU-labelet.
    criterionResourceNames: results
      .filter((r) => r.adGroupCriterionResult)
      .map((r) => r.adGroupCriterionResult!.resourceName)
      .slice(0, group.keywords.length),
    adResourceName: results.find((r) => r.adGroupAdResult)?.adGroupAdResult?.resourceName ?? null,
  };
}

/**
 * Mærk keywords med et label.
 *
 * Kører efter oprettelsen, fordi labels skal pege på de rigtige criterion-id'er.
 * Fejler den, står gruppen der stadig korrekt — den mangler bare sit mærke, og
 * det er en advarsel, ikke en fejl.
 */
export async function labelCriteria(
  env: GoogleAdsEnv,
  labelResourceName: string,
  criterionResourceNames: string[],
): Promise<void> {
  requireConfig(env);
  if (!criterionResourceNames.length) return;
  const token = await accessToken(env);
  const cid = digitsOnly(env.GOOGLE_ADS_CUSTOMER_ID!);

  const res = await fetch(
    `${API_HOST}/${API_VERSION}/customers/${cid}/adGroupCriterionLabels:mutate`,
    {
      method: "POST",
      headers: headers(env, token),
      body: JSON.stringify({
        operations: criterionResourceNames.map((rn) => ({
          create: { adGroupCriterion: rn, label: labelResourceName },
        })),
      }),
    },
  );
  if (!res.ok) throw await explain(res);
}
