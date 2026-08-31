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

/**
 * En enkelt dato der opfører sig anderledes end sin ugedag.
 *
 * Begge veje: en ekstra åbningsdag (30. december, så nytårsgæsterne kan hente)
 * eller en lukket dag (helligdag, ferie). Noten er til kunden og står i
 * checkout ved siden af datoen.
 */
export interface HoursException {
  /** "YYYY-MM-DD" */
  date: string;
  closed: boolean;
  open: string;
  close: string;
  purpose: DayPurpose;
  /** Fx "Nytår — hent 30. dec". Tom er fint. */
  note: string;
}

/**
 * Afhentning uden for åbningstid var et betalt tilvalg her (6.30–21 mod 50 kr).
 * Frederik 25. august 2026: der er ikke mulighed for at komme uden for
 * åbningstiden — heller ikke mod ekstra betaling. Feltet er fjernet frem for at
 * stå og love noget vi ikke holder; ligger det stadig i KV, springes det over.
 */
export interface OpeningHours {
  days: Record<Weekday, DayHours>;
  /** Linjen under tiderne — fx "Andre tidspunkter efter aftale" */
  other: string;
  /** Datoer der slår ugedagen ud, sorteret efter dato */
  exceptions: HoursException[];
  /**
   * Teknisk indstilling: må kunden kun vælge datoer vi har åbent?
   *
   * Slået fra som standard, fordi det altid har været muligt at vælge en
   * hvilken som helst dato og aftale tidspunktet i kommentarfeltet. Slår man
   * den til, kan kalenderen i checkout kun vælge åbne dage og de særlige
   * datoer — så er åbningstiderne ikke længere kun information.
   */
  onlyOpenDays: boolean;
  /**
   * Tidligste startdato ("YYYY-MM-DD"). Tom = ingen spærre.
   *
   * Til de uger hvor vi ikke kan levere: er udstyret på et andet job, er
   * lageret ikke klar, eller er Frederik væk, skal kunden ikke kunne vælge
   * en startdato i den periode overhovedet. En spærret dato pr. produkt
   * (/admin/lager) svarer ikke på det — det her er hele butikken lukket for
   * nye lejeperioder frem til datoen.
   *
   * Kun STARTdatoen. En igangværende leje afleveres som aftalt, og
   * returdatoen ligger altid efter afhentningen.
   */
  earliestPickup: string;
}

const LUKKET: DayHours = { closed: true, open: "10:00", close: "16:00", purpose: "" };

/**
 * Sådan har det været siden starten: åbent fredag eftermiddag og mandag.
 * Begge dage kan bruges til både afhentning og aflevering — derfor står der
 * ikke noget formål på dem. Alt andet aftales i kommentarfeltet.
 */
export const DEFAULT_OPENING_HOURS: OpeningHours = {
  days: {
    mon: { closed: false, open: "15:00", close: "17:00", purpose: "" },
    tue: { ...LUKKET },
    wed: { ...LUKKET },
    thu: { ...LUKKET },
    fri: { closed: false, open: "14:00", close: "18:00", purpose: "" },
    sat: { ...LUKKET },
    sun: { ...LUKKET },
  },
  other: "Andre tidspunkter vælges direkte i bookingen.",
  exceptions: [],
  onlyOpenDays: false,
  earliestPickup: "",
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
 * Sætning til brødtekst. Uden formål på dagene: "Åbent mandag 15–17 og fredag
 * 14–18." Har en dag et formål, nævnes det: "Afhentning fredag 14–18."
 */
export function formatSentence(hours: OpeningHours, locale: "da" | "en" = "da"): string {
  const dage = openDays(hours);
  if (dage.length === 0) return "";

  const listeSammen = (dele: string[]) =>
    dele.length > 1
      ? `${dele.slice(0, -1).join(", ")} ${locale === "en" ? "and" : "og"} ${dele[dele.length - 1]}`
      : dele[0];

  // Det almindelige tilfælde: ingen af dagene har et formål, fordi man kan både
  // hente og aflevere på dem alle
  if (dage.every((d) => !d.purpose)) {
    // Dansk skriver ugedage med lille, engelsk med stort
    const dele = dage.map((d) => {
      const navn = dayName(d.day, locale);
      return `${locale === "en" ? navn : navn.toLowerCase()} ${formatRange(d, locale)}`;
    });
    return `${locale === "en" ? "Open" : "Åbent"} ${listeSammen(dele)}.`;
  }

  const parts = dage.map((d) => {
    const p = purposeName(d.purpose, locale);
    const dag = dayName(d.day, locale).toLowerCase();
    const tid = formatRange(d, locale);
    if (!p) return locale === "en" ? `open ${dag} ${tid}` : `åbent ${dag} ${tid}`;
    return `${p} ${dag} ${tid}`;
  });
  const sentence = parts.join(", ");
  return sentence.charAt(0).toUpperCase() + sentence.slice(1) + ".";
}

/* ─────────────────────────── datoer ─────────────────────────── */

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export function isIsoDate(value: string): boolean {
  return ISO_DATE.test(value) && !isNaN(new Date(`${value}T12:00:00Z`).getTime());
}

/** Ugedagen for en ISO-dato. Læses i UTC, så en tidszone ikke flytter dagen. */
export function weekdayOf(isoDate: string): Weekday {
  const d = new Date(`${isoDate.slice(0, 10)}T12:00:00Z`);
  // getUTCDay: 0 = søndag
  return WEEKDAYS[(d.getUTCDay() + 6) % 7];
}

export interface ResolvedDay extends DayHours {
  date: string;
  day: Weekday;
  /** Sat når en særlig dato bestemmer tiderne i stedet for ugedagen */
  exception: HoursException | null;
}

/**
 * Hvad gælder på en bestemt dato: ugedagens tider, medmindre der er en
 * undtagelse — den vinder altid, både når den åbner og når den lukker.
 */
export function hoursForDate(hours: OpeningHours, isoDate: string): ResolvedDay {
  const date = isoDate.slice(0, 10);
  const day = weekdayOf(date);
  const exception = hours.exceptions.find((e) => e.date === date) ?? null;
  const base = exception
    ? { closed: exception.closed, open: exception.open, close: exception.close, purpose: exception.purpose }
    : hours.days[day];
  return { date, day, exception, ...base };
}

export function isOpenOn(hours: OpeningHours, isoDate: string): boolean {
  return !hoursForDate(hours, isoDate).closed;
}

/**
 * Ligger datoen før den tidligste startdato? Så kan lejen ikke begynde der.
 *
 * Både kalenderen i checkout og /api/book spørger her, så en kunde ikke kan
 * sende en spærret dato uden om knapperne.
 */
export function isBeforeEarliestPickup(hours: OpeningHours, isoDate: string): boolean {
  if (!hours.earliestPickup) return false;
  return isoDate.slice(0, 10) < hours.earliestPickup;
}

/** "Fredag 14–18 (afhentning)" — eller "30. dec 14–18 (afhentning)" for en særlig dato */
export function formatDateLine(hours: OpeningHours, isoDate: string, locale: "da" | "en" = "da"): string {
  const r = hoursForDate(hours, isoDate);
  // En særlig dato nævnes ved sin dato ("30. dec"), en almindelig ved sin ugedag
  const hvornår = r.exception ? formatShortDate(r.date, locale) : dayName(r.day, locale);
  if (r.closed) {
    return locale === "en" ? `${hvornår}: closed` : `${hvornår}: lukket`;
  }
  const p = purposeName(r.purpose, locale);
  return `${hvornår} ${formatRange(r, locale)}${p ? ` (${p})` : ""}`;
}

/** "30. dec" / "Dec 30" */
export function formatShortDate(isoDate: string, locale: "da" | "en" = "da"): string {
  const d = new Date(`${isoDate.slice(0, 10)}T12:00:00Z`);
  if (isNaN(d.getTime())) return isoDate;
  return d
    .toLocaleDateString(locale === "en" ? "en-GB" : "da-DK", {
      day: "numeric",
      month: "short",
      timeZone: "UTC",
    })
    // Dansk skriver "30. dec." — punktummet klodser når datoen efterfølges af
    // tider eller kolon ("30. dec.: lukket")
    .replace(/\.$/, "");
}

/** Særlige datoer fra i dag og frem — det er dem kunden skal kende */
export function upcomingExceptions(
  hours: OpeningHours,
  todayIso: string,
  days = 120,
): HoursException[] {
  const until = new Date(`${todayIso}T12:00:00Z`);
  until.setUTCDate(until.getUTCDate() + days);
  const max = until.toISOString().slice(0, 10);
  return hours.exceptions
    .filter((e) => e.date >= todayIso && e.date <= max)
    .sort((a, b) => a.date.localeCompare(b.date));
}

/* ─────────────────────────── tidsrum ─────────────────────────── */

/**
 * Hvornår på dagen kunden vil hente eller aflevere.
 *
 * Før stod der "andre tidspunkter efter aftale — skriv i kommentarfeltet", og
 * så ringede vi frem og tilbage bagefter. Nu deler vi åbningstiden i to, så
 * kunden kan sige før eller efter middag — eller lade være.
 *
 * Alle valg ligger INDEN FOR åbningstiden. Vi møder ikke uden for den, heller
 * ikke mod betaling (Frederik, 25. august 2026), så et tidsrum uden for
 * tiderne ville være et løfte vi ikke kan holde.
 *
 *   early   første halvdel af dagen
 *   late    anden halvdel
 *   unknown ved det ikke endnu — VALGT PÅ FORHÅND, så tidsvalget ikke koster
 *           kunden et klik, og vi kun får et signal når han selv giver det
 */
export type TimeSlotId = "early" | "late" | "unknown";

export const TIME_SLOT_IDS: TimeSlotId[] = ["early", "late", "unknown"];

export interface TimeSlot {
  id: TimeSlotId;
  /** Teksten på knappen — "Før 12" */
  label: string;
  /** Selve tidsrummet under teksten — "9.30–12". Tom når vi ikke ved det. */
  window: string;
}

/** Middag deler dagen, hvis åbningstiden strækker sig hen over den */
const MIDDAG = "12:00";

/**
 * En åbningstid skal have en vis længde, før det giver mening at dele den.
 * Mandag 15–17 er ikke et valg, det er en aftale — der er intet at spørge om.
 */
const MINDSTE_VINDUE_MIN = 180;

/** Minutter siden midnat tilbage til "HH:MM" */
function timeOf(minutes: number): string {
  const t = Math.max(0, Math.min(24 * 60 - 1, Math.round(minutes)));
  return `${String(Math.floor(t / 60)).padStart(2, "0")}:${String(t % 60).padStart(2, "0")}`;
}

/**
 * De tidsrum kunden kan vælge på en bestemt dato.
 *
 * Tom liste betyder "intet at spørge om": dagen er lukket, eller åbningstiden
 * er så kort, at der ikke er to halvdele at vælge imellem. Så vises der ingen
 * knapper — et valg med ét svar er kun støj i checkout.
 */
export function timeSlots(
  hours: OpeningHours,
  isoDate: string,
  locale: "da" | "en" = "da",
): TimeSlot[] {
  const r = hoursForDate(hours, isoDate);
  if (r.closed) return [];

  const åbn = minutesOf(r.open);
  const luk = minutesOf(r.close);
  if (luk - åbn < MINDSTE_VINDUE_MIN) return [];

  const en = locale === "en";
  const tid = (t: string) => formatTime(t, locale);

  // Deler åbningstiden sig omkring middag, er "før/efter 12" det, kunden selv
  // ville sige. Ellers deler vi på midten og taler om først og sidst på dagen.
  const middag = minutesOf(MIDDAG);
  const omMiddag = åbn < middag && middag < luk;
  const skel = omMiddag ? MIDDAG : timeOf(Math.round((åbn + luk) / 2 / 30) * 30);

  return [
    {
      id: "early",
      label: omMiddag ? `${en ? "Before" : "Før"} ${tid(MIDDAG)}` : en ? "Earlier in the day" : "Først på dagen",
      window: `${tid(r.open)}–${tid(skel)}`,
    },
    {
      id: "late",
      label: omMiddag ? `${en ? "After" : "Efter"} ${tid(MIDDAG)}` : en ? "Later in the day" : "Sidst på dagen",
      window: `${tid(skel)}–${tid(r.close)}`,
    },
    {
      id: "unknown",
      label: en ? "I don't know yet" : "Ved jeg ikke endnu",
      window: "",
    },
  ];
}

/**
 * Det tidsrum der er valgt på forhånd: "ved jeg ikke endnu".
 *
 * Ingen af valgene koster noget, og ingen af dem er påkrævede — så skal vi
 * ikke lægge kunden et svar i munden. Vælger han selv, ved vi noget; gør han
 * ikke, har det ikke kostet ham et klik.
 */
export function defaultTimeSlot(): TimeSlotId {
  return "unknown";
}

/** Findes tidsrummet på datoen? Ellers falder vi tilbage på standardvalget. */
export function resolveTimeSlot(
  hours: OpeningHours,
  isoDate: string,
  slot: string | null | undefined,
): TimeSlotId {
  return timeSlots(hours, isoDate).some((s) => s.id === slot) ? (slot as TimeSlotId) : defaultTimeSlot();
}

/**
 * Tidsrummet som én linje til mails, lejesedlen og admin — "Før 12 (9.30–12)".
 * Tom når der intet er valgt, så en gammel booking ikke får en tom række.
 */
export function formatTimeSlot(
  hours: OpeningHours,
  isoDate: string,
  slot: string | null | undefined,
  locale: "da" | "en" = "da",
): string {
  const match = timeSlots(hours, isoDate, locale).find((s) => s.id === slot);
  if (!match) return "";
  return match.window ? `${match.label} (${match.window})` : match.label;
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

  const rawEx = (raw as { exceptions?: unknown }).exceptions;
  const exceptions: HoursException[] = [];
  const seen = new Set<string>();
  if (Array.isArray(rawEx)) {
    for (const item of rawEx) {
      const e = normalizeException(item);
      // Én undtagelse pr. dato — den første vinder, så et dubleret felt i KV
      // ikke gør det uforudsigeligt hvilke tider der gælder
      if (e && !seen.has(e.date)) {
        seen.add(e.date);
        exceptions.push(e);
      }
    }
  }
  exceptions.sort((a, b) => a.date.localeCompare(b.date));

  return {
    days: out,
    other,
    exceptions,
    onlyOpenDays: (raw as { onlyOpenDays?: unknown }).onlyOpenDays === true,
    earliestPickup: normalizeEarliestPickup((raw as { earliestPickup?: unknown }).earliestPickup),
  };
}

/** En ugyldig dato er ingen spærre — vi lukker ikke butikken på en tastefejl */
function normalizeEarliestPickup(input: unknown): string {
  const date = String(input ?? "").slice(0, 10);
  return isIsoDate(date) ? date : "";
}

function normalizeException(input: unknown): HoursException | null {
  if (!input || typeof input !== "object") return null;
  const raw = input as Partial<HoursException>;
  const date = String(raw.date ?? "").slice(0, 10);
  if (!isIsoDate(date)) return null;
  const open = typeof raw.open === "string" && isTime(raw.open) ? raw.open : "14:00";
  const closeRaw = typeof raw.close === "string" && isTime(raw.close) ? raw.close : "18:00";
  const close = minutesOf(closeRaw) > minutesOf(open) ? closeRaw : "18:00";
  return {
    date,
    closed: raw.closed === true,
    open,
    close: minutesOf(close) > minutesOf(open) ? close : "23:00",
    purpose: DAY_PURPOSES.includes(raw.purpose as DayPurpose) ? (raw.purpose as DayPurpose) : "",
    note: typeof raw.note === "string" ? raw.note.trim().slice(0, 120) : "",
  };
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

  // Særlige datoer: fx 30. december åben, eller en helligdag lukket
  const rawEx = (raw as { exceptions?: unknown }).exceptions;
  const exceptions: HoursException[] = [];
  if (rawEx !== undefined) {
    if (!Array.isArray(rawEx)) return { ok: false, error: "Særlige datoer skal være en liste" };
    if (rawEx.length > 60) return { ok: false, error: "Højst 60 særlige datoer" };
    const seen = new Set<string>();
    for (const item of rawEx as Array<Partial<HoursException>>) {
      const date = String(item?.date ?? "").slice(0, 10);
      if (!isIsoDate(date)) return { ok: false, error: `Ugyldig dato: "${item?.date ?? ""}"` };
      if (seen.has(date)) return { ok: false, error: `${formatShortDate(date)} står to gange` };
      seen.add(date);
      const closed = item?.closed === true;
      const open = String(item?.open ?? "");
      const close = String(item?.close ?? "");
      if (!isTime(open) || !isTime(close)) {
        return { ok: false, error: `${formatShortDate(date)}: tiderne skal være HH:MM (fx 14:00)` };
      }
      if (!closed && minutesOf(close) <= minutesOf(open)) {
        return { ok: false, error: `${formatShortDate(date)}: lukketid skal være efter åbningstid` };
      }
      if (!DAY_PURPOSES.includes((item?.purpose ?? "") as DayPurpose)) {
        return { ok: false, error: `${formatShortDate(date)}: ukendt formål` };
      }
      exceptions.push({
        date,
        closed,
        open,
        close,
        purpose: (item?.purpose ?? "") as DayPurpose,
        note: typeof item?.note === "string" ? item.note.trim().slice(0, 120) : "",
      });
    }
    exceptions.sort((a, b) => a.date.localeCompare(b.date));
  }

  // Tidligste startdato: tom er fint (ingen spærre), men står der noget, skal
  // det være en rigtig dato — ellers har Frederik troet han lukkede for
  // bookinger uden at have gjort det
  const rawEarliest = (raw as { earliestPickup?: unknown }).earliestPickup;
  const earliestPickup = String(rawEarliest ?? "").slice(0, 10);
  if (earliestPickup && !isIsoDate(earliestPickup)) {
    return { ok: false, error: `Ugyldig tidligste startdato: "${earliestPickup}"` };
  }

  return {
    ok: true,
    hours: {
      days: out,
      other,
      exceptions,
      onlyOpenDays: (raw as { onlyOpenDays?: unknown }).onlyOpenDays === true,
      earliestPickup,
    },
  };
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
