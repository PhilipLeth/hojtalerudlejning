/* ───── SMS-skabeloner ─────
 *
 * Samme model som mailskabelonen i commTemplates.ts: teksten ligger i KV, så
 * den kan rettes i /admin/kommunikation uden deploy, og shortcodes udfyldes fra
 * bookingen. En SMS koster penge pr. besked, så hver type kan slås til og fra
 * hver for sig — og alle er slået fra i praksis, indtil SMS_API_TOKEN er sat.
 *
 * Filen bruges både i browseren og i Pages Functions og holder sig derfor til
 * relative imports.
 */

import { renderWithKeys, type Shortcode, type TemplateVars } from "./commTemplates";
import { gsmSafe, smsLength, type SmsLength } from "./sms";

export const KV_SMS_SETTINGS = "sms_settings";

/**
 * Hvor udstyret hentes, når vi ikke kører ud med det. Kort skrevet — adressen
 * skal kunne stå i en besked på 160 tegn sammen med resten.
 */
/**
 * Standardadressen i SMS-skabelonerne. Den levende adresse kommer fra
 * /admin/indstillinger — se functions/api/_lib/sms.ts, der sætter den ind.
 */
export const PICKUP_ADDRESS = "Vermlandsgade 66, 2300 København";

export type SmsTypeId =
  | "booking_modtaget"
  | "bekraeftet"
  | "afhentning_i_morgen"
  | "retur_i_morgen"
  | "tak";

export interface SmsTypeDef {
  id: SmsTypeId;
  label: string;
  /** Hvornår den går ud — vises i admin, så ingen er i tvivl */
  trigger: string;
}

export const SMS_TYPES: SmsTypeDef[] = [
  {
    id: "booking_modtaget",
    label: "Booking modtaget",
    trigger: "Straks når kunden har bestilt — oven i bekræftelsesmailen",
  },
  {
    id: "bekraeftet",
    label: "Booking bekræftet",
    trigger: "Når du sætter ordren til »bekræftet«",
  },
  {
    id: "afhentning_i_morgen",
    label: "Afhentning i dag",
    trigger: "Kl. 9 på afhentningsdagen",
  },
  {
    id: "retur_i_morgen",
    label: "Aflevering i dag",
    trigger: "Kl. 9 på afleveringsdagen",
  },
  {
    id: "tak",
    label: "Tak + anmeldelse",
    trigger: "Når du sætter ordren til »afleveret«",
  },
];

const TYPE_IDS = new Set<string>(SMS_TYPES.map((t) => t.id));

export function isSmsType(v: unknown): v is SmsTypeId {
  return typeof v === "string" && TYPE_IDS.has(v);
}

/** Beskeder der ikke kommer fra en skabelon, men stadig skal stå i loggen */
const EXTRA_LABELS: Record<string, string> = {
  manuel: "Skrevet i hånden",
  test: "Testbesked",
};

export function smsTypeLabel(id: string): string {
  return SMS_TYPES.find((t) => t.id === id)?.label ?? EXTRA_LABELS[id] ?? id;
}

// ---------------------------------------------------------------- shortcodes

export const SMS_SHORTCODES: Shortcode[] = [
  { key: "fornavn", label: "Kundens fornavn", example: "Agnes" },
  { key: "navn", label: "Kundens fulde navn", example: "Agnes Dahle Stæhr" },
  { key: "produkter", label: "Hvad de lejer", example: "Stor højtalerpakke, Lys-pakke" },
  { key: "periode", label: "Lejeperioden", example: "fre 21. aug → man 24. aug" },
  { key: "dato", label: "Afhentningsdagen", example: "fre 21. aug" },
  { key: "returdato", label: "Afleveringsdagen", example: "man 24. aug" },
  { key: "sted", label: "Levering eller afhentning, med adresse", example: `Hentes hos os: ${PICKUP_ADDRESS}` },
  { key: "telefon", label: "Vores telefonnummer", example: "31 13 28 52" },
  { key: "total", label: "Ordrens pris", example: "1.995 kr" },
  { key: "link", label: "Link til Google-anmeldelse", example: "https://g.page/r/…/review" },
];

const SMS_KEYS = new Set(SMS_SHORTCODES.map((s) => s.key));

// ---------------------------------------------------------------- indstillinger

export interface SmsTemplateSetting {
  enabled: boolean;
  text: string;
}

export interface SmsSettings {
  /** Hovedafbryder — slukket betyder at ingen automatisk SMS går ud */
  enabled: boolean;
  /** Afsendernavn hos GatewayAPI: max 11 tegn, kun bogstaver og tal */
  sender: string;
  templates: Record<SmsTypeId, SmsTemplateSetting>;
}

/**
 * Standardtekster. Holdt inden for 160 tegn på en typisk ordre, så én besked
 * er én besked — og uden emoji, fordi et enkelt emoji halverer grænsen til 70.
 */
export const DEFAULT_SMS_SETTINGS: SmsSettings = {
  enabled: true,
  sender: "Lejhojtaler",
  templates: {
    // Mailen dækker det samme, så den er slukket som udgangspunkt
    booking_modtaget: {
      enabled: false,
      text: "Hej {{fornavn}}! Tak for din booking: {{produkter}}, {{periode}}. Vi bekræfter hurtigst muligt. Ring {{telefon}} ved spørgsmål.",
    },
    bekraeftet: {
      enabled: true,
      text: "Hej {{fornavn}}! Din booking er bekræftet: {{produkter}}, {{periode}}. Ring {{telefon}} hvis noget ændrer sig. /Lejhøjtaler.dk",
    },
    afhentning_i_morgen: {
      enabled: true,
      text: "Hej {{fornavn}}! I dag ({{dato}}) står {{produkter}} klar. {{sted}}. Ring {{telefon}} ved ændringer.",
    },
    retur_i_morgen: {
      enabled: true,
      text: "Hej {{fornavn}}! Husk at {{produkter}} skal afleveres i dag ({{returdato}}). Mangler I mere tid, så ring {{telefon}}. /Lejhøjtaler.dk",
    },
    // Anmeldelsesmailen sendes allerede ved retur — SMS oveni er et tilvalg
    tak: {
      enabled: false,
      text: "Tak for denne gang, {{fornavn}}! Vil du bruge 30 sekunder på en anmeldelse? {{link}} Det betyder meget for os. /Lejhøjtaler.dk",
    },
  },
};

function cleanSmsText(v: unknown, fallback: string): string {
  const s = typeof v === "string" ? v.trim() : "";
  if (!s) return fallback;
  // 480 tegn = tre beskeder. Længere er næsten altid en fejl.
  return s.slice(0, 480);
}

export function parseSmsSettings(raw: unknown): SmsSettings {
  const obj = (raw ?? {}) as Partial<SmsSettings>;
  const templatesRaw = (obj.templates ?? {}) as Partial<Record<SmsTypeId, Partial<SmsTemplateSetting>>>;

  const templates = {} as Record<SmsTypeId, SmsTemplateSetting>;
  for (const def of SMS_TYPES) {
    const fallback = DEFAULT_SMS_SETTINGS.templates[def.id];
    const t = templatesRaw[def.id] ?? {};
    templates[def.id] = {
      enabled: typeof t.enabled === "boolean" ? t.enabled : fallback.enabled,
      text: cleanSmsText(t.text, fallback.text),
    };
  }

  const sender = String(obj.sender ?? "").replace(/[^A-Za-z0-9]/g, "").slice(0, 11);

  return {
    enabled: obj.enabled !== false,
    sender: sender || DEFAULT_SMS_SETTINGS.sender,
    templates,
  };
}

// ---------------------------------------------------------------- rendering

/** Bookingen som SMS-laget har brug for at kende den */
export interface SmsBooking {
  name?: unknown;
  phone?: unknown;
  period?: unknown;
  pickup?: unknown;
  returnDate?: unknown;
  total?: unknown;
  speaker?: unknown;
  speakerId?: unknown;
  cartItems?: unknown;
  addons?: unknown;
  addonIds?: unknown;
  deliveryOptionId?: unknown;
  deliveryAddress?: unknown;
}

/** Hvad kunden lejer, som læsbar tekst */
export function bookingProductNames(b: SmsBooking): string {
  const names: string[] = [];
  if (b.speaker && b.speakerId !== "effects-only") names.push(String(b.speaker));
  for (const item of (b.cartItems as Array<{ name?: string }>) || []) {
    if (item?.name) names.push(String(item.name));
  }
  for (const a of (b.addons as string[]) || []) {
    if (a) names.push(String(a));
  }
  return [...new Set(names)].join(", ");
}

function formatDay(raw: unknown): string {
  const s = String(raw ?? "").slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return "";
  const d = new Date(`${s}T12:00:00`);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString("da-DK", { weekday: "short", day: "numeric", month: "short" });
}

/**
 * Levering eller afhentning i klartekst. Kører vi ud, er adressen kundens; ellers
 * er det vores — en påmindelse uden sted er ubrugelig i begge tilfælde.
 */
export function placeLine(b: SmsBooking, pickupAddress?: string): string {
  const ids = new Set<string>([
    ...(b.deliveryOptionId ? [String(b.deliveryOptionId)] : []),
    ...((b.addonIds as string[]) || []).map(String),
  ]);
  const delivers = ids.has("levering_ud") || ids.has("levering_begge") || ids.has("levering_opsaetning");
  const address = String(b.deliveryAddress ?? "").trim();

  if (delivers || (!ids.has("afhentning_retur") && address)) {
    return address ? `Vi leverer til ${address}` : "Vi leverer som aftalt";
  }
  return `Hentes hos os: ${pickupAddress || PICKUP_ADDRESS}`;
}

export interface SmsVarOptions {
  /** Vores nummer, som kunden skal ringe til */
  telefon?: string;
  /** Link til Google-anmeldelse */
  link?: string;
  /** Afhentningsadressen fra /admin/indstillinger */
  afhentningsadresse?: string;
}

export function smsVarsFor(b: SmsBooking, opts: SmsVarOptions = {}): TemplateVars {
  const navn = String(b.name ?? "").trim();
  const total = Number(b.total);
  return {
    fornavn: navn.split(" ")[0] || navn,
    navn,
    produkter: bookingProductNames(b),
    periode: String(b.period ?? ""),
    dato: formatDay(b.pickup),
    returdato: formatDay(b.returnDate),
    sted: placeLine(b, opts.afhentningsadresse),
    telefon: opts.telefon ?? "31 13 28 52",
    total: Number.isFinite(total) && total > 0 ? `${total.toLocaleString("da-DK")} kr` : "",
    link: opts.link ?? "",
  };
}

/**
 * Skabelon + værdier → færdig SMS. En tom shortcode må ikke efterlade dobbelte
 * mellemrum eller et hængende komma midt i beskeden, så teksten strammes op til
 * sidst.
 */
export function renderSms(text: string, vars: TemplateVars): string {
  return gsmSafe(renderWithKeys(text, SMS_KEYS, vars))
    // Linjeskift koster tegn uden at give noget i en SMS
    .replace(/[ \t]*\n[ \t]*/g, " ")
    // En tom shortcode må ikke efterlade "()" eller ", ," midt i beskeden
    .replace(/\(\s*\)/g, "")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/ ([,.!?:])/g, "$1")
    .replace(/([,.:])\1+/g, "$1")
    .trim();
}

export interface BuiltSms {
  type: SmsTypeId;
  text: string;
  length: SmsLength;
}

/** Beskeden som den ville blive sendt — bruges både af serveren og af admins forhåndsvisning */
export function buildSms(settings: SmsSettings, type: SmsTypeId, vars: TemplateVars): BuiltSms {
  const tpl = settings.templates[type] ?? DEFAULT_SMS_SETTINGS.templates[type];
  const text = renderSms(tpl.text, vars);
  return { type, text, length: smsLength(text) };
}

/** Skal denne type sendes automatisk? Hovedafbryderen slår alt fra på én gang. */
export function smsAutoEnabled(settings: SmsSettings, type: SmsTypeId): boolean {
  if (!settings.enabled) return false;
  return !!settings.templates[type]?.enabled;
}

export interface SmsLogEntry {
  type: string;
  label: string;
  to: string;
  sentAt: string;
  note?: string;
}

/**
 * Kommunikationsloggen på ordren. Samme liste som mails, så admin kan se hele
 * korrespondancen på ét sted — teksten med, for en SMS kan ikke slås op andre
 * steder bagefter.
 */
export function smsLogEntry(type: string, to: string, text: string, sentAt = new Date().toISOString()): SmsLogEntry {
  return {
    type: `sms_${type}`,
    label: `SMS: ${smsTypeLabel(type)}`,
    to,
    sentAt,
    note: text.slice(0, 300),
  };
}
