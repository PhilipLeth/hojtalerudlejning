/** Åbningstider, ét sted.
 *
 * Tiderne stod før som tekst i i18n, i tre JSON-LD-blokke og i et par
 * brødtekster — otte kopier af "fredag 14-18". Ændrede Frederik åbningstiden,
 * skulle en udvikler rette dem alle og deploye.
 *
 * Nu er strukturen her, standardtiderne er koden, og admin kan overskrive dem i
 * KV (site_settings.hours) fra /admin/indstillinger. Footeren, "Åbningstider" på
 * forsiden og FAQ'en læser de levende tider; JSON-LD til Google bygges af
 * standardtiderne ved build, fordi statisk HTML ikke kan hente KV — se
 * kommentaren ved openingHoursSpecification().
 */

export type Weekday = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";

export const WEEKDAYS: Weekday[] = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];

/** Hvad dagen bruges til. Et valg frem for fritekst, så det kan oversættes. */
export type DayPurpose = "" | "afhentning" | "aflevering" | "begge";

export const DAY_PURPOSES: DayPurpose[] = ["", "afhentning", "aflevering", "begge"];

export interface DayHours {
  /** Lukket dag — tiderne bevares, så man kan åbne igen uden at tastes forfra */
  closed: boolean;
  /** "HH:MM" i 24-timers format */
  open: string;
  close: string;
  purpose: DayPurpose;
}

export interface OpeningHours {
  days: Record<Weekday, DayHours>;
  /** Linjen under tiderne — fx "Andre tidspunkter efter aftale" */
  other: string;
}

const LUKKET: DayHours = { closed: true, open: "10:00", close: "16:00", purpose: "" };

/**
 * Sådan har det været siden starten: udstyret hentes fredag eftermiddag og
 * kommer tilbage mandag. Alt andet aftales i kommentarfeltet.
 */
export const DEFAULT_OPENING_HOURS: OpeningHours = {
  days: {
    mon: { closed: false, open: "15:00", close: "17:00", purpose: "aflevering" },
    tue: { ...LUKKET },
    wed: { ...LUKKET },
    thu: { ...LUKKET },
    fri: { closed: false, open: "14:00", close: "18:00", purpose: "afhentning" },
    sat: { ...LUKKET },
    sun: { ...LUKKET },
  },
  other: "Andre tidspunkter efter aftale — skriv i kommentarfeltet ved booking.",
};

const DAY_NAMES: Record<Weekday, { da: string; en: string }> = {
  mon: { da: "Mandag", en: "Monday" },
  tue: { da: "Tirsdag", en: "Tuesday" },
  wed: { da: "Onsdag", en: "Wednesday" },
  thu: { da: "Torsdag", en: "Thursday" },
  fri: { da: "Fredag", en: "Friday" },
  sat: { da: "Lørdag", en: "Saturday" },
  sun: { da: "Søndag", en: "Sunday" },
};

const PURPOSE_NAMES: Record<Exclude<DayPurpose, "">, { da: string; en: string }> = {
  afhentning: { da: "afhentning", en: "pickup" },
  aflevering: { da: "aflevering", en: "return" },
  begge: { da: "afhentning og aflevering", en: "pickup and return" },
};

export function dayName(day: Weekday, locale: "da" | "en" = "da"): string {
  return DAY_NAMES[day][locale];
}

export function purposeName(purpose: DayPurpose, locale: "da" | "en" = "da"): string {
  return purpose ? PURPOSE_NAMES[purpose][locale] : "";
}

const TIME = /^([01]\d|2[0-3]):([0-5]\d)$/;

export function isTime(value: string): boolean {
  return TIME.test(value);
}

/** Minutter siden midnat — bruges til at holde luk efter åbn */
export function minutesOf(time: string): number {
  const m = TIME.exec(time);
  if (!m) return -1;
  return Number(m[1]) * 60 + Number(m[2]);
}

/**
 * Kort tid til visning: hele timer skrives uden nuller ("14"), halve med komma
 * dansk stil ("14.30"). Engelsk får 12-timers, som en engelsk læser forventer.
 */
export function formatTime(time: string, locale: "da" | "en" = "da"): string {
  const m = TIME.exec(time);
  if (!m) return time;
  const hour = Number(m[1]);
  const min = m[2];
  if (locale === "en") {
    const suffix = hour < 12 ? "AM" : "PM";
    const h12 = hour % 12 === 0 ? 12 : hour % 12;
    return min === "00" ? `${h12} ${suffix}` : `${h12}:${min} ${suffix}`;
  }
  return min === "00" ? String(hour) : `${hour}.${min}`;
}

/** "14–18" — en bindestreg man kan læse, ikke et minustegn */
export function formatRange(day: DayHours, locale: "da" | "en" = "da"): string {
  if (locale === "en") {
    // "2–6 PM" når begge ender er eftermiddag; ellers begge med suffiks
    const a = formatTime(day.open, "en");
    const b = formatTime(day.close, "en");
    const sameHalf = a.slice(-2) === b.slice(-2);
    return sameHalf ? `${a.replace(/ [AP]M$/, "")}–${b}` : `${a}–${b}`;
  }
  return `${formatTime(day.open)}–${formatTime(day.close)}`;
}

export interface OpenDay extends DayHours {
  day: Weekday;
}

/** Dagene der er åbne, mandag først */
export function openDays(hours: OpeningHours): OpenDay[] {
  return WEEKDAYS.filter((d) => !hours.days[d].closed).map((d) => ({ day: d, ...hours.days[d] }));
}

/** "Fredag 14–18 (afhentning)" */
export function formatDayLine(entry: OpenDay, locale: "da" | "en" = "da"): string {
  const p = purposeName(entry.purpose, locale);
  return `${dayName(entry.day, locale)} ${formatRange(entry, locale)}${p ? ` (${p})` : ""}`;
}

/** Alle åbne dage på én linje — til footeren */
export function formatOneLine(hours: OpeningHours, locale: "da" | "en" = "da"): string {
  return openDays(hours).map((d) => formatDayLine(d, locale)).join(" · ");
}

/**
 * Sætning til brødtekst: "Afhentning fredag 14–18, aflevering mandag 15–17."
 * Bygges af dagenes formål, så den følger tiderne i stedet for at gentage dem.
 */
export function formatSentence(hours: OpeningHours, locale: "da" | "en" = "da"): string {
  const parts = openDays(hours).map((d) => {
    const p = purposeName(d.purpose, locale);
    const dag = dayName(d.day, locale).toLowerCase();
    const tid = formatRange(d, locale);
    if (!p) return locale === "en" ? `open ${dag} ${tid}` : `åbent ${dag} ${tid}`;
    return `${p} ${dag} ${tid}`;
  });
  if (parts.length === 0) return "";
  const sentence = parts.join(", ");
  return sentence.charAt(0).toUpperCase() + sentence.slice(1) + ".";
}

/* ─────────────────────────── validering ─────────────────────────── */

function normalizeDay(input: unknown, fallback: DayHours): DayHours {
  if (!input || typeof input !== "object") return { ...fallback };
  const raw = input as Partial<DayHours>;
  const open = typeof raw.open === "string" && isTime(raw.open) ? raw.open : fallback.open;
  const close = typeof raw.close === "string" && isTime(raw.close) ? raw.close : fallback.close;
  const purpose = DAY_PURPOSES.includes(raw.purpose as DayPurpose) ? (raw.purpose as DayPurpose) : "";
  return {
    closed: raw.closed === true,
    open,
    // Luk kan ikke ligge før åbn — så ville dagen være tom
    close: minutesOf(close) > minutesOf(open) ? close : fallback.close,
    purpose,
  };
}

/**
 * Læs åbningstider fra KV eller fra et POST-kald. Alt der ikke kan læses,
 * falder tilbage på standardtiderne — sitet skal vise noget rigtigt, også hvis
 * KV indeholder skrald.
 */
export function normalizeOpeningHours(input: unknown): OpeningHours {
  if (!input || typeof input !== "object") return DEFAULT_OPENING_HOURS;
  const raw = input as { days?: unknown; other?: unknown };
  const days = (raw.days ?? {}) as Record<string, unknown>;
  const out = {} as Record<Weekday, DayHours>;
  for (const day of WEEKDAYS) {
    out[day] = normalizeDay(days[day], DEFAULT_OPENING_HOURS.days[day]);
  }
  const other = typeof raw.other === "string" ? raw.other.trim().slice(0, 200) : DEFAULT_OPENING_HOURS.other;
  return { days: out, other };
}

/**
 * Streng validering til admin-gemning: her SKAL vi sige fra ved en tastefejl,
 * i stedet for stiltiende at gemme standardtiden og lade Frederik tro han
 * rettede den.
 */
export function validateOpeningHours(
  input: unknown,
): { ok: true; hours: OpeningHours } | { ok: false; error: string } {
  if (!input || typeof input !== "object") return { ok: false, error: "Åbningstider mangler" };
  const raw = input as { days?: unknown; other?: unknown };
  if (!raw.days || typeof raw.days !== "object") return { ok: false, error: "Åbningstider mangler dage" };
  const days = raw.days as Record<string, unknown>;

  const out = {} as Record<Weekday, DayHours>;
  for (const day of WEEKDAYS) {
    const value = (days[day] ?? {}) as Partial<DayHours>;
    const closed = value.closed === true;
    const open = String(value.open ?? "");
    const close = String(value.close ?? "");
    if (!isTime(open) || !isTime(close)) {
      return { ok: false, error: `${dayName(day)}: tiderne skal være HH:MM (fx 14:00)` };
    }
    if (!closed && minutesOf(close) <= minutesOf(open)) {
      return { ok: false, error: `${dayName(day)}: lukketid skal være efter åbningstid` };
    }
    if (!DAY_PURPOSES.includes((value.purpose ?? "") as DayPurpose)) {
      return { ok: false, error: `${dayName(day)}: ukendt formål` };
    }
    out[day] = { closed, open, close, purpose: (value.purpose ?? "") as DayPurpose };
  }

  const other = typeof raw.other === "string" ? raw.other.trim().slice(0, 200) : "";
  return { ok: true, hours: { days: out, other } };
}

/* ─────────────────────────── structured data ─────────────────────────── */

const SCHEMA_DAY: Record<Weekday, string> = {
  mon: "Monday",
  tue: "Tuesday",
  wed: "Wednesday",
  thu: "Thursday",
  fri: "Friday",
  sat: "Saturday",
  sun: "Sunday",
};

/**
 * openingHoursSpecification til JSON-LD.
 *
 * Kaldes med DEFAULT_OPENING_HOURS fra siderne, fordi de er statisk eksporteret
 * HTML og ikke kan læse KV. Retter Frederik tiderne i admin, følger sitets
 * synlige tider med det samme, mens Googles strukturerede data først opdateres
 * ved næste deploy — og Google Business Profile skal rettes i hånden. Det står
 * som en note i /admin/indstillinger.
 */
export function openingHoursSpecification(hours: OpeningHours = DEFAULT_OPENING_HOURS) {
  return openDays(hours).map((d) => ({
    "@type": "OpeningHoursSpecification",
    dayOfWeek: SCHEMA_DAY[d.day],
    opens: d.open,
    closes: d.close,
  }));
}
