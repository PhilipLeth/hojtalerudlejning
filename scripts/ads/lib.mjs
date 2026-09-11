/* ───── Fælles Google Ads-klient til scripts/ads/ ─────
 *
 * Samme kontrakt som functions/api/_lib/googleads.ts, men uden bundler:
 * scripts kører på rå node, så alt sker med fetch.
 *
 * Nøgler tages fra miljøet, ellers fra ~/gitprojects/openocean-promo/
 * google-ads.yaml. Bemærk at kontoen i yaml-filen er OpenOceans — Lejhøjtaler
 * er 4410207627, og den står som standard herunder.
 */

import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const TOKEN_URL = "https://oauth2.googleapis.com/token";
export const API_HOST = "https://googleads.googleapis.com";
export const API_VERSION = "v25";

export const CUSTOMER_ID = (process.env.GOOGLE_ADS_CUSTOMER_ID ?? "4410207627").replace(/\D/g, "");
export const LOGIN_CUSTOMER_ID = (process.env.GOOGLE_ADS_LOGIN_CUSTOMER_ID ?? "6231006021").replace(/\D/g, "");
export const CAMPAIGN_ID = process.env.GOOGLE_ADS_CAMPAIGN_ID ?? "23973439325";

/** Negativer hver ny gruppe får med — samme fire som resten af kontoen. */
export const GROUP_NEGATIVES = ["køb", "sælg", "brugt", "reparation"];

const CREDS = path.join(os.homedir(), "gitprojects/openocean-promo/google-ads.yaml");

export function credentials() {
  const fromEnv = {
    developer_token: process.env.GOOGLE_ADS_DEVELOPER_TOKEN,
    client_id: process.env.GOOGLE_ADS_CLIENT_ID,
    client_secret: process.env.GOOGLE_ADS_CLIENT_SECRET,
    refresh_token: process.env.GOOGLE_ADS_REFRESH_TOKEN,
  };
  if (Object.values(fromEnv).every(Boolean)) return fromEnv;

  if (!fs.existsSync(CREDS)) {
    throw new Error(`Ingen nøgler. Sæt GOOGLE_ADS_* i miljøet, eller læg google-ads.yaml i ${CREDS}`);
  }
  const ud = {};
  for (const line of fs.readFileSync(CREDS, "utf8").split("\n")) {
    const m = line.match(/^\s*([a-z_]+)\s*:\s*(.+?)\s*$/);
    if (m) ud[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
  return ud;
}

export async function accessToken(creds) {
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: creds.client_id,
      client_secret: creds.client_secret,
      refresh_token: creds.refresh_token,
      grant_type: "refresh_token",
    }),
  });
  if (!res.ok) throw new Error(`OAuth fejlede: ${res.status} ${await res.text()}`);
  return (await res.json()).access_token;
}

function headers(token, creds) {
  return {
    Authorization: `Bearer ${token}`,
    "developer-token": creds.developer_token,
    "login-customer-id": LOGIN_CUSTOMER_ID,
    "Content-Type": "application/json",
  };
}

/** Læs med GAQL. Bruges til at vise hvad der ændres, før det ændres. */
export async function search(token, creds, query) {
  const res = await fetch(`${API_HOST}/${API_VERSION}/customers/${CUSTOMER_ID}/googleAds:search`, {
    method: "POST",
    headers: headers(token, creds),
    body: JSON.stringify({ query }),
  });
  const tekst = await res.text();
  if (!res.ok) throw new Error(`Google svarede ${res.status}: ${tekst}`);
  return JSON.parse(tekst).results ?? [];
}

/**
 * Skriv. `validateOnly` er hele forskellen mellem tørløb og ændring — hvert
 * script herunder kører altid preflight først, så en afvisning ikke
 * efterlader kontoen halvt ændret.
 */
export async function mutate(token, creds, operations, validateOnly) {
  const res = await fetch(`${API_HOST}/${API_VERSION}/customers/${CUSTOMER_ID}/googleAds:mutate`, {
    method: "POST",
    headers: headers(token, creds),
    body: JSON.stringify({ mutateOperations: operations, validateOnly, responseContentType: "RESOURCE_NAME_ONLY" }),
  });
  const tekst = await res.text();
  if (!res.ok) throw new Error(`Google svarede ${res.status}: ${tekst}`);
  return JSON.parse(tekst);
}

export async function connect() {
  const creds = credentials();
  const token = await accessToken(creds);
  return { creds, token };
}

export function adGroupUrl(id) {
  return `https://ads.google.com/aw/adgroups?campaignId=${CAMPAIGN_ID}&adGroupId=${id}`;
}
