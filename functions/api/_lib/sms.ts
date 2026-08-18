/* ───── SMS server-side ─────
 *
 * Ét sted at sende en SMS på en booking: henter indstillingerne fra KV, bygger
 * teksten af skabelonen, sender via den valgte udbyder og giver linjen til
 * kommunikationsloggen tilbage. Kaldere bestemmer selv, hvornår ordren skrives
 * — så en besked og dens log lander i samme KV-skrivning.
 */

import { gsmSafe, smsFromEnv, smsConfigured, toE164Dk } from "../../../src/lib/sms";
import {
import { loadSiteSettings } from "./siteSettings";
  KV_SMS_SETTINGS,
  DEFAULT_SMS_SETTINGS,
  buildSms,
  parseSmsSettings,
  smsAutoEnabled,
  smsLogEntry,
  smsVarsFor,
  type SmsSettings,
  type SmsTypeId,
  type SmsLogEntry,
} from "../../../src/lib/smsTemplates";

export interface SmsEnv {
  BOOKINGS: KVNamespace;
  /** gatewayapi | cpsms | twilio. Tom: afgøres af hvilke nøgler der findes. */
  SMS_PROVIDER?: string;
  /** Token/API-nøgle. Mangler den, sendes intet — og det siges tydeligt. */
  SMS_API_TOKEN?: string;
  /** CPSMS: brugernavnet der hører til nøglen */
  SMS_USERNAME?: string;
  /** Twilio: Account SID (AC…) */
  SMS_ACCOUNT_SID?: string;
  /** Twilio: afsender — købt nummer (+45…) eller Messaging Service (MG…) */
  SMS_FROM?: string;
  /** Sat i .dev.vars lokalt: log i stedet for at sende */
  SMS_DEV_MODE?: string;
  GOOGLE_REVIEW_URL?: string;
}

/** Samme offentlige anmeldelseslink som mailen bruger */
const GOOGLE_REVIEW_FALLBACK = "https://g.page/r/CbIkmN4b8vjGEBM/review";
const SITE_SETTINGS_KEY = "site_settings";
const DEFAULT_PHONE_DISPLAY = "31 13 28 52";

export async function loadSmsSettings(kv: KVNamespace): Promise<SmsSettings> {
  try {
    const raw = await kv.get(KV_SMS_SETTINGS);
    return raw ? parseSmsSettings(JSON.parse(raw)) : DEFAULT_SMS_SETTINGS;
  } catch (e) {
    console.error("[sms] kunne ikke læse indstillinger:", e);
    return DEFAULT_SMS_SETTINGS;
  }
}

export async function saveSmsSettings(kv: KVNamespace, settings: SmsSettings): Promise<void> {
  await kv.put(KV_SMS_SETTINGS, JSON.stringify(settings));
}

/** Vores eget nummer, som kunden skal ringe tilbage på — samme som på sitet */
async function ourPhone(kv: KVNamespace): Promise<string> {
  try {
    const raw = await kv.get(SITE_SETTINGS_KEY);
    const digits = String((raw ? JSON.parse(raw) : {})?.phone ?? "").replace(/\D/g, "");
    if (digits.length !== 8) return DEFAULT_PHONE_DISPLAY;
    return `${digits.slice(0, 2)} ${digits.slice(2, 4)} ${digits.slice(4, 6)} ${digits.slice(6, 8)}`;
  } catch {
    return DEFAULT_PHONE_DISPLAY;
  }
}

export interface SmsContext {
  settings: SmsSettings;
  telefon: string;
  link: string;
  /** Afhentningsadressen fra /admin/indstillinger */
  afhentningsadresse: string;
}

/**
 * Alt det, en besked skal fyldes ud med. Hentes én gang og genbruges, når flere
 * beskeder sendes i samme kørsel (påmindelserne).
 */
export async function smsContext(env: SmsEnv): Promise<SmsContext> {
  const [settings, telefon, site] = await Promise.all([
    loadSmsSettings(env.BOOKINGS),
    ourPhone(env.BOOKINGS),
    loadSiteSettings(env.BOOKINGS),
  ]);
  return {
    settings,
    telefon,
    link: env.GOOGLE_REVIEW_URL || GOOGLE_REVIEW_FALLBACK,
    afhentningsadresse: site.pickupAddress,
  };
}

export interface SendSmsOutcome {
  ok: boolean;
  /** Sat når vi bevidst ikke sendte: slået fra, intet nummer, tom tekst */
  skipped?: "slaaet_fra" | "ugyldigt_nummer" | "tom_tekst";
  error?: string;
  to?: string;
  text?: string;
  type: string;
  entry?: SmsLogEntry;
}

export interface SendSmsOptions {
  /** Manuel afsendelse fra admin — ignorerer om typen er slået til */
  force?: boolean;
  /** Egen tekst i stedet for skabelonen */
  text?: string;
  ctx?: SmsContext;
}

/**
 * Send en besked på en booking. Fejler blødt: en SMS må aldrig kunne vælte den
 * booking eller statusændring, den hænger på.
 */
export async function sendBookingSms(
  env: SmsEnv,
  booking: Record<string, unknown>,
  type: SmsTypeId | "manuel",
  opts: SendSmsOptions = {},
): Promise<SendSmsOutcome> {
  const ctx = opts.ctx ?? (await smsContext(env));

  if (!opts.force && type !== "manuel" && !smsAutoEnabled(ctx.settings, type)) {
    return { ok: false, skipped: "slaaet_fra", type };
  }

  const to = toE164Dk(booking.phone);
  if (!to) {
    console.warn("[sms] ingen brugbart nummer på", booking.id, booking.phone);
    return { ok: false, skipped: "ugyldigt_nummer", type };
  }

  const vars = smsVarsFor(booking, { telefon: ctx.telefon, link: ctx.link, afhentningsadresse: ctx.afhentningsadresse });
  // Også en besked skrevet i hånden renses for pile og typografiske tankestreger:
  // ét tegn uden for GSM-7 tvinger hele beskeden over i UCS-2 og fordobler prisen.
  // Emoji bliver stående — dem vælger man bevidst, og tælleren i admin advarer.
  const text = gsmSafe(opts.text ?? (type === "manuel" ? "" : buildSms(ctx.settings, type, vars).text)).trim();
  if (!text) return { ok: false, skipped: "tom_tekst", type, to };

  const gateway = smsFromEnv(env, ctx.settings.sender);
  const result = await gateway.send(to, text);

  if (!result.ok) return { ok: false, error: result.error || "ukendt_fejl", type, to, text };

  return { ok: true, type, to, text, entry: smsLogEntry(type, to, text) };
}

/**
 * Skriv beskeden ind på ordren: i kommunikationsloggen, og som mærke pr. type,
 * så en dobbeltkørsel af påmindelserne ikke sender det samme to gange.
 * Muterer bookingen — kalderen gemmer den bagefter.
 */
export function recordSms(booking: Record<string, unknown>, outcome: SendSmsOutcome): void {
  if (!outcome.ok || !outcome.entry) return;
  booking.communications = [
    ...(Array.isArray(booking.communications) ? booking.communications : []),
    outcome.entry,
  ];
  const sent = (booking.smsSent && typeof booking.smsSent === "object" ? booking.smsSent : {}) as Record<string, string>;
  sent[outcome.type] = outcome.entry.sentAt;
  booking.smsSent = sent;
}

/**
 * Gatewayens fejlkoder oversat til noget admin kan handle på. En SMS der ikke
 * gik igennem skyldes næsten altid token eller saldo — så skal der stå det, og
 * ikke "502".
 */
export function smsErrorText(code?: string): string {
  switch (code) {
    case "sms_ikke_konfigureret":
      return "Ingen SMS-udbyder er sat op i Cloudflare — der kan ikke sendes endnu";
    case "gatewayapi_401":
    case "gatewayapi_403":
    case "cpsms_401":
    case "cpsms_403":
    case "twilio_20003":
      return "Udbyderen afviste dine nøgler — tjek SMS_API_TOKEN (og brugernavn/Account SID)";
    case "gatewayapi_402":
    case "cpsms_402":
    case "twilio_20429":
      return "Ingen saldo hos udbyderen — læg penge på kontoen";
    case "gatewayapi_422":
    case "cpsms_400":
      return "Udbyderen afviste beskeden — tjek afsendernavn (max 11 tegn) og nummeret";
    case "twilio_21606":
    case "twilio_21212":
      return "Twilio afviste afsenderen — sæt SMS_FROM til et nummer du har købt hos dem";
    case "twilio_21608":
      return "Twilio-prøvekonti kan kun sende til bekræftede numre — opgradér kontoen";
    case "netvaerksfejl":
      return "Kunne ikke nå SMS-udbyderen — prøv igen";
    case "ugyldigt_nummer":
      return "Kundens telefonnummer kan ikke bruges til SMS";
    case "tom_tekst":
      return "Beskeden er tom";
    case "slaaet_fra":
      return "Beskedtypen er slået fra";
    default:
      return code ? `SMS fejlede (${code})` : "SMS fejlede";
  }
}

export { smsConfigured };
