/** DJ-timer afregnes inklusive moms. Pult, lys og anlæg vælges som separate lejeprodukter. */
import { isSeasonActive, seasonById } from "./seasons";

export const DJ_DAY_RATE = 1000;
export const DJ_NIGHT_RATE = 1500;
/** Julefrokost-sæsonen, samme vindue som SEASONS.julefrokost. */
export const DJ_PEAK_MULT = 1.2;
/** Levering, opsætning og nedtagning er med i DJ-prisen (levering_begge). */
export const DJ_DELIVERY_KR = 795;
export const DJ_ID = "dj_musikafvikler";
export const DJ_LIGHT_IDS = ["lyseffekt", "lys"] as const;

export interface DjHours { before23: number; after23: number; from?: string; to?: string }
export const DJ_DEFAULT: DjHours = { before23: 3, after23: 0, from: "18:00", to: "21:00" };

export const DJ_GEAR_IDS = ["dj_pult", "dj_pakke_lille", "dj_pakke_mellem", "dj_pakke_stor"] as const;
export const DJ_GEAR_GUESTS: Record<(typeof DJ_GEAR_IDS)[number], { da: string; en: string }> = {
  dj_pult: { da: "Kun pult. I har selv anlæg", en: "Controller only. You have speakers" },
  dj_pakke_lille: { da: "Op til ca. 40 gæster", en: "Up to about 40 guests" },
  dj_pakke_mellem: { da: "Ca. 40–80 gæster", en: "About 40–80 guests" },
  dj_pakke_stor: { da: "Ca. 80–150 gæster", en: "About 80–150 guests" },
};

export function isDjGear(id: string | null | undefined): boolean {
  return !!id && (DJ_GEAR_IDS as readonly string[]).includes(id);
}
export function isDjLight(id: string | null | undefined): boolean {
  return !!id && (DJ_LIGHT_IDS as readonly string[]).includes(id);
}
export function requireDjGear(ids: string[]) {
  if (ids.includes(DJ_ID) && !ids.some(isDjGear)) throw new Error("Vælg en DJ-pult eller DJ-udstyrspakke til DJ-timerne");
}

/** Kalenderdag fra booking (pickupDay) eller ISO-tidspunkt. */
export function dateFromDay(day?: string | null, iso?: string | null): Date | null {
  if (day && /^\d{4}-\d{2}-\d{2}$/.test(day)) {
    const [y, m, d] = day.split("-").map(Number);
    return new Date(y, m - 1, d, 12, 0, 0);
  }
  if (iso) {
    const t = new Date(iso);
    return Number.isNaN(t.getTime()) ? null : t;
  }
  return null;
}

export function isDjPeak(date?: Date | null): boolean {
  if (!date || Number.isNaN(date.getTime())) return false;
  const s = seasonById("julefrokost");
  return !!s && isSeasonActive(s, date);
}

function clockFromMinutes(total: number): string {
  const n = ((total % (24 * 60)) + 24 * 60) % (24 * 60);
  const h = Math.floor(n / 60);
  const min = n % 60;
  return `${String(h).padStart(2, "0")}:${String(min).padStart(2, "0")}`;
}

/** Udfyld start/slut ud fra hele timer, så URL uden djFrom stadig viser uret. */
export function rangeFromHours(h: DjHours): DjHours {
  if (h.from && h.to) {
    const ranged = djHoursFromRange(h.from, h.to);
    if (ranged) return ranged;
  }
  const start = h.after23 > 0 ? (23 - h.before23) * 60 : 18 * 60;
  const end = start + (h.before23 + h.after23) * 60;
  return { ...h, from: clockFromMinutes(start), to: clockFromMinutes(end) };
}

export function djRates(date?: Date | null) {
  const peak = isDjPeak(date);
  const m = peak ? DJ_PEAK_MULT : 1;
  return { peak, day: Math.round(DJ_DAY_RATE * m), night: Math.round(DJ_NIGHT_RATE * m) };
}

function clockMinutes(t: string): number | null {
  const m = /^(\d{1,2}):(\d{2})$/.exec(t);
  if (!m) return null;
  const h = Number(m[1]);
  const min = Number(m[2]);
  if (h > 23 || min > 59) return null;
  return h * 60 + min;
}

/** Split start/slut ved kl. 23. Går over midnat. Mindst 3 timer. */
export function djHoursFromRange(from: string, to: string): DjHours | null {
  const start = clockMinutes(from);
  let end = clockMinutes(to);
  if (start == null || end == null || start === end) return null;
  if (end < start) end += 24 * 60;
  const dayEnd = 23 * 60;
  const totalMins = end - start;
  const totalHours = Math.ceil(totalMins / 60);
  if (totalHours < 3 || totalHours > 24) return null;
  const dayMins = start < dayEnd ? Math.max(0, Math.min(end, dayEnd) - start) : 0;
  const before23 = Math.min(totalHours, Math.round(dayMins / 60));
  return { before23, after23: totalHours - before23, from, to };
}

export function priceDj(value: unknown, date?: Date | null): {
  hours: number;
  total: number;
  before23: number;
  after23: number;
  peak: boolean;
  dayRate: number;
  nightRate: number;
  delivery: number;
  labour: number;
} {
  const v = value as DjHours | null;
  if (
    !v ||
    !Number.isInteger(v.before23) ||
    !Number.isInteger(v.after23) ||
    v.before23 < 0 ||
    v.after23 < 0 ||
    v.before23 + v.after23 < 3 ||
    v.before23 + v.after23 > 24
  ) {
    throw new Error("DJ: vælg 3–24 hele timer i alt");
  }
  const r = djRates(date);
  const hours = v.before23 + v.after23;
  const labour = v.before23 * r.day + v.after23 * r.night;
  return {
    before23: v.before23,
    after23: v.after23,
    hours,
    peak: r.peak,
    dayRate: r.day,
    nightRate: r.night,
    delivery: DJ_DELIVERY_KR,
    labour,
    total: labour + DJ_DELIVERY_KR,
  };
}

export function djLabel(v: DjHours, locale: "da" | "en" = "da", date?: Date | null) {
  const p = priceDj(v, date);
  const tid =
    v.from && v.to
      ? locale === "en"
        ? `${v.from}–${v.to}`
        : `kl. ${v.from.replace(/:00$/, "").replace(":", ".")}–${v.to.replace(/:00$/, "").replace(":", ".")}`
      : locale === "en"
        ? `${p.before23} before 23:00, ${p.after23} after 23:00`
        : `${p.before23} før kl. 23, ${p.after23} efter kl. 23`;
  return locale === "en"
    ? `DJ/music host, ${p.hours} hours (${tid}). Delivery, setup and collection included`
    : `DJ/musikafvikler, ${p.hours} timer (${tid}). Inkl. levering, opsætning og nedtagning`;
}
