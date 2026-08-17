/* ───── SMS-gateway ─────
 *
 * GatewayAPI (gatewayapi.com) i produktion — dansk udbyder, betalt pr. besked.
 * Dev og tests logger i stedet for at sende, og en produktion uden token skal
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

/** Produktion uden token: sig det tydeligt frem for at love en levering */
export class UnconfiguredSmsGateway implements SmsGateway {
  async send(): Promise<SmsResult> {
    console.error("[sms] SMS_API_TOKEN mangler — beskeden blev ikke sendt");
    return { ok: false, error: "sms_ikke_konfigureret" };
  }
}

export interface SmsEnvVars {
  SMS_API_TOKEN?: string;
  /** Sat lokalt i .dev.vars — logger i stedet for at sende rigtige beskeder */
  SMS_DEV_MODE?: string;
}

export function smsConfigured(env: SmsEnvVars): boolean {
  return !!(env.SMS_API_TOKEN || env.SMS_DEV_MODE);
}

export function smsFromEnv(env: SmsEnvVars, sender?: string): SmsGateway {
  if (env.SMS_DEV_MODE) return new LogSmsGateway();
  if (env.SMS_API_TOKEN) return new GatewayApiSms(env.SMS_API_TOKEN, cleanSender(sender));
  return new UnconfiguredSmsGateway();
}

// ------------------------------------------------------------------- saldo

export interface SmsBalance {
  credit: number;
  currency: string;
}

/**
 * Saldoen hos GatewayAPI. Vises i admin, så beskeder ikke stopper med at gå
 * igennem uden at nogen kan se hvorfor. Fejler blødt — en manglende saldo må
 * ikke gøre indstillingssiden utilgængelig.
 */
export async function smsBalance(
  token: string,
  fetchImpl: typeof fetch = (...a: Parameters<typeof fetch>) => fetch(...a),
): Promise<SmsBalance | null> {
  try {
    const res = await fetchImpl("https://gatewayapi.com/rest/me", {
      headers: { Authorization: `Token ${token}` },
    });
    if (!res.ok) return null;
    const body = (await res.json()) as { credit?: number; currency?: string };
    if (typeof body.credit !== "number") return null;
    return { credit: body.credit, currency: String(body.currency || "DKK") };
  } catch {
    return null;
  }
}
