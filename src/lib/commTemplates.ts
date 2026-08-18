/* ───── Kundekommunikation: skabeloner og shortcodes ─────
 *
 * Opfølgningen efter en ordre var hardkodet HTML i bookings-update.ts. Nu
 * ligger teksten i KV, så den kan rettes uden deploy, og shortcodes udfyldes
 * server-side fra bookingen.
 *
 * Teksten skrives som ren tekst — ikke HTML. Admin skal kunne skrive en mail
 * uden at kunne komme til at ødelægge den, og en tom shortcode skal kunne
 * fjerne sit eget afsnit i stedet for at efterlade et hul.
 */

import { DEFAULT_COMPANY, formatCompanyLine } from "@/lib/siteInfo";

export const KV_COMM_SETTINGS = "comm_settings";

export interface Shortcode {
  key: string;
  label: string;
  /** Hvad der kommer til at stå — vises i admin */
  example: string;
}

/**
 * Alle shortcodes der kan bruges i en skabelon. Listen er sandheden: admin
 * viser den, og renderTemplate fjerner alt andet i {{...}} så en tastefejl
 * ikke ender ude hos kunden som "{{fornvan}}".
 */
export const SHORTCODES: Shortcode[] = [
  { key: "fornavn", label: "Kundens fornavn", example: "Agnes" },
  { key: "navn", label: "Kundens fulde navn", example: "Agnes Dahle Stæhr" },
  { key: "produkter", label: "Hvad de lejede", example: "Stor højtalerpakke, Lys-pakke" },
  { key: "periode", label: "Lejeperioden", example: "fre 21. aug → man 24. aug" },
  { key: "ansvarlig", label: "Hvem der stod for udlejningen", example: "Frederik" },
  { key: "hilsen", label: "Den ansvarliges egen underskrift", example: "Frederik fra Lejhøjtaler" },
  { key: "besked", label: "Personlig besked skrevet på ordren", example: "Fedt I fik gang i dansegulvet!" },
  { key: "rabatkode", label: "Kode de kan dele med venner", example: "DEL10" },
  { key: "rabatpct", label: "Rabatprocent på delekoden", example: "10" },
  { key: "anmeldelseslink", label: "Knap til Google-anmeldelse", example: "[knap: Anmeld os på Google]" },
  { key: "udsalg", label: "Weekendudsalget — tomt når det er slukket", example: "PS: Vi har weekendudsalg …" },
  // Til bekræftelsen: hvor, hvornår og hvad der skal betales
  { key: "sted", label: "Levering eller afhentning, med adresse", example: "Hentes hos os: Halvtolv 9, 1. th, 1436 København K" },
  { key: "telefon", label: "Vores telefonnummer", example: "31 13 28 52" },
  { key: "total", label: "Ordrens pris", example: "1.995 kr" },
  { key: "betaling", label: "Hvad der mangler at blive betalt, og hvordan", example: "Betales ved afhentning — MobilePay eller kontant" },
];

const SHORTCODE_KEYS = new Set(SHORTCODES.map((s) => s.key));

export interface CommStaff {
  /** Navnet der vises i {{ansvarlig}} og i dropdownen på ordren */
  name: string;
  /** Personlig underskrift — {{hilsen}} */
  signature: string;
}

export interface CommTemplate {
  subject: string;
  body: string;
}

export interface CommSettings {
  /** Opfølgning når udstyret er registreret retur */
  followUp: CommTemplate;
  /**
   * Bekræftelsen når ordren godkendes.
   *
   * Kunden har fået en kvittering ved bestilling, men den siger kun "vi vender
   * tilbage". Det her er beskeden, der gør aftalen fast: hvad, hvornår, hvor og
   * hvad der skal betales. Den sendes ved at sætte ordren til bekræftet.
   */
  confirmation: CommTemplate;
  /** Bekræftelsen sendes ved statusskiftet. Slået fra = ingen mail. */
  confirmationAutoSend: boolean;
  /** Sendes automatisk ved retur. Slået fra = kun manuelt. */
  autoSend: boolean;
  staff: CommStaff[];
  /** Koden kunden kan give videre */
  referralCode: string;
  referralPct: number;
}

export const DEFAULT_SETTINGS: CommSettings = {
  autoSend: true,
  confirmationAutoSend: true,
  confirmation: {
    subject: "Din booking er bekræftet, {{fornavn}} 🔊",
    body: `Hej {{fornavn}},

Så er det på plads — vi har reserveret udstyret til dig.

{{besked}}

Du får: {{produkter}}
Periode: {{periode}}
{{sted}}

{{betaling}}

Alle kabler er med (iPhone m/ USB-C adapter, AUX og strøm), så du kan sætte til og spille med det samme. Vi viser dig, hvordan det virker, når du henter.

Skal noget ændres — tidspunkt, adresse eller udstyr — så ring til os på {{telefon}}. Det er nemmere at flytte end at aflyse.

Vi glæder os til at hjælpe jer godt i gang.

Bedste hilsner,
{{hilsen}}`,
  },
  staff: [{ name: "Frederik", signature: "Frederik fra Lejhøjtaler.dk" }],
  referralCode: "del10",
  referralPct: 10,
  followUp: {
    subject: "Tak for denne gang, {{fornavn}} ⭐",
    body: `Hej {{fornavn}},

Tak fordi du har lejet hos lejhøjtaler.dk — håber du havde et godt event.

{{besked}}

Du lejede {{produkter}} ({{periode}}).

Vil du bruge 30 sekunder på at give os en anmeldelse? Det betyder meget for os som lille virksomhed og hjælper andre med at finde os.

{{anmeldelseslink}}

Og giv den her videre: dine venner får {{rabatpct}}% på deres første leje med koden {{rabatkode}}.

{{udsalg}}

Bedste hilsner,
{{hilsen}}`,
  },
};

// ------------------------------------------------------------------ rendering

/** Værdier til shortcodes. Manglende nøgler bliver til tom tekst. */
export type TemplateVars = Partial<Record<string, string>>;

/**
 * Erstat {{shortcode}} med værdier for et givet sæt tilladte nøgler. Ukendte
 * shortcodes fjernes helt — en tastefejl i admin skal ikke ende som
 * "{{fornvan}}" hos kunden. SMS-skabelonerne har deres eget sæt nøgler og
 * bruger samme motor (se smsTemplates.ts).
 */
export function renderWithKeys(text: string, allowed: Set<string>, vars: TemplateVars): string {
  return String(text ?? "").replace(/\{\{\s*([a-zA-ZæøåÆØÅ_]+)\s*\}\}/g, (_, raw: string) => {
    const key = raw.toLowerCase();
    if (!allowed.has(key)) return "";
    return vars[key] ?? "";
  });
}

/** Mail-skabelonernes shortcodes */
export function renderTemplate(text: string, vars: TemplateVars): string {
  return renderWithKeys(text, SHORTCODE_KEYS, vars);
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Bar URL i teksten bliver klikbar */
function autolink(s: string): string {
  return s.replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1" style="color:#bfa000;">$1</a>');
}

export interface HtmlOptions {
  /** Knappen {{anmeldelseslink}} peger herhen */
  reviewUrl?: string;
}

/**
 * Markør for anmeldelsesknappen. Ren tekst kan ikke bære en knap, så
 * {{anmeldelseslink}} bliver til denne, og textToHtml bytter afsnittet ud.
 */
const BUTTON_TOKEN = "[[KNAP]]";

/**
 * Ren tekst → mail-HTML.
 *
 * Afsnit adskilles af tomme linjer. Et afsnit der endte tomt (fordi dets
 * shortcodes ikke havde nogen værdi) droppes — ellers ville en ordre uden
 * personlig besked få et hul midt i mailen.
 */
export function textToHtml(text: string, opts: HtmlOptions = {}): string {
  const paragraphs = String(text ?? "")
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0);

  const out = paragraphs.map((p) => {
    if (p === BUTTON_TOKEN) {
      if (!opts.reviewUrl) return "";
      return `<p style="margin:20px 0;"><a href="${escapeHtml(opts.reviewUrl)}" style="display:inline-block;background:#bfa000;color:#000;font-weight:bold;padding:12px 24px;border-radius:24px;text-decoration:none;">⭐ Anmeld os på Google</a></p>`;
    }
    const html = autolink(escapeHtml(p)).replace(/\n/g, "<br>");
    return `<p style="margin:0 0 12px;">${html}</p>`;
  });

  return out.filter(Boolean).join("\n");
}

export interface FollowUpContext {
  fornavn?: string;
  navn?: string;
  produkter?: string;
  periode?: string;
  ansvarlig?: string;
  hilsen?: string;
  besked?: string;
  rabatkode?: string;
  rabatpct?: number;
  /** Tom streng når udsalget er slukket */
  udsalg?: string;
  reviewUrl?: string;
  /** Firmalinjen i bunden — kommer fra /admin/indstillinger */
  footer?: string;
}

/**
 * Firmalinjen i bunden. Standarden er koden; kalderen kan sende de levende
 * oplysninger fra /admin/indstillinger med, så en flytning slår igennem i
 * mailen samtidig med på sitet.
 */
const DEFAULT_FOOTER = `<p style="margin-top:16px;color:#bbb;font-size:12px;">${formatCompanyLine(DEFAULT_COMPANY).replace(/ · /g, " &middot; ")}</p>`;

/** Byg den færdige opfølgningsmail */
export function buildFollowUpMail(
  settings: CommSettings,
  ctx: FollowUpContext,
): { subject: string; html: string } {
  const FOOTER = ctx.footer || DEFAULT_FOOTER;
  const vars: TemplateVars = {
    fornavn: ctx.fornavn ?? "",
    navn: ctx.navn ?? "",
    produkter: ctx.produkter ?? "",
    periode: ctx.periode ?? "",
    ansvarlig: ctx.ansvarlig ?? "",
    hilsen: ctx.hilsen || "Lejhøjtaler.dk",
    besked: ctx.besked ?? "",
    rabatkode: (ctx.rabatkode ?? "").toUpperCase(),
    rabatpct: ctx.rabatpct != null ? String(ctx.rabatpct) : "",
    udsalg: ctx.udsalg ?? "",
    // Knappen kan ikke laves af ren tekst, så den markeres og byttes i textToHtml
    anmeldelseslink: ctx.reviewUrl ? BUTTON_TOKEN : "",
  };

  const subject = renderTemplate(settings.followUp.subject, vars).trim() || "Tak for denne gang";
  const body = renderTemplate(settings.followUp.body, vars);
  const html = `<div style="font-family:sans-serif;max-width:480px;color:#111;">
${textToHtml(body, { reviewUrl: ctx.reviewUrl })}
${FOOTER}
</div>`;

  return { subject, html };
}

// ------------------------------------------------------------------- sanitering

function cleanText(v: unknown, fallback: string, max = 4000): string {
  const s = typeof v === "string" ? v.trim() : "";
  if (!s) return fallback;
  return s.slice(0, max);
}

/** Samme normalisering som rabatkoder — æ/ø/å og små bogstaver */
export function normalizeCommCode(raw: unknown): string {
  return String(raw ?? "")
    .trim()
    .toLowerCase()
    .replace(/æ/g, "ae")
    .replace(/ø/g, "oe")
    .replace(/å/g, "aa");
}

export function parseCommSettings(raw: unknown): CommSettings {
  const obj = (raw ?? {}) as Partial<CommSettings>;
  const tpl = (obj.followUp ?? {}) as Partial<CommTemplate>;
  const conf = (obj.confirmation ?? {}) as Partial<CommTemplate>;

  const staff = Array.isArray(obj.staff)
    ? obj.staff
        .filter((s): s is CommStaff => !!s && typeof (s as CommStaff).name === "string")
        .map((s) => ({
          name: String(s.name).trim().slice(0, 60),
          signature: String(s.signature ?? "").trim().slice(0, 200),
        }))
        .filter((s) => s.name.length > 0)
    : [];

  const pct = Number(obj.referralPct);
  const code = normalizeCommCode(obj.referralCode);

  return {
    followUp: {
      subject: cleanText(tpl.subject, DEFAULT_SETTINGS.followUp.subject, 200),
      body: cleanText(tpl.body, DEFAULT_SETTINGS.followUp.body),
    },
    confirmation: {
      subject: cleanText(conf.subject, DEFAULT_SETTINGS.confirmation.subject, 200),
      body: cleanText(conf.body, DEFAULT_SETTINGS.confirmation.body),
    },
    confirmationAutoSend: obj.confirmationAutoSend !== false,
    autoSend: obj.autoSend !== false,
    staff: staff.length ? staff : DEFAULT_SETTINGS.staff,
    referralCode: /^[a-z0-9-]{2,30}$/.test(code) ? code : DEFAULT_SETTINGS.referralCode,
    referralPct: Number.isFinite(pct) && pct >= 1 && pct <= 99 ? Math.round(pct) : DEFAULT_SETTINGS.referralPct,
  };
}

/**
 * Underskriften for den ansvarlige, eller tom hvis ingen er sat.
 * Tom underskrift falder tilbage på navnet — ellers ville mailen
 * blive underskrevet med ingenting.
 */
export function signatureFor(settings: CommSettings, name?: string): string {
  if (!name) return "";
  return settings.staff.find((s) => s.name === name)?.signature || name;
}

export interface ConfirmationContext {
  fornavn?: string;
  navn?: string;
  produkter?: string;
  periode?: string;
  /** "Vi leverer til …" eller "Hentes hos os: …" */
  sted?: string;
  /** Hvad der mangler at blive betalt, og hvordan */
  betaling?: string;
  total?: number;
  telefon?: string;
  ansvarlig?: string;
  hilsen?: string;
  besked?: string;
  footer?: string;
}

/**
 * Bekræftelsen på en godkendt ordre.
 *
 * Kvitteringen ved bestilling siger kun "vi vender tilbage". Det her er den
 * besked, kunden gemmer og finder frem igen fredag eftermiddag, så den skal
 * kunne stå alene: hvad, hvornår, hvor, og hvad der skal betales.
 */
export function buildConfirmationMail(
  settings: CommSettings,
  ctx: ConfirmationContext,
): { subject: string; html: string } {
  const FOOTER = ctx.footer || DEFAULT_FOOTER;
  const vars: TemplateVars = {
    fornavn: ctx.fornavn ?? "",
    navn: ctx.navn ?? "",
    produkter: ctx.produkter ?? "",
    periode: ctx.periode ?? "",
    sted: ctx.sted ?? "",
    betaling: ctx.betaling ?? "",
    total: ctx.total != null && Number.isFinite(ctx.total) ? `${Math.round(ctx.total).toLocaleString("da-DK")} kr` : "",
    telefon: ctx.telefon ?? "",
    ansvarlig: ctx.ansvarlig ?? "",
    hilsen: ctx.hilsen || "Lejhøjtaler.dk",
    besked: ctx.besked ?? "",
  };

  const subject = renderTemplate(settings.confirmation.subject, vars).trim() || "Din booking er bekræftet";
  const body = renderTemplate(settings.confirmation.body, vars);
  const html = `<div style="font-family:sans-serif;max-width:480px;color:#111;">
${textToHtml(body)}
${FOOTER}
</div>`;

  return { subject, html };
}
