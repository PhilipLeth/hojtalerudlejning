/* ───── SMS-gateway ─────
 *
 * Udbyderen er et valg, ikke en beslutning støbt ind i koden: GatewayAPI,
 * CPSMS eller Twilio, afgjort af hvilke nøgler der ligger i Cloudflare. Alle
 * tre taler REST over fetch, så ingen af dem kræver en SDK i en Worker.
 *
 * Dev og tests logger i stedet for at sende, og en produktion uden nøgler skal
 * fejle højlydt frem for at lade som om beskeden gik afsted: en SMS der aldrig
 * blev sendt må ikke stå som "sendt" i kommunikationsloggen.
 *
 * Filen holdes fri for imports, fordi den bruges både i browseren (admin) og i
 * Pages Functions, hvor "@/"-aliaset ikke resolves.
 */

export interface SmsResult {
  ok: boolean;
  /** GatewayAPI's id på beskeden — kan slås op hos dem ved tvivl */
  id?: string;
  error?: string;
}

export interface SmsGateway {
  send(to: string, message: string): Promise<SmsResult>;
}

/** Afsendernavn: max 11 tegn, kun bogstaver og tal (GatewayAPI's regel) */
export const DEFAULT_SMS_SENDER = "Lejhojtaler";

export function cleanSender(raw: unknown): string {
  const s = String(raw ?? "").replace(/[^A-Za-z0-9]/g, "").slice(0, 11);
  return s || DEFAULT_SMS_SENDER;
}

// ------------------------------------------------------------------- numre

/**
 * Fri tekst → E.164. Kundens telefonfelt er et tekstfelt, så numrene kommer
 * som "31 13 28 52", "+45 31132852", "0045-31132852" og alt derimellem.
 * null betyder "kan ikke sendes til" — det er bedre end at brænde en besked
 * af på et nummer vi har gættet os frem til.
 */
export function toE164Dk(raw: unknown): string | null {
  const s = String(raw ?? "").trim();
  if (!s) return null;

  const plus = s.startsWith("+") || s.startsWith("00");
  const digits = s.replace(/\D/g, "");
  if (!digits) return null;

  // Dansk nummer, med eller uden landekode
  const local = digits.replace(/^(?:0045|45)(?=\d{8}$)/, "");
  if (local.length === 8) {
    // Danske numre begynder aldrig på 0 eller 1
    return /^[2-9]/.test(local) ? `+45${local}` : null;
  }

  // Udenlandsk nummer skal have skrevet sin landekode eksplicit — ellers ved
  // vi ikke om "12345678901" er et land eller en tastefejl
  if (plus) {
    const intl = digits.replace(/^00/, "");
    if (intl.length >= 8 && intl.length <= 15) return `+${intl}`;
  }
  return null;
}

/** Læsbart nummer til admin: +4531132852 → 31 13 28 52 */
export function displayPhone(e164: string): string {
  const m = /^\+45(\d{8})$/.exec(e164);
  if (!m) return e164;
  const d = m[1];
  return `${d.slice(0, 2)} ${d.slice(2, 4)} ${d.slice(4, 6)} ${d.slice(6, 8)}`;
}

// -------------------------------------------------------------- beskedlængde

/** GSM-7 grundalfabetet — æ, ø og å er med, så dansk fylder ét tegn pr. tegn */
const GSM7 =
  "@£$¥èéùìòÇ\nØø\rÅåΔ_ΦΓΛΩΠΨΣΘΞÆæßÉ !\"#¤%&'()*+,-./0123456789:;<=>?¡ABCDEFGHIJKLMNOPQRSTUVWXYZÄÖÑÜ§¿abcdefghijklmnopqrstuvwxyzäöñüà";
/** Tegn der findes i GSM-7, men fylder to */
const GSM7_EXT = "^{}\\[~]|€";

/**
 * Typografiske tegn der ikke findes i GSM-7, og deres nærmeste erstatning.
 *
 * Uden dette ville en enkelt pil fra periodeteksten ("fre 21. aug → man 24.
 * aug") tvinge hele beskeden over i UCS-2 og gøre en besked til tre. Emoji
 * bliver stående — dem vælger man selv, og tælleren i admin advarer.
 */
const GSM_REPLACEMENTS: Array<[RegExp, string]> = [
  [/[→⇒➔]/g, "-"],
  [/[–—]/g, "-"],
  [/[“”„»«]/g, '"'],
  [/[‘’‚]/g, "'"],
  [/…/g, "..."],
  [/[·•]/g, "-"],
  [/ /g, " "],
];

export function gsmSafe(text: string): string {
  let out = String(text ?? "");
  for (const [re, to] of GSM_REPLACEMENTS) out = out.replace(re, to);
  return out;
}

/**
 * Webadresser i teksten. Operatørerne afviser links, der ikke står på
 * udbyderens hvidliste for kontoen — og afvisningen kommer FØRST efter at
 * gatewayen har kvitteret, så beskeden ser sendt ud uden at nå frem. Derfor
 * skal admin advares, inden teksten gemmes.
 *
 * Fanger både "https://…" og bare domæner som "lejhojtaler.dk". En mailadresse
 * er ikke et link i den forstand og tæller ikke med.
 */
export function findLinks(text: string): string[] {
  const found = new Set<string>();
  const s = String(text ?? "");
  for (const m of s.matchAll(/https?:\/\/[^\s]+/gi)) found.add(m[0]);
  // Bare domæner: ord.tld, men ikke midt i en mailadresse
  for (const m of s.matchAll(/(^|[^\w@./-])((?:[a-z0-9æøå-]+\.)+(?:dk|com|net|org|io|eu|se|no|de|co|app|shop|link|page))\b/gi)) {
    found.add(m[2]);
  }
  return [...found];
}

export function hasLinks(text: string): boolean {
  return findLinks(text).length > 0;
}

export interface SmsLength {
  /** Tegn som gatewayen tæller dem */
  chars: number;
  /** Antal beskeder — hver koster penge */
  segments: number;
  /** Tvunget over i UCS-2 (emoji, specialtegn) — så er grænsen 70 tegn */
  unicode: boolean;
}

/**
 * Hvor mange beskeder teksten bliver til. Ét emoji tvinger hele beskeden over
 * i UCS-2 og halverer grænsen fra 160 til 70 tegn — det skal admin kunne se,
 * inden teksten gemmes, ikke opdage på regningen.
 */
export function smsLength(text: string): SmsLength {
  const s = String(text ?? "");
  let chars = 0;
  let unicode = false;

  for (const ch of s) {
    if (GSM7.includes(ch)) chars += 1;
    else if (GSM7_EXT.includes(ch)) chars += 2;
    else {
      unicode = true;
      // UCS-2 tæller i kodeenheder — emoji uden for BMP fylder to
      chars += ch.length;
    }
  }

  if (unicode) {
    // Genberegn: i UCS-2 fylder alle tegn ens
    chars = 0;
    for (const ch of s) chars += ch.length;
    const single = 70;
    const multi = 67;
    return { chars, unicode, segments: chars === 0 ? 0 : chars <= single ? 1 : Math.ceil(chars / multi) };
  }

  const single = 160;
  const multi = 153;
  return { chars, unicode, segments: chars === 0 ? 0 : chars <= single ? 1 : Math.ceil(chars / multi) };
}

// -------------------------------------------------------------- gateways

/** Dev og tests: skriv i loggen, send ingenting */
export class LogSmsGateway implements SmsGateway {
  sent: Array<{ to: string; message: string }> = [];
  async send(to: string, message: string): Promise<SmsResult> {
    this.sent.push({ to, message });
    console.log(`[sms:dev] til=${to} tekst=${message}`);
    return { ok: true, id: `dev-${this.sent.length}` };
  }
}

export class GatewayApiSms implements SmsGateway {
  constructor(
    private token: string,
    private sender: string = DEFAULT_SMS_SENDER,
    private fetchImpl: typeof fetch = (...a: Parameters<typeof fetch>) => fetch(...a),
  ) {}

  async send(to: string, message: string): Promise<SmsResult> {
    const msisdn = Number(String(to).replace(/\D/g, ""));
    if (!Number.isFinite(msisdn) || msisdn <= 0) return { ok: false, error: "ugyldigt_nummer" };

    let res: Response;
    try {
      res = await this.fetchImpl("https://gatewayapi.com/rest/mtsms", {
        method: "POST",
        headers: {
          Authorization: `Token ${this.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sender: cleanSender(this.sender),
          message,
          class: "standard",
          recipients: [{ msisdn }],
        }),
      });
    } catch (e) {
      console.error("[sms] gatewayapi uden svar:", e);
      return { ok: false, error: "netvaerksfejl" };
    }

    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      console.error(`[sms] gatewayapi ${res.status}: ${detail.slice(0, 300)}`);
      // 401/403 er en forkert token, 402 er tom saldo — begge skal kunne ses i admin
      return { ok: false, error: `gatewayapi_${res.status}` };
    }

    try {
      const body = (await res.json()) as { ids?: Array<number | string> };
      return { ok: true, id: body.ids?.[0] != null ? String(body.ids[0]) : undefined };
    } catch {
      return { ok: true };
    }
  }
}

/**
 * CPSMS (cpsms.dk) — dansk udbyder, Basic auth med brugernavn og API-nøgle.
 * Svarer 200 med et error-objekt i kroppen ved afviste beskeder, så status
 * alene er ikke nok til at afgøre om beskeden gik igennem.
 */
export class CpsmsGateway implements SmsGateway {
  constructor(
    private username: string,
    private apiKey: string,
    private sender: string = DEFAULT_SMS_SENDER,
    private fetchImpl: typeof fetch = (...a: Parameters<typeof fetch>) => fetch(...a),
  ) {}

  async send(to: string, message: string): Promise<SmsResult> {
    const number = String(to).replace(/\D/g, "");
    if (!number) return { ok: false, error: "ugyldigt_nummer" };

    let res: Response;
    try {
      res = await this.fetchImpl("https://api.cpsms.dk/v2/send", {
        method: "POST",
        headers: {
          Authorization: `Basic ${btoa(`${this.username}:${this.apiKey}`)}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: number,
          from: cleanSender(this.sender),
          message,
          // Dansk tekst er GSM-7; teksten er allerede renset for pile og
          // typografiske anførselstegn i renderSms
          encoding: "UTF-8",
        }),
      });
    } catch (e) {
      console.error("[sms] cpsms uden svar:", e);
      return { ok: false, error: "netvaerksfejl" };
    }

    let body: { success?: Array<{ to?: string }>; error?: { code?: number; message?: string } } = {};
    try {
      body = (await res.json()) as typeof body;
    } catch {
      /* tom krop — status afgør */
    }

    if (!res.ok || body.error) {
      const code = body.error?.code ?? res.status;
      console.error(`[sms] cpsms ${code}: ${String(body.error?.message ?? "").slice(0, 200)}`);
      return { ok: false, error: `cpsms_${code}` };
    }
    return { ok: true, id: body.success?.[0]?.to };
  }
}

/**
 * Twilio — global, hurtigst at komme i gang med, men afsender er et købt
 * nummer eller et navn der skal godkendes til dansk trafik. SMS_FROM afgør
 * hvad der sendes fra; et "MG…"-id er en Messaging Service.
 */
export class TwilioSms implements SmsGateway {
  constructor(
    private accountSid: string,
    private authToken: string,
    private from: string,
    private fetchImpl: typeof fetch = (...a: Parameters<typeof fetch>) => fetch(...a),
  ) {}

  async send(to: string, message: string): Promise<SmsResult> {
    const form = new URLSearchParams({ To: to, Body: message });
    if (this.from.startsWith("MG")) form.set("MessagingServiceSid", this.from);
    else form.set("From", this.from);

    let res: Response;
    try {
      res = await this.fetchImpl(
        `https://api.twilio.com/2010-04-01/Accounts/${encodeURIComponent(this.accountSid)}/Messages.json`,
        {
          method: "POST",
          headers: {
            Authorization: `Basic ${btoa(`${this.accountSid}:${this.authToken}`)}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: form.toString(),
        },
      );
    } catch (e) {
      console.error("[sms] twilio uden svar:", e);
      return { ok: false, error: "netvaerksfejl" };
    }

    let body: { sid?: string; code?: number; message?: string } = {};
    try {
      body = (await res.json()) as typeof body;
    } catch {
      /* tom krop — status afgør */
    }

    if (!res.ok) {
      console.error(`[sms] twilio ${res.status}/${body.code}: ${String(body.message ?? "").slice(0, 200)}`);
      // Twilios egen fejlkode siger mere end HTTP-status (fx 21606: forkert afsender)
      return { ok: false, error: `twilio_${body.code ?? res.status}` };
    }
    return { ok: true, id: body.sid };
  }
}

/** Produktion uden nøgler: sig det tydeligt frem for at love en levering */
export class UnconfiguredSmsGateway implements SmsGateway {
  async send(): Promise<SmsResult> {
    console.error("[sms] ingen udbyder er konfigureret — beskeden blev ikke sendt");
    return { ok: false, error: "sms_ikke_konfigureret" };
  }
}

export type SmsProvider = "gatewayapi" | "cpsms" | "twilio";

export const SMS_PROVIDERS: Array<{ id: SmsProvider; label: string; note: string }> = [
  {
    id: "gatewayapi",
    label: "GatewayAPI",
    note: "Dansk (Onlinecity). Kræver SMS_API_TOKEN.",
  },
  {
    id: "cpsms",
    label: "CPSMS",
    note: "Dansk (Compaya). Kræver SMS_USERNAME + SMS_API_TOKEN.",
  },
  {
    id: "twilio",
    label: "Twilio",
    note: "Global. Kræver SMS_ACCOUNT_SID + SMS_API_TOKEN, og SMS_FROM som afsender.",
  },
];

export interface SmsEnvVars {
  /** Tving en bestemt udbyder. Tom: afgøres af hvilke nøgler der findes. */
  SMS_PROVIDER?: string;
  /** Token/API-nøgle/auth token — samme navn hos alle tre */
  SMS_API_TOKEN?: string;
  /** CPSMS: brugernavnet der hører til nøglen */
  SMS_USERNAME?: string;
  /** Twilio: Account SID (AC…) */
  SMS_ACCOUNT_SID?: string;
  /** Twilio: afsender — købt nummer (+45…) eller Messaging Service (MG…) */
  SMS_FROM?: string;
  /** Sat lokalt i .dev.vars — logger i stedet for at sende rigtige beskeder */
  SMS_DEV_MODE?: string;
}

/**
 * Hvilken udbyder er sat op? SMS_PROVIDER vinder, ellers afgør nøglerne det —
 * så et skifte kun kræver, at man lægger de nye nøgler ind og fjerner de gamle.
 */
export function resolveProvider(env: SmsEnvVars): SmsProvider | null {
  const forced = String(env.SMS_PROVIDER ?? "").trim().toLowerCase();
  if (forced === "gatewayapi" || forced === "cpsms" || forced === "twilio") return forced;
  if (!env.SMS_API_TOKEN) return null;
  if (env.SMS_ACCOUNT_SID) return "twilio";
  if (env.SMS_USERNAME) return "cpsms";
  return "gatewayapi";
}

/** Har udbyderen det, den skal bruge for at kunne sende? */
export function providerReady(env: SmsEnvVars): boolean {
  const provider = resolveProvider(env);
  if (!provider) return false;
  if (!env.SMS_API_TOKEN) return false;
  if (provider === "cpsms") return !!env.SMS_USERNAME;
  if (provider === "twilio") return !!env.SMS_ACCOUNT_SID;
  return true;
}

export function smsConfigured(env: SmsEnvVars): boolean {
  return !!env.SMS_DEV_MODE || providerReady(env);
}

export function smsFromEnv(env: SmsEnvVars, sender?: string): SmsGateway {
  if (env.SMS_DEV_MODE) return new LogSmsGateway();
  if (!providerReady(env)) return new UnconfiguredSmsGateway();

  const token = env.SMS_API_TOKEN!;
  switch (resolveProvider(env)) {
    case "cpsms":
      return new CpsmsGateway(env.SMS_USERNAME!, token, cleanSender(sender));
    case "twilio":
      // Uden SMS_FROM prøver vi afsendernavnet; i Danmark kræver et navn
      // godkendelse hos Twilio, så et købt nummer er den sikre vej
      return new TwilioSms(env.SMS_ACCOUNT_SID!, token, env.SMS_FROM || cleanSender(sender));
    default:
      return new GatewayApiSms(token, cleanSender(sender));
  }
}

// ------------------------------------------------------------------- saldo

export interface SmsBalance {
  credit: number;
  currency: string;
}

/**
 * Saldoen hos udbyderen. Vises i admin, så beskeder ikke stopper med at gå
 * igennem uden at nogen kan se hvorfor. Fejler blødt — en manglende saldo må
 * ikke gøre indstillingssiden utilgængelig, og CPSMS har ingen saldo-endpoint
 * vi kalder, så der vises ingenting frem for et gæt.
 */
export async function smsBalance(
  env: SmsEnvVars,
  fetchImpl: typeof fetch = (...a: Parameters<typeof fetch>) => fetch(...a),
): Promise<SmsBalance | null> {
  const token = env.SMS_API_TOKEN;
  if (!token) return null;

  try {
    if (resolveProvider(env) === "twilio") {
      if (!env.SMS_ACCOUNT_SID) return null;
      const res = await fetchImpl(
        `https://api.twilio.com/2010-04-01/Accounts/${encodeURIComponent(env.SMS_ACCOUNT_SID)}/Balance.json`,
        { headers: { Authorization: `Basic ${btoa(`${env.SMS_ACCOUNT_SID}:${token}`)}` } },
      );
      if (!res.ok) return null;
      const body = (await res.json()) as { balance?: string | number; currency?: string };
      const credit = Number(body.balance);
      if (!Number.isFinite(credit)) return null;
      return { credit, currency: String(body.currency || "USD") };
    }

    if (resolveProvider(env) !== "gatewayapi") return null;

    const res = await fetchImpl("https://gatewayapi.com/rest/me", {
      headers: { Authorization: `Token ${token}` },
    });
    if (!res.ok) return null;
    // GatewayAPI svarer med saldoen som streng ("2.00000") — ikke som tal
    const body = (await res.json()) as { credit?: string | number; currency?: string };
    const credit = Number(body.credit);
    if (!Number.isFinite(credit)) return null;
    return { credit, currency: String(body.currency || "DKK") };
  } catch {
    return null;
  }
}

export interface DeliveryStatus {
  /** GatewayAPI's egen status: DELIVERED, REJECTED, EXPIRED … */
  status: string;
  /** Fx "contained non-allowed-links: lejhojtaler.dk" */
  error?: string;
  /** Afsenderen som operatøren faktisk viste den */
  sender?: string;
}

/**
 * Hvad skete der egentlig med beskeden? Gatewayen kvitterer med det samme, men
 * operatøren kan afvise bagefter — og gør det bl.a. ved links, der ikke er
 * godkendt. Uden dette opslag ville en afvist besked stå som "sendt" i admin.
 *
 * Kun GatewayAPI: de andre udbydere leverer status via callback, ikke opslag.
 */
export async function messageStatus(
  env: SmsEnvVars,
  id: string,
  fetchImpl: typeof fetch = (...a: Parameters<typeof fetch>) => fetch(...a),
): Promise<DeliveryStatus | null> {
  if (!id || !env.SMS_API_TOKEN || resolveProvider(env) !== "gatewayapi") return null;
  try {
    const res = await fetchImpl(`https://gatewayapi.com/rest/mtsms/${encodeURIComponent(id)}`, {
      headers: { Authorization: `Token ${env.SMS_API_TOKEN}` },
    });
    if (!res.ok) return null;
    const body = (await res.json()) as {
      recipients?: Array<{ dsnstatus?: string; dsnerror?: string; actual_sender?: string }>;
    };
    const r = body.recipients?.[0];
    if (!r?.dsnstatus) return null;
    return { status: r.dsnstatus, error: r.dsnerror || undefined, sender: r.actual_sender || undefined };
  } catch {
    return null;
  }
}
