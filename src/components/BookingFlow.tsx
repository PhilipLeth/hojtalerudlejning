"use client";

import { useState, useMemo, useEffect, useCallback, useRef, FormEvent } from "react";
import { rapporterFejl } from "@/lib/errorReport";
import { type Locale, t } from "@/lib/i18n";

import { dayMultiplier, isSummerSale, applyDiscount, DELIVERY_ADDON_IDS } from "@/lib/products";
import { useProducts } from "@/lib/useProducts";
import { trackBookingFormStart, trackPurchase } from "@/lib/analytics";
import CapacityBadge, { capacityLevel } from "@/components/CapacityBadge";
import { loadStripe } from "@stripe/stripe-js";
import { thumbSrcSet, THUMB_IMAGE_SIZES } from "@/lib/imageSrcSet";
import { useSiteSettings } from "@/lib/useSiteSettings";
import {
  formatAfterHours,
  formatDateLine,
  formatOneLine,
  hoursForDate,
  upcomingExceptions,
  type OpeningHours,
} from "@/lib/openingHours";

/* ───── Helpers ───── */

function dateKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function diffDays(a: Date, b: Date) {
  return Math.round((b.getTime() - a.getTime()) / 86400000);
}

function isSameDay(a: Date, b: Date) {
  return dateKey(a) === dateKey(b);
}

/* ───── Availability ───── */

interface AvailabilityData {
  inventory: Record<string, number>;
  booked: Record<string, number>;
  blocked_dates: Array<{ date: string; reason: string; products: string[] }>;
}

function getRemaining(avail: AvailabilityData | null, product: string): number {
  if (!avail) return 999; // Unknown = assume available
  const total = avail.inventory[product] ?? 0;
  const used = avail.booked[product] ?? 0;
  return Math.max(0, total - used);
}

function isBlockedForProduct(avail: AvailabilityData | null, product: string): boolean {
  if (!avail) return false;
  return avail.blocked_dates.some(
    (b) => b.products.length === 0 || b.products.includes(product)
  );
}

/* ───── Mini Calendar ───── */

function getNextFridays(today: Date, count: number): Set<string> {
  const fridays = new Set<string>();
  const d = new Date(today);
  // Advance to next Friday
  d.setDate(d.getDate() + ((5 - d.getDay() + 7) % 7 || 7));
  for (let i = 0; i < count; i++) {
    fridays.add(dateKey(d));
    d.setDate(d.getDate() + 7);
  }
  return fridays;
}

function MiniCalendar({
  pickupDate,
  returnDate,
  onSelectDate,
  locale = "da",
  hours,
}: {
  pickupDate: Date | null;
  returnDate: Date | null;
  onSelectDate: (d: Date) => void;
  locale?: Locale;
  /** Åbningstider fra /admin/indstillinger — styrer hvad man kan vælge */
  hours: OpeningHours;
}) {
  const s = t[locale].booking;
  const [viewMonth, setViewMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  const today = useMemo(() => {
    const td = new Date();
    td.setHours(0, 0, 0, 0);
    return td;
  }, []);

  const hotFridays = useMemo(() => getNextFridays(today, 2), [today]);

  const daysInMonth = new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 0).getDate();
  const firstDayOfWeek = (new Date(viewMonth.getFullYear(), viewMonth.getMonth(), 1).getDay() + 6) % 7;

  const cells: (Date | null)[] = [];
  for (let i = 0; i < firstDayOfWeek; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push(new Date(viewMonth.getFullYear(), viewMonth.getMonth(), d));
  }

  return (
    <div className="glass rounded-2xl p-4">
      <div className="flex items-center justify-between mb-3">
        <button type="button" aria-label={locale === "en" ? "Previous month" : "Forrige måned"} onClick={() => setViewMonth((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1))} className="rounded-lg p-2 hover:bg-white/10 transition">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" /></svg>
        </button>
        <span className="font-semibold">
          {s.monthNames[viewMonth.getMonth()]} {viewMonth.getFullYear()}
        </span>
        <button type="button" aria-label={locale === "en" ? "Next month" : "Næste måned"} onClick={() => setViewMonth((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1))} className="rounded-lg p-2 hover:bg-white/10 transition">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" /></svg>
        </button>
      </div>

      <div className="grid grid-cols-7 text-center text-xs text-white/30 mb-1">
        {s.dayNamesShort.map((d) => (
          <div key={d} className="py-1">{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-0.5">
        {cells.map((date, i) => {
          if (!date) return <div key={`e${i}`} />;
          const iso = dateKey(date);
          const isPast = date < today;
          const isPickup = pickupDate && isSameDay(date, pickupDate);
          const isReturn = returnDate && isSameDay(date, returnDate);
          const isInRange = pickupDate && returnDate && date > pickupDate && date < returnDate;
          const isTooFar = pickupDate && !returnDate && diffDays(pickupDate, date) > 5;
          const isHotFriday = hotFridays.has(iso);
          // Åbningstiderne for netop denne dato — en særlig dato slår ugedagen ud
          const resolved = hoursForDate(hours, iso);
          const isSpecial = !!resolved.exception && !resolved.closed;
          // Kun når admin har slået "kun åbne dage" til, spærrer en lukket dag
          const isClosed = hours.onlyOpenDays && resolved.closed;
          const label = formatDateLine(hours, iso, locale);
          const title = resolved.exception?.note ? `${label} — ${resolved.exception.note}` : label;

          return (
            <button
              type="button"
              key={iso}
              disabled={isPast || !!isTooFar || isClosed}
              onClick={() => onSelectDate(date)}
              title={title}
              aria-label={`${date.getDate()}. ${s.monthNames[date.getMonth()]} — ${title}`}
              className={`
                relative h-10 rounded-lg text-sm font-medium transition
                ${isPast || isTooFar || isClosed ? "text-white/15 cursor-not-allowed" : "hover:bg-white/10 cursor-pointer"}
                ${isPickup ? "bg-brand-500 text-black font-bold" : ""}
                ${isReturn ? "bg-brand-600 text-black font-bold" : ""}
                ${isInRange ? "bg-brand-500/20 text-brand-300" : ""}
                ${isHotFriday && !isPast && !isPickup ? "ring-1 ring-orange-400/50" : ""}
                ${isSpecial && !isPast && !isPickup && !isReturn ? "ring-1 ring-brand-400 text-brand-300" : ""}
              `}
            >
              {date.getDate()}
              {isSpecial && !isPast && (
                <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full bg-brand-400" />
              )}
              {isHotFriday && !isPast && (
                <span className="absolute -top-1 -right-1 flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75 animate-ping" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-orange-400" />
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Hvad gælder på de valgte datoer — inkl. særlige åbninger som 30. dec */}
      <SelectedDayHours hours={hours} pickupDate={pickupDate} returnDate={returnDate} locale={locale} />

      {/* Nudge */}
      <div className="mt-3 flex items-center gap-2 rounded-lg bg-orange-400/10 px-3 py-2 text-xs text-orange-300">
        <span className="flex h-2 w-2 shrink-0 rounded-full bg-orange-400" />
        {s.calendarNudge}
      </div>
    </div>
  );
}

/**
 * Åbningstiderne for de datoer kunden har valgt.
 *
 * Uden dette er kalenderen tavs om hvornår man egentlig kan hente. Er datoen en
 * særlig åbning (fx 30. december), står noten med, så det er tydeligt hvorfor
 * en tirsdag pludselig er mulig.
 */
function SelectedDayHours({ hours, pickupDate, returnDate, locale = "da" }: {
  hours: OpeningHours;
  pickupDate: Date | null;
  returnDate: Date | null;
  locale?: Locale;
}) {
  const afterHours = formatAfterHours(hours, locale);
  const rows: Array<{ key: string; label: string; iso: string }> = [];
  if (pickupDate) rows.push({ key: "pickup", label: locale === "en" ? "Pickup" : "Afhentning", iso: dateKey(pickupDate) });
  if (returnDate) rows.push({ key: "return", label: locale === "en" ? "Return" : "Aflevering", iso: dateKey(returnDate) });
  if (rows.length === 0) return null;

  return (
    <div className="mt-3 space-y-1 rounded-lg bg-white/5 px-3 py-2 text-xs">
      {rows.map((row) => {
        const resolved = hoursForDate(hours, row.iso);
        const note = resolved.exception?.note;
        return (
          <div key={row.key} className="flex flex-wrap items-baseline gap-x-2">
            <span className="text-white/40">{row.label}:</span>
            <span className={resolved.closed ? "text-white/50" : "text-brand-300"}>
              {formatDateLine(hours, row.iso, locale)}
            </span>
            {resolved.closed && (
              <span className="text-white/40">
                {locale === "en" ? "— by appointment, write it in the comment field" : "— efter aftale, skriv det i kommentarfeltet"}
              </span>
            )}
            {note && <span className="text-brand-400">· {note}</span>}
          </div>
        );
      })}
      {/* Gebyret for at møde uden for åbningstid — her, hvor datoerne vælges,
          så det ikke kommer bag på nogen ved afhentningen */}
      {afterHours && <p className="pt-1 text-white/40">{afterHours}</p>}
    </div>
  );
}

/* ───── Pickup Info ───── */

function PickupInfo({ locale = "da" }: { locale?: Locale }) {
  const s = t[locale].booking;
  const { hours, pickupAddress } = useSiteSettings();
  const today = dateKey(new Date());
  const særlige = upcomingExceptions(hours, today, 120).filter((e) => !e.closed);
  const linje = formatOneLine(hours, locale);
  return (
    <div className="glass rounded-2xl p-5 text-sm">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 rounded-lg bg-brand-500/15 p-2 text-brand-400">
          <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
          </svg>
        </div>
        <div>
          <p className="font-medium text-white">
            {locale === "en" ? "Pickup at" : "Hent på"} {pickupAddress}
          </p>
          <p className="mt-1 text-white/40">
            {s.pickupDesc}
            <br />
            {s.pickupDesc2}
          </p>
          {linje && (
            <p className="mt-2 text-white/60">
              <span className="text-white/40">{locale === "en" ? "Opening hours" : "Åbningstider"}:</span> {linje}
            </p>
          )}
          {/* Ekstra åbninger — fx 30. december op til nytår */}
          {særlige.length > 0 && (
            <ul className="mt-1 space-y-0.5 text-brand-300">
              {særlige.map((e) => (
                <li key={e.date}>
                  {formatDateLine(hours, e.date, locale)}
                  {e.note ? ` · ${e.note}` : ""}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

/* ───── Levering & afhentning ─────
   To selvstændige ture: 495 kr. for én vej, 795 kr. for begge. Ligger som
   sit eget felt (ikke bare endnu en tilvalgs-række), fordi det er ordrens
   dyreste tilvalg og tidligere blev overset. */

function DeliveryPicker({
  options,
  value,
  onSelect,
  address,
  onAddressChange,
  addressMissing,
  locale = "da",
}: {
  options: Array<{ id: string; label: string; desc: string; price: number }>;
  value: string | null;
  onSelect: (id: string | null) => void;
  address: string;
  onAddressChange: (v: string) => void;
  addressMissing: boolean;
  locale?: Locale;
}) {
  const s = t[locale].booking;
  if (options.length === 0) return null;

  const { pickupAddress } = useSiteSettings();
  const selfLabel = locale === "en" ? "I pick up and return it myself" : "Jeg henter og afleverer selv";
  const selfDesc = `${pickupAddress} — ${locale === "en" ? "free" : "gratis"}`;

  const rows: Array<{ id: string | null; label: string; desc: string; price: number }> = [
    { id: null, label: selfLabel, desc: selfDesc, price: 0 },
    ...options,
  ];

  return (
    <div className="glass rounded-2xl p-4">
      <div className="mb-1 flex items-center gap-2">
        <svg className="h-5 w-5 text-brand-400" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-6" />
        </svg>
        <h3 className="text-base font-semibold">{s.deliveryTitle}</h3>
      </div>
      <p className="mb-3 text-xs text-white/40">{s.deliveryDesc}</p>

      <div className="space-y-2">
        {rows.map((o) => {
          const selected = value === o.id;
          return (
            <button
              key={o.id ?? "selv"}
              type="button"
              onClick={() => onSelect(o.id)}
              className={`flex w-full items-center gap-3 rounded-xl border px-3 py-3 text-left transition active:scale-[0.99] ${
                selected ? "border-brand-500 bg-brand-500/10" : "border-white/10 bg-white/[0.03] hover:border-white/25"
              }`}
            >
              <div
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition ${
                  selected ? "border-brand-500 bg-brand-500" : "border-white/20 bg-white/5"
                }`}
              >
                {selected && <span className="h-2 w-2 rounded-full bg-black" />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">{o.label}</p>
                <p className="text-xs text-white/40">{o.desc}</p>
              </div>
              <p className={`shrink-0 text-sm font-bold ${o.price ? "text-brand-400" : "text-white/40"}`}>
                {o.price ? `+${o.price},-` : s.deliveryFree}
              </p>
            </button>
          );
        })}
      </div>

      {value && (
        <div className="pt-3">
          <label className="mb-1 block text-xs text-white/50">{s.deliveryAddressLabel}</label>
          <input
            type="text"
            placeholder={s.deliveryPlaceholder}
            value={address}
            onChange={(e) => onAddressChange(e.target.value)}
            className={`w-full rounded-xl border bg-white/5 px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:ring-1 ${
              addressMissing
                ? "border-red-400/60 focus:border-red-400 focus:ring-red-400"
                : "border-brand-500/30 focus:border-brand-500 focus:ring-brand-500"
            }`}
          />
          {addressMissing && <p className="mt-1 text-xs text-red-400">{s.deliveryAddressRequired}</p>}
        </div>
      )}
    </div>
  );
}

/* ───── Light Bar ───── */

function LightBar() {
  return (
    <div className="pointer-events-none fixed top-0 left-0 right-0 z-10 h-1.5 overflow-hidden">
      <div className="h-full w-full animate-light-bar bg-gradient-to-r from-transparent via-brand-400/80 to-transparent" />
    </div>
  );
}

/* ───── Component ───── */

export default function BookingFlow({
  locale = "da",
  variant = "inline",
  onSummaryChange,
  urlTick = 0,
}: {
  locale?: Locale;
  variant?: "inline" | "drawer";
  /** Kurv-summary til drawer-fanen: antal produkter + total */
  onSummaryChange?: (summary: { count: number; total: number }) => void;
  /** Bumpes når URL ændres (soft-nav) så ?product= preselectes igen */
  urlTick?: number;
}) {
  const inDrawer = variant === "drawer";
  const s = t[locale].booking;

  // Åbningstider fra /admin/indstillinger: hvad kalenderen viser, og — hvis
  // admin har slået det til — hvilke datoer der kan vælges
  const { hours } = useSiteSettings();

  // Live catalog (admin-editable) localized for the current locale
  const catalog = useProducts();
  const speakers = useMemo(
    () => catalog.speakers.map((sd) => ({ ...sd, ...sd[locale] })),
    [catalog.speakers, locale]
  );
  const addons = useMemo(
    () => catalog.addons.map((ad) => ({ ...ad, ...ad[locale] })),
    [catalog.addons, locale]
  );
  const rentalProducts = catalog.rentalProducts;
  const lysAddon = addons.find((a) => a.id === "lys");
  const rogAddon = addons.find((a) => a.id === "rog");

  // Multi-product cart: items added before the current selection
  interface CartItem {
    productId: string;
    name: string;
    price: number;
  }
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  const [step, setStep] = useState(1);
  const [addonSearch, setAddonSearch] = useState("");
  const [speaker, setSpeaker] = useState<string | null>(null);
  const [pickupDate, setPickupDate] = useState<Date | null>(null);
  const [returnDate, setReturnDate] = useState<Date | null>(null);
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
  const [deliveryAddress, setDeliveryAddress] = useState("");
  /** Adresse-fejlen vises først når man forsøger at gå videre */
  const [showDeliveryError, setShowDeliveryError] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", comment: "", company: "" });
  // GDPR: markedsføringssamtykke skal være aktivt tilvalg — må ikke være forudkrydset
  const [newsletter, setNewsletter] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [payMethod, setPayMethod] = useState<"pickup" | "online">("online");
  const [couponInput, setCouponInput] = useState("");
  const [coupon, setCoupon] = useState<{ code: string; pct: number } | null>(null);
  const [couponError, setCouponError] = useState(false);
  const [couponChecking, setCouponChecking] = useState(false);

  async function applyCoupon() {
    const code = couponInput.trim();
    if (!code) return;
    setCouponChecking(true);
    setCouponError(false);
    // Ordren sendes med: weekendudsalgets kode gælder kun bestemte datoer og
    // kun det udstyr, der stadig står tilbage. Almindelige koder ignorerer det.
    const productIds = [
      ...(speaker && speaker !== "effects-only" ? [speaker] : []),
      ...selectedAddons,
      ...cartItems.map((c) => c.productId),
    ].filter(Boolean);
    const params = new URLSearchParams({ code });
    if (pickupDate) params.set("pickup", pickupDate.toISOString().slice(0, 10));
    if (returnDate) params.set("returnDate", returnDate.toISOString().slice(0, 10));
    if (productIds.length) params.set("products", productIds.join(","));

    try {
      const res = await fetch(`/api/discount?${params.toString()}`);
      const json: { valid: boolean; code?: string; pct?: number } = await res.json();
      if (json.valid && json.code && json.pct) {
        setCoupon({ code: json.code, pct: json.pct });
      } else {
        setCoupon(null);
        setCouponError(true);
      }
    } catch {
      setCoupon(null);
      setCouponError(true);
    } finally {
      setCouponChecking(false);
    }
  }
  const [checkoutSecret, setCheckoutSecret] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  /** Ordrenummeret fra serveren — vises på kvitteringen, så kunden har noget at henvise til */
  const [ordreNr, setOrdreNr] = useState<string>("");
  const [error, setError] = useState("");

  // Availability state — only checked for the selected dates (step 2).
  // No overview check in step 1: a single booking somewhere in the coming
  // weeks must not mark a product as sold out before dates are chosen.
  const [availSelected, setAvailSelected] = useState<AvailabilityData | null>(null);
  const [soldOutMsg, setSoldOutMsg] = useState("");
  const preselected = useRef(false);

  // Drawer: scroll altid til toppen når man skifter step
  useEffect(() => {
    if (inDrawer) {
      document.getElementById("booking-drawer-scroll")?.scrollTo({ top: 0 });
    }
  }, [step, inDrawer]);

  // Soft-nav til nyt ?product= → tillad preselect igen
  useEffect(() => {
    preselected.current = false;
  }, [urlTick]);

  /**
   * Læg det aktuelle valg (produkt + tilvalg) i kurven i stedet for at smide
   * det væk — bruges når kunden vælger endnu et produkt. Levering beholdes
   * som valgt tilvalg (gælder hele ordren).
   */
  const stashSelectionToCart = useCallback(() => {
    setCartItems((prev) => {
      const items = [...prev];
      const priceOf = (base: number) => (isSummerSale() ? applyDiscount(base) : base);

      if (speaker && speaker !== "effects-only") {
        const sp = speakers.find((x) => x.id === speaker);
        const rp = rentalProducts.find((x) => x.id === speaker);
        const name = sp?.name ?? (rp ? (locale === "en" ? rp.name_en : rp.name_da) : speaker);
        items.push({ productId: speaker, name, price: priceOf(sp?.price ?? rp?.price ?? 0) });
      }
      // Valgte tilvalg følger med i kurven (undtagen levering — den gælder ordren)
      for (const a of addons) {
        if (selectedAddons.includes(a.id) && !DELIVERY_IDS.includes(a.id)) {
          items.push({ productId: a.id, name: a.label, price: priceOf(a.price) });
        }
      }
      return items;
    });
    setSpeaker(null);
    setSelectedAddons((prev) => prev.filter((id) => DELIVERY_IDS.includes(id)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [speaker, selectedAddons, addons, speakers, rentalProducts, locale]);

  // Preselect product from ?product=ID — re-runs on soft-nav (urlTick).
  // Er der allerede et produkt i gang, lægges det i kurven først, så
  // "book endnu en ting" aldrig smider det første valg væk.
  useEffect(() => {
    if (preselected.current || typeof window === "undefined") return;
    const product = new URLSearchParams(window.location.search).get("product");
    if (!product) return;

    const hasCurrent = !!speaker;

    // Tilvalg bookes uden højtaler (lys, røg, subwoofer, stativer …)
    const addonMatch = addons.find((a) => a.id === product && !DELIVERY_IDS.includes(a.id));
    if (addonMatch) {
      console.log("[booking] Preselect addon:", product);
      preselected.current = true;
      if (speaker === "effects-only" && selectedAddons.includes(product)) {
        setStep(2);
        return;
      }
      if (hasCurrent) stashSelectionToCart();
      setSpeaker("effects-only");
      setSelectedAddons((prev) => [...prev.filter((id) => DELIVERY_IDS.includes(id)), product]);
      setStep(2);
      return;
    }

    // Speakers + standalone rental products (lyskæder, discokugle, AV, festpakker, …)
    if (speakers.some((sp) => sp.id === product) || rentalProducts.some((p) => p.id === product)) {
      console.log("[booking] Preselect product:", product);
      preselected.current = true;
      if (speaker === product) {
        setStep(2);
        return;
      }
      if (hasCurrent) stashSelectionToCart();
      setSpeaker(product);
      setStep(2);
      return;
    }

    console.log("[booking] Product not found yet, waiting:", product);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [speakers, rentalProducts, addons, urlTick, speaker, selectedAddons, stashSelectionToCart]);

  // Fetch availability for selected date range (step 2 validation)
  const checkDateAvailability = useCallback(async (pickup: Date, ret: Date) => {
    setSoldOutMsg("");
    try {
      const from = dateKey(pickup);
      const to = dateKey(ret);
      const r = await fetch(`/api/availability?from=${from}&to=${to}`);
      const data: AvailabilityData = await r.json();
      setAvailSelected(data);

      // Check if the selected product is available
      if (speaker === "effects-only") {
        // Check each selected effect addon
        if (selectedAddons.includes("lys")) {
          const lysRemaining = getRemaining(data, "lys");
          if (lysRemaining <= 0) {
            setSoldOutMsg(s.lightsSoldOutPeriod);
          }
        }
      } else if (speaker) {
        const remaining = getRemaining(data, speaker);
        const blocked = isBlockedForProduct(data, speaker);
        // Rental products may have no inventory entry yet — don't block
        const isKnownInventory = data.inventory[speaker] !== undefined;
        if (isKnownInventory && (remaining <= 0 || blocked)) {
          setSoldOutMsg(s.soldOutPeriod);
          // Ikke en fejl — men en mistet booking. Tælles, så vi kan se om vi
          // afviser kunder på datoer, hvor vi burde have haft mere udstyr.
          rapporterFejl("udsolgt", `${speaker} er optaget i den valgte periode`, {
            trin: 1,
            produkt: speaker,
            fra: dateKey(pickup),
            til: dateKey(ret),
          });
        }
        // Also check lys if it's an addon
        if (selectedAddons.includes("lys")) {
          const lysRemaining = getRemaining(data, "lys");
          if (lysRemaining <= 0) {
            setSoldOutMsg(s.lightsSoldOutPeriod);
          }
        }
      }
    } catch (e) {
      // Bookingen blokeres ikke af et fejlet opslag — men vi skal vide det:
      // kunden vælger så datoer uden at vide, om udstyret er ledigt
      rapporterFejl("ledighed_fejlede", e instanceof Error ? e.message : "ukendt", {
        trin: 1,
        produkt: speaker ?? undefined,
        fra: dateKey(pickup),
        til: dateKey(ret),
      });
    }
  }, [speaker, selectedAddons, s]);

  const isEffectsOnly = speaker === "effects-only";
  const selectedSpeaker = speakers.find((sp) => sp.id === speaker);
  const selectedRental = rentalProducts.find((p) => p.id === speaker);
  const isRentalOnly = !!selectedRental;

  // Filter addons by the product's allowedAddons list (undefined = show all)
  const allowedAddonIds = selectedSpeaker?.allowedAddons ?? selectedRental?.allowedAddons;
  const visibleAddons = allowedAddonIds ? addons.filter((a) => allowedAddonIds.includes(a.id)) : addons;
  const rentalName = selectedRental
    ? locale === "en"
      ? selectedRental.name_en
      : selectedRental.name_da
    : null;
  const hasLights = selectedAddons.includes("lys");
  const DELIVERY_IDS: readonly string[] = DELIVERY_ADDON_IDS;
  const hasDelivery = selectedAddons.some((id) => DELIVERY_IDS.includes(id));
  const deliveryChoice = selectedAddons.find((id) => DELIVERY_IDS.includes(id)) ?? null;
  // Kørsel uden adresse er ubrugelig — så ved vi ikke hvor vi skal hen
  const deliveryAddressMissing = hasDelivery && deliveryAddress.trim().length < 5;

  // Bookes ét enkelt tilvalg uden højtaler (fx subwoofer eller røgmaskine),
  // vis produktets eget navn/billede i stedet for den generiske "Kun effekter"
  const soloAddons = addons.filter((a) => selectedAddons.includes(a.id) && !DELIVERY_IDS.includes(a.id));
  const effectsLabel = soloAddons.length === 1 ? soloAddons[0].label : s.effectsOnlyLabel;
  const effectsImage =
    soloAddons.length === 1 && soloAddons[0].image
      ? soloAddons[0].image
      : hasLights
        ? "/images/product-lys.webp"
        : "/images/product-rog.webp";

  const summer = isSummerSale();
  const summerLabel = t[locale].summer;
  const rentalDays = pickupDate && returnDate ? diffDays(pickupDate, returnDate) : 3;
  const multiplier = dayMultiplier[rentalDays] ?? 1;
  const speakerBasePrice = selectedSpeaker
    ? Math.round(selectedSpeaker.price * multiplier)
    : selectedRental
      ? Math.round(selectedRental.price * multiplier)
      : 0;
  const speakerPrice = summer ? applyDiscount(speakerBasePrice) : speakerBasePrice;
  const addonsBasePrice = addons
    .filter((a) => selectedAddons.includes(a.id))
    .reduce((sum, a) => sum + a.price, 0);
  const addonsPrice = summer ? applyDiscount(addonsBasePrice) : addonsBasePrice;
  const cartTotal = cartItems.reduce((sum, item) => sum + item.price, 0);
  const subtotal = speakerPrice + addonsPrice + cartTotal;
  // Rabatkode: procenten kommer fra /api/discount og er kun til visning —
  // ved onlinebetaling genberegner serveren alt og lægger Stripe-kuponen på.
  const total = coupon ? Math.round(subtotal * (1 - coupon.pct / 100)) : subtotal;
  const totalBeforeDiscount = summer ? speakerBasePrice + addonsBasePrice + cartTotal : subtotal;

  // Kurv-summary op til draweren (fane når draweren er pakket væk)
  const cartCount = cartItems.length + (speaker ? 1 : 0);
  useEffect(() => {
    onSummaryChange?.({ count: cartCount, total });
  }, [cartCount, total, onSummaryChange]);

  // GA4 form_start — booking step 4 (kontaktoplysninger), ikke kontakt/nyhedsbrev
  useEffect(() => {
    if (step === 4 && !checkoutSecret && !done) {
      trackBookingFormStart({ value: total, itemCount: cartCount });
    }
  }, [step, checkoutSecret, done, total, cartCount]);

  function formatDate(d: Date) {
    return `${s.dayNames[d.getDay()]} ${d.getDate()}. ${s.monthNames[d.getMonth()].toLowerCase().slice(0, 3)}`;
  }

  const periodLabel = pickupDate && returnDate
    ? `${formatDate(pickupDate)} \u2192 ${formatDate(returnDate)} (${rentalDays} ${rentalDays === 1 ? s.day : s.days})`
    : s.notSelected;

  function handleDateSelect(d: Date) {
    setSoldOutMsg("");
    if (!pickupDate || (pickupDate && returnDate)) {
      setPickupDate(d);
      setReturnDate(null);
      setAvailSelected(null);
    } else {
      if (d <= pickupDate) {
        setPickupDate(d);
        setReturnDate(null);
        setAvailSelected(null);
      } else {
        const days = diffDays(pickupDate, d);
        if (days >= 1 && days <= 5) {
          setReturnDate(d);
          checkDateAvailability(pickupDate, d);
        }
      }
    }
  }

  function toggleAddon(id: string) {
    setSelectedAddons((prev) => {
      if (prev.includes(id)) return prev.filter((a) => a !== id);
      // De to leveringsvarianter udelukker hinanden
      if (DELIVERY_IDS.includes(id)) {
        return [...prev.filter((a) => !DELIVERY_IDS.includes(a)), id];
      }
      return [...prev, id];
    });
    if (DELIVERY_IDS.includes(id) && selectedAddons.includes(id)) {
      setDeliveryAddress("");
    }
  }

  function nextStep() {
    setStep((st) => Math.min(st + 1, 4));
  }

  function prevStep() {
    setStep((st) => Math.max(st - 1, 1));
  }

  function addCurrentToCart() {
    if (!speaker) return;
    // Produkt + valgte tilvalg ryger i kurven; levering + adresse beholdes (gælder ordren)
    stashSelectionToCart();
    setStep(1);
  }

  function removeCartItem(idx: number) {
    setCartItems((prev) => prev.filter((_, i) => i !== idx));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    // Har kunden valgt kørsel, skal vi vide hvorhen — ellers bliver leveringen
    // aldrig sat på ordren
    if (deliveryAddressMissing) {
      setShowDeliveryError(true);
      setStep(3);
      return;
    }
    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          speaker: isEffectsOnly
            ? locale === "en"
              ? "Effects only"
              : "Kun effekter"
            : selectedSpeaker?.name ?? rentalName,
          speakerId: isEffectsOnly ? "effects-only" : speaker,
          speakerSize: isEffectsOnly || isRentalOnly ? "—" : selectedSpeaker?.size,
          period: periodLabel,
          pickup: pickupDate?.toISOString(),
          returnDate: returnDate?.toISOString(),
          days: rentalDays,
          addons: addons
            .filter((a) => selectedAddons.includes(a.id))
            .map((a) => a.label),
          addonIds: addons
            .filter((a) => selectedAddons.includes(a.id))
            .map((a) => a.id),
          cartItems: cartItems.map((item) => ({ name: item.name, price: item.price, productId: item.productId })),
          deliveryAddress: hasDelivery ? deliveryAddress.trim() : undefined,
          deliveryOptionId: deliveryChoice ?? undefined,
          total,
          discountCode: coupon?.code,
          locale,
          newsletter,
          paymentChoice: payMethod,
          ...form,
        }),
      });

      if (!res.ok) {
        // Den vigtigste fejl i hele forløbet: kunden var klar til at købe.
        // Uden det her så vi kun de bookinger der lykkedes.
        const svar = await res.text().catch(() => "");
        rapporterFejl("booking_fejlede", `HTTP ${res.status} fra /api/book`, {
          trin: 3,
          produkt: speaker ?? undefined,
          fra: pickupDate ? dateKey(pickupDate) : undefined,
          til: returnDate ? dateKey(returnDate) : undefined,
          status: res.status,
          svar: svar.slice(0, 300),
        });
        throw new Error(s.bookingFailed);
      }
      const bookResult = await res.json().catch(() => ({}));
      if (bookResult?.bookingId) setOrdreNr(String(bookResult.bookingId).replace("booking_", ""));
      // Subscribe to newsletter if checked
      if (newsletter && form.email) {
        fetch("/api/newsletter", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: form.email }),
        }).catch(() => {});
      }
      // Konvertering: ved afhentningsbetaling er bookingen gennemført her.
      // Ved online betaling sporer vi først på kvitteringssiden, når Stripe
      // har bekræftet betalingen — ellers tælles afbrudte betalinger med.
      const purchaseItems = [
        ...(selectedSpeaker ? [{ id: selectedSpeaker.id, name: selectedSpeaker.name, price: speakerPrice }] : []),
        ...(selectedRental ? [{ id: selectedRental.id, name: rentalName ?? selectedRental.id, price: speakerPrice }] : []),
        ...addons.filter((a) => selectedAddons.includes(a.id)).map((a) => ({ id: a.id, name: a.label, price: a.price })),
        ...cartItems.map((ci) => ({ id: ci.productId, name: ci.name, price: ci.price })),
      ];
      if (payMethod !== "online") {
        trackPurchase({
          transactionId: bookResult.bookingId ?? `booking_${Date.now()}`,
          value: total,
          items: purchaseItems,
          paymentMethod: "pickup",
        });
      }
      if (payMethod === "online") {
        // Online-betaling: opret Checkout Session (beløb beregnes server-side)
        const itemIds: string[] = [
          ...(!isEffectsOnly && speaker ? [speaker] : []),
          ...selectedAddons,
          ...cartItems.map((c) => c.productId),
        ];
        const payRes = await fetch("/api/stripe/create-checkout-session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            items: itemIds.map((id) => ({ id })),
            bookingId: bookResult.bookingId,
            locale,
            discountCode: coupon?.code,
            // Weekendudsalgets kode gælder kun bestemte datoer og produkter
            pickup: pickupDate?.toISOString(),
            returnDate: returnDate?.toISOString(),
          }),
        });
        if (!payRes.ok) {
          const svar = await payRes.text().catch(() => "");
          rapporterFejl("betaling_fejlede", `HTTP ${payRes.status} fra Stripe-kaldet`, {
            trin: 4,
            produkt: speaker ?? undefined,
            status: payRes.status,
            svar: svar.slice(0, 300),
          });
          throw new Error("payment");
        }
        const { clientSecret } = await payRes.json();
        setCheckoutSecret(clientSecret);
        return;
      }
      setDone(true);
    } catch {
      setError(s.errorRetry);
    } finally {
      setSubmitting(false);
    }
  }

  // Mount Stripe Embedded Checkout når client secret er klar
  useEffect(() => {
    if (!checkoutSecret) return;
    let checkout: { destroy: () => void } | null = null;
    let cancelled = false;
    (async () => {
      try {
        const cfg = await fetch("/api/stripe/config").then((r) => r.json());
        const stripe = await loadStripe(cfg.publishableKey);
        if (!stripe || cancelled) return;
        checkout = await (stripe as any).createEmbeddedCheckoutPage({ clientSecret: checkoutSecret });
        if (cancelled) { checkout.destroy(); return; }
        checkout.mount("#stripe-checkout");
        document.getElementById("booking-drawer-scroll")?.scrollTo({ top: 0 });
      } catch (err) {
        console.error("[stripe] embedded checkout mount failed:", err);
        setError(s.errorRetry);
        setCheckoutSecret(null);
      }
    })();
    return () => {
      cancelled = true;
      checkout?.destroy();
    };
  }, [checkoutSecret, s.errorRetry]);

  /* ── Price Summary (reused) ── */
  function PriceSummary() {
    return (
      <div className="glass rounded-2xl p-5">
        {summer && (
          <div className="mb-3 flex items-center gap-2 rounded-lg bg-amber-500/10 border border-amber-500/20 px-3 py-2 text-xs font-semibold text-amber-400">
            <span className="rounded-full bg-amber-500 px-1.5 py-0.5 text-[10px] font-bold text-black">{summerLabel.badge}</span>
            {summerLabel.banner}
          </div>
        )}
        {selectedSpeaker && (
          <div className="flex justify-between text-sm text-white/50">
            <span>{selectedSpeaker.name}{s.speakerSuffix}</span>
            <span>
              {summer && <span className="line-through text-white/30 mr-2">{speakerBasePrice} kr</span>}
              {speakerPrice} kr
            </span>
          </div>
        )}
        {isRentalOnly && rentalName && (
          <div className="flex justify-between text-sm text-white/50">
            <span>{rentalName}</span>
            <span>
              {summer && <span className="line-through text-white/30 mr-2">{speakerBasePrice} kr</span>}
              {speakerPrice} kr
            </span>
          </div>
        )}
        {addons
          .filter((a) => selectedAddons.includes(a.id))
          .map((a) => (
            <div key={a.id} className="flex justify-between text-sm text-white/50">
              <span>{a.label}</span>
              <span>
                {summer && <span className="line-through text-white/30 mr-2">{a.price} kr</span>}
                {summer ? applyDiscount(a.price) : a.price} kr
              </span>
            </div>
          ))}
        {coupon && (
          <div className="flex justify-between text-sm text-emerald-400">
            <span>{coupon.code}</span>
            <span>−{coupon.pct}%</span>
          </div>
        )}
        <div className="mt-3 flex justify-between border-t border-white/10 pt-3 text-lg font-bold">
          <span>{s.total}</span>
          <span className={summer ? "text-amber-400" : "text-brand-400"}>
            {(summer || coupon) && <span className="text-sm line-through text-white/30 mr-2 font-normal">{totalBeforeDiscount} kr</span>}
            {total} kr
          </span>
        </div>
        <p className="mt-1 text-right text-xs text-white/30">{payMethod === "online" ? (locale === "en" ? "Paid online now" : "Betales online nu") : s.paidAtPickup}</p>
      </div>
    );
  }

  if (done) {
    const orderItems = [
      ...(selectedSpeaker ? [{ label: `${selectedSpeaker.name}${s.speakerSuffix} (${selectedSpeaker.size})`, value: `${speakerPrice} kr` }] : []),
      ...(isRentalOnly && rentalName ? [{ label: rentalName, value: `${speakerPrice} kr` }] : []),
      ...addons.filter((a) => selectedAddons.includes(a.id)).map((a) => ({ label: a.label, value: `${a.price} kr` })),
    ];

    return (
      <section id={inDrawer ? undefined : "book"} className="relative overflow-hidden">
        {!inDrawer && (
          <>
            {speakers.map((sd) => (
              <div
                key={sd.id}
                className="fixed inset-0 bg-cover bg-center transition-opacity duration-700"
                style={{ backgroundImage: `url(${sd.mood})`, opacity: speaker === sd.id ? 0.5 : 0 }}
              />
            ))}
            <div className="fixed inset-0 bg-gradient-to-b from-[#07060b]/50 via-[#07060b]/60 to-[#07060b]/90" />
          </>
        )}

        <div className={inDrawer ? "relative z-20 mx-auto max-w-lg px-4 py-6" : "relative z-20 mx-auto max-w-lg px-4 py-16"}>
          {/* Success header */}
          <div className="text-center mb-8">
            <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-green-500/20">
              <svg className="h-10 w-10 text-green-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold">{s.successTitle}</h2>
            <p className="mt-3 text-white/50">
              {s.successEmailSent} <strong className="text-white">{form.email}</strong>
            </p>
            {ordreNr && (
              <p className="mt-2 text-sm text-white/40">
                {s.orderNumber} <span className="font-mono text-white/70">{ordreNr}</span>
              </p>
            )}
            {/* Den vigtigste linje på siden: kunder bestiller igen, fordi de er
                i tvivl om, om det gik igennem */}
            <p className="mt-4 rounded-xl bg-green-500/10 px-4 py-3 text-sm text-green-200/90">
              {s.noNeedToRebook}
            </p>
          </div>

          {/* Status card */}
          <div className="glass rounded-2xl p-5 mb-4">
            <div className="flex items-center gap-3">
              <div className="relative flex h-3 w-3 shrink-0">
                <span className="absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75 animate-ping" />
                <span className="relative inline-flex h-3 w-3 rounded-full bg-brand-400" />
              </div>
              <div>
                <p className="font-medium text-white">{s.successChecking}</p>
                <p className="text-sm text-white/40">{s.successCheckingDesc}</p>
              </div>
            </div>
          </div>

          {/* Order details */}
          <div className="glass rounded-2xl overflow-hidden mb-4">
            {/* Product preview */}
            <div className="flex items-center gap-4 bg-white/[0.02] p-4">
              <img loading="lazy" decoding="async" src={isEffectsOnly ? effectsImage : selectedRental?.image ?? selectedSpeaker?.product} srcSet={thumbSrcSet(isEffectsOnly ? effectsImage : selectedRental?.image ?? selectedSpeaker?.product)} sizes={THUMB_IMAGE_SIZES} alt={isEffectsOnly ? effectsLabel : rentalName ?? `${selectedSpeaker?.name ?? "Højtalerpakke"}`} className="h-16 w-16 object-contain rounded-lg" />
              <div>
                <p className="font-semibold">{isEffectsOnly ? effectsLabel : isRentalOnly ? rentalName : `${selectedSpeaker?.name}${s.speakerSuffix}`}</p>
                <p className="text-sm text-white/40">{isEffectsOnly ? addons.filter((a) => selectedAddons.includes(a.id) && !DELIVERY_IDS.includes(a.id)).map((a) => a.label).join(" + ") : isRentalOnly ? "" : `${selectedSpeaker?.size} — ${selectedSpeaker?.capacity}`}</p>
              </div>
            </div>

            <div className="p-5 space-y-3">
              {/* Dates */}
              <div className="flex items-center gap-3 text-sm">
                <svg className="h-4 w-4 shrink-0 text-white/30" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                </svg>
                <span className="text-white/70">{periodLabel}</span>
              </div>

              {/* Pickup/delivery */}
              <div className="flex items-center gap-3 text-sm">
                <svg className="h-4 w-4 shrink-0 text-white/30" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                </svg>
                <span className="text-white/70">
                  {hasDelivery && deliveryAddress
                    ? `${s.successDelivery} ${deliveryAddress}`
                    : `${s.successPickup} ${pickupAddress}`}
                </span>
              </div>

              {/* Contact */}
              <div className="flex items-center gap-3 text-sm">
                <svg className="h-4 w-4 shrink-0 text-white/30" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0" />
                </svg>
                <span className="text-white/70">{form.name} &middot; {form.phone}</span>
              </div>

              {/* Line items */}
              <div className="border-t border-white/10 pt-3 mt-3 space-y-1.5">
                {orderItems.map((item, i) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span className="text-white/50">{item.label}</span>
                    <span className="text-white/70">{item.value}</span>
                  </div>
                ))}
              </div>

              {/* Total */}
              <div className="flex justify-between border-t border-white/10 pt-3 text-lg font-bold">
                <span>{s.total}</span>
                <span className="text-brand-400">{total} kr</span>
              </div>
              <p className="text-right text-xs text-white/30">{s.paidAtPickupFull}</p>
            </div>
          </div>

          {/* Included info */}
          <div className="glass rounded-2xl p-4 text-sm text-white/40">
            <p className="font-medium text-white/60 mb-2">{s.successIncluded}</p>
            <ul className="space-y-1">
              <li>{s.successCables}</li>
              {speaker === "festival" && <li>{s.successStands}</li>}
              {hasLights && <li>{s.successLightBar}</li>}
            </ul>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id={inDrawer ? undefined : "book"} className="relative">
      {!inDrawer && (
        <>
          {/* ── Fixed mood background ── */}
          <div
            className="fixed inset-0 bg-cover bg-center transition-opacity duration-700"
            style={{ backgroundImage: "url(/images/hero.webp)", opacity: speaker === null ? 0.5 : 0 }}
          />
          {speakers.map((sd) => (
            <div
              key={sd.id}
              className="fixed inset-0 bg-cover bg-center transition-opacity duration-700 ease-in-out"
              style={{ backgroundImage: `url(${sd.mood})`, opacity: speaker === sd.id ? 0.5 : 0 }}
            />
          ))}
          <div className="fixed inset-0 bg-gradient-to-b from-[#07060b]/50 via-[#07060b]/60 to-[#07060b]/90" />
        </>
      )}

      {hasLights && <LightBar />}


      {/* ── Content ── */}
      <div className={inDrawer ? "relative z-20 mx-auto max-w-lg px-4 py-4 pb-16" : "relative z-20 mx-auto max-w-lg px-4 py-24"}>
        {/* Progress */}
        <div className="mb-8 flex items-center justify-center gap-2">
          {[1, 2, 3, 4].map((st) => (
            <div
              key={st}
              className={`h-2 rounded-full transition-all duration-300 ${
                st === step ? "w-8 bg-brand-500" : st < step ? "w-8 bg-brand-700" : "w-8 bg-white/10"
              }`}
            />
          ))}
        </div>

        {/* Step 1: Speaker */}
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-center text-2xl font-bold">{s.step1Title}</h2>

            <PickupInfo locale={locale} />

            <div className="space-y-4">
              {speakers.map((sp) => {
                return (
                  <button
                    key={sp.id}
                    onClick={() => {
                      setSpeaker(sp.id);
                      nextStep();
                    }}
                    className={`group w-full overflow-hidden rounded-2xl text-left transition active:scale-[0.98] ${
                      speaker === sp.id ? "glass-selected" : "glass hover:border-white/20"
                    }`}
                  >
                    <div className="relative h-48 overflow-hidden bg-[#0d0c12]">
                      <img loading="lazy" decoding="async"
                        src={sp.product}
                        srcSet={thumbSrcSet(sp.product)}
                        sizes={THUMB_IMAGE_SIZES}
                        alt={sp.name}
                        className="h-full w-full object-contain p-4 transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute bottom-4 right-4 text-right">
                        {summer && (
                          <div className="flex items-center justify-end gap-2 mb-1">
                            <span className="rounded-full bg-amber-500 px-2 py-0.5 text-xs font-bold text-black">{summerLabel.badge}</span>
                            <span className="text-lg text-white/40 line-through">{sp.price},-</span>
                          </div>
                        )}
                        <p className={`text-3xl font-bold ${summer ? "text-amber-400" : "text-brand-400"}`}>{summer ? applyDiscount(sp.price) : sp.price},-</p>
                        <p className="text-xs text-white/60">{s.fromPerWeekend}</p>
                      </div>
                    </div>
                    <div className="p-5">
                      <div className="flex items-center gap-2">
                        <h3 className="text-xl font-semibold">{sp.name}</h3>
                        {sp.power === "batteri" && (
                          <span className="rounded-full bg-green-500/15 px-2 py-0.5 text-[11px] font-semibold text-green-400">
                            🔋 {s.batteryBadge}
                          </span>
                        )}
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-white/50">
                        <span>{sp.size}</span>
                        <CapacityBadge level={capacityLevel(sp.id)} label={sp.capacity} />
                      </div>
                      <p className="mt-2 text-sm text-white/40">{sp.desc}</p>
                      <p className="mt-1 text-xs text-white/30">{sp.extra}</p>
                      <p className="mt-2 text-xs text-brand-400/70">
                        {s.cablesIncluded}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Effects-only shortcuts (lights / fog without speakers) */}
            <div className="space-y-2">
              <p className="text-center text-sm text-white/40">{s.effectsOnlyTitle}</p>
              <div className="grid grid-cols-2 gap-3">
                {/* Lights only */}
                <button
                  onClick={() => {
                    setSpeaker("effects-only");
                    setSelectedAddons(["lys"]);
                    nextStep();
                  }}
                  className="rounded-xl border border-dashed border-white/15 p-3 text-center transition active:scale-[0.98] hover:border-brand-500/40 hover:bg-white/[0.02]"
                >
                  <img loading="lazy" decoding="async" src="/images/product-lys.webp" srcSet={thumbSrcSet("/images/product-lys.webp")} sizes={THUMB_IMAGE_SIZES} alt="Lys-pakke med LED-lamper og centereffekt" className="mx-auto h-12 w-12 object-contain rounded-lg" />
                  <p className="mt-2 text-sm font-medium text-white/70">
                    {lysAddon?.label}
                  </p>
                  <p className={`text-sm ${summer ? "text-amber-400" : "text-brand-400"}`}>
                    {summer ? <><span className="line-through text-white/30 mr-1">{s.fromShort} {lysAddon?.price ?? 500},-</span>{s.fromShort} {applyDiscount(lysAddon?.price ?? 500)},-</> : <>{s.fromShort} {lysAddon?.price ?? 500},-</>}
                  </p>
                </button>

                {/* Fog only */}
                <button
                  onClick={() => {
                    setSpeaker("effects-only");
                    setSelectedAddons(["rog"]);
                    nextStep();
                  }}
                  className="rounded-xl border border-dashed border-white/15 p-3 text-center transition active:scale-[0.98] hover:border-brand-500/40 hover:bg-white/[0.02]"
                >
                  <img loading="lazy" decoding="async" src="/images/product-rog.webp" srcSet={thumbSrcSet("/images/product-rog.webp")} sizes={THUMB_IMAGE_SIZES} alt="Røgmaskine til fest" className="mx-auto h-12 w-12 object-contain rounded-lg" />
                  <p className="mt-2 text-sm font-medium text-white/70">
                    {rogAddon?.label}
                  </p>
                  <p className={`text-sm ${summer ? "text-amber-400" : "text-brand-400"}`}>
                    {summer ? <><span className="line-through text-white/30 mr-1">{s.fromShort} {rogAddon?.price ?? 250},-</span>{s.fromShort} {applyDiscount(rogAddon?.price ?? 250)},-</> : <>{s.fromShort} {rogAddon?.price ?? 250},-</>}
                  </p>
                </button>
              </div>
              <p className="text-center text-xs text-white/30">{s.effectsOnlyDesc}</p>
            </div>

            {/* Andet udstyr (lys, AV m.m.) — så alle produkter kan vælges direkte */}
            {rentalProducts.length > 0 && (
              <div className="space-y-2 pt-2">
                <p className="text-center text-sm text-white/40">{s.otherEquipmentTitle}</p>
                <div className="grid grid-cols-2 gap-3">
                  {rentalProducts.filter((rp) => !rp.bundle).map((rp) => (
                    <button
                      key={rp.id}
                      onClick={() => {
                        setSpeaker(rp.id);
                        nextStep();
                      }}
                      className={`rounded-xl border p-3 text-center transition active:scale-[0.98] ${
                        speaker === rp.id
                          ? "border-brand-500 bg-brand-500/10"
                          : "border-white/15 border-dashed hover:border-brand-500/40 hover:bg-white/[0.02]"
                      }`}
                    >
                      <img loading="lazy" decoding="async" src={rp.image} srcSet={thumbSrcSet(rp.image)} sizes={THUMB_IMAGE_SIZES} alt={locale === "en" ? rp.name_en : rp.name_da} className="mx-auto h-16 w-16 object-contain rounded-lg" />
                      <p className="mt-2 text-sm font-medium text-white/70">
                        {locale === "en" ? rp.name_en : rp.name_da}
                      </p>
                      <p className="text-sm text-brand-400">{rp.price},-</p>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 2: Date picker */}
        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-center text-2xl font-bold">{s.step2Title}</h2>
            <p className="text-center text-sm text-white/50">
              {s.step2Desc}
            </p>

            {/* Hvad booker du? */}
            {(selectedSpeaker || selectedRental || isEffectsOnly) && (
              <div className="flex items-center justify-center">
                <button
                  onClick={() => setStep(1)}
                  className="flex items-center gap-2 rounded-full border border-brand-500/30 bg-brand-500/10 px-4 py-1.5 text-sm font-semibold text-brand-400 transition hover:bg-brand-500/20"
                >
                  {(selectedSpeaker?.product || selectedRental?.image || isEffectsOnly) && (
                    <img loading="lazy" decoding="async" src={isEffectsOnly ? effectsImage : (selectedSpeaker?.product ?? selectedRental?.image)} srcSet={thumbSrcSet(isEffectsOnly ? effectsImage : (selectedSpeaker?.product ?? selectedRental?.image))} sizes={THUMB_IMAGE_SIZES} alt="" className="h-6 w-6 rounded object-contain" />
                  )}
                  {isEffectsOnly
                    ? effectsLabel
                    : (selectedSpeaker?.name ?? rentalName)}
                  <svg className="h-3.5 w-3.5 opacity-60" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                </button>
              </div>
            )}

            {/* Produktinfo: beskrivelse + indhold — især vigtigt for pakker */}
            {(selectedRental || selectedSpeaker) && (
              <div className="glass rounded-2xl p-4">
                <div className="flex items-start gap-4">
                  <img loading="lazy" decoding="async"
                    src={selectedSpeaker?.product ?? selectedRental?.image}
                    srcSet={thumbSrcSet(selectedSpeaker?.product ?? selectedRental?.image)}
                    sizes={THUMB_IMAGE_SIZES}
                    alt=""
                    className="h-20 w-20 shrink-0 rounded-xl bg-[#0d0c12] object-contain p-1"
                  />
                  <div className="min-w-0">
                    <p className="text-sm text-white/60">
                      {selectedSpeaker
                        ? selectedSpeaker.desc
                        : locale === "en"
                          ? selectedRental?.desc_en ?? selectedRental?.desc_da
                          : selectedRental?.desc_da}
                    </p>
                    <p className="mt-1.5 text-lg font-bold text-brand-400">
                      {speakerPrice},-<span className="ml-1 text-xs font-normal text-white/40">{s.fromPerWeekend.replace("fra ", "").replace("from ", "")}</span>
                    </p>
                  </div>
                </div>
                {selectedRental?.bundle?.parts?.length ? (
                  <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-white/10 pt-3">
                    {selectedRental.bundle.parts.map((part, i) => {
                      const partPage =
                        catalog.speakers.find((x) => x.id === part.productId)?.page ??
                        catalog.addons.find((x) => x.id === part.productId)?.page ??
                        catalog.rentalProducts.find((x) => x.id === part.productId)?.page;
                      const label = locale === "en" ? part.label_en : part.label_da;
                      const chip = (
                        <span className={`rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1 text-xs text-white/85 ${partPage ? "transition hover:border-brand-500/50 hover:text-brand-400" : ""}`}>
                          {label}
                          <span className="ml-1 text-white/35">{part.price},-</span>
                        </span>
                      );
                      return (
                        <span key={part.productId} className="contents">
                          {i > 0 && <span className="text-xs text-brand-400/80">+</span>}
                          {partPage ? <a href={partPage}>{chip}</a> : chip}
                        </span>
                      );
                    })}
                  </div>
                ) : (selectedRental?.contents?.length || selectedSpeaker?.contents?.length) ? (
                  <ul className="mt-3 grid grid-cols-1 gap-1.5 border-t border-white/10 pt-3 sm:grid-cols-2">
                    {(selectedRental?.contents ?? selectedSpeaker?.contents ?? []).map((item) => (
                      <li key={item} className="flex items-start gap-2 text-sm text-white/70">
                        <svg className="mt-0.5 h-4 w-4 shrink-0 text-brand-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        {item}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            )}

            <MiniCalendar
              pickupDate={pickupDate}
              returnDate={returnDate}
              onSelectDate={handleDateSelect}
              locale={locale}
              hours={hours}
            />

            <div className="glass rounded-xl p-4 text-sm">
              <div className="flex justify-between">
                <span className="text-white/50">{s.pickup}</span>
                <span className={pickupDate ? "text-white font-medium" : "text-white/30"}>
                  {pickupDate ? formatDate(pickupDate) : s.selectDate}
                </span>
              </div>
              <div className="flex justify-between mt-2">
                <span className="text-white/50">{s.returnLabel}</span>
                <span className={returnDate ? "text-white font-medium" : "text-white/30"}>
                  {returnDate ? formatDate(returnDate) : s.selectDate}
                </span>
              </div>
              {pickupDate && returnDate && !isEffectsOnly && (
                <div className="flex justify-between mt-3 pt-3 border-t border-white/10">
                  <span className="text-white/50">{s.price} — {locale === "en" ? "whole rental" : "hele lejeperioden"} ({rentalDays} {rentalDays === 1 ? s.day : s.days})</span>
                  <span className="text-brand-400 font-bold">{speakerPrice} kr</span>
                </div>
              )}
            </div>

            {soldOutMsg && (
              <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-3 text-center text-sm text-red-400">
                {soldOutMsg}
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button onClick={prevStep} className="flex-1 rounded-xl border border-white/10 py-3 font-medium transition hover:bg-white/5">
                {s.back}
              </button>
              <button
                onClick={nextStep}
                disabled={!pickupDate || !returnDate || !!soldOutMsg}
                className="flex-1 rounded-xl bg-brand-500 py-3 font-semibold text-black transition hover:bg-brand-400 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                {s.next}
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Addons */}
        {step === 3 && (
          <div className="space-y-4">
            <h2 className="text-center text-2xl font-bold">{s.step3Title}</h2>
            <p className="text-center text-sm text-white/50">{s.step3Desc}</p>

            {/* Simpel søgning: tilvalg + andet udstyr */}
            <div className="relative">
              <svg className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="7" /><path d="m21 21-4.35-4.35" />
              </svg>
              <input
                type="search"
                value={addonSearch}
                onChange={(e) => setAddonSearch(e.target.value)}
                placeholder={s.addonSearchPlaceholder}
                className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-white/30 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>

            {/* Kompakte tilvalgs-rækker — passer på én skærm.
                Kørsel har sit eget felt nederst og er ikke med her. */}
            <div className="space-y-2">
              {visibleAddons
                .filter((a) => !DELIVERY_IDS.includes(a.id))
                .filter((a) => {
                  const q = addonSearch.trim().toLowerCase();
                  if (!q) return true;
                  return a.label.toLowerCase().includes(q) || a.desc.toLowerCase().includes(q);
                })
                .map((a) => {
                  const selected = selectedAddons.includes(a.id);
                  return (
                    <div key={a.id}>
                      <button
                        onClick={() => toggleAddon(a.id)}
                        className={`flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition active:scale-[0.99] ${
                          selected ? "border-brand-500 bg-brand-500/10" : "border-white/10 bg-white/[0.03] hover:border-white/25"
                        }`}
                      >
                        <div
                          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition ${
                            selected ? "border-brand-500 bg-brand-500" : "border-white/20 bg-white/5"
                          }`}
                        >
                          {selected && (
                            <svg className="h-3.5 w-3.5 text-black" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                        {a.image && (
                          <img loading="lazy" decoding="async" src={a.image} srcSet={thumbSrcSet(a.image)} sizes={THUMB_IMAGE_SIZES} alt="" className="h-10 w-10 shrink-0 rounded-lg bg-[#0d0c12] object-contain p-0.5" />
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold">{a.label}</p>
                          <p className="truncate text-xs text-white/40">{a.desc}</p>
                        </div>
                        <p className="shrink-0 text-sm font-bold text-brand-400">+{a.price},-</p>
                      </button>
                    </div>
                  );
                })}
            </div>

            <DeliveryPicker
              locale={locale}
              options={addons
                .filter((a) => DELIVERY_IDS.includes(a.id))
                .map((a) => ({ id: a.id, label: a.label, desc: a.desc, price: a.price }))}
              value={deliveryChoice}
              onSelect={(id) => {
                setSelectedAddons((prev) => {
                  const rest = prev.filter((x) => !DELIVERY_IDS.includes(x));
                  return id ? [...rest, id] : rest;
                });
                if (!id) setDeliveryAddress("");
              }}
              address={deliveryAddress}
              onAddressChange={setDeliveryAddress}
              addressMissing={deliveryAddressMissing && showDeliveryError}
            />

            {/* Resten af sortimentet — vises ALTID, ikke kun når man søger.
                Tidligere skulle man gætte sig til at skrive i søgefeltet for at
                finde fx uplights, så kunder bookede kun ét produkt. */}
            {(() => {
              const q = addonSearch.trim().toLowerCase();
              const currentCategory =
                selectedRental?.category ?? (selectedSpeaker ? "lyd" : undefined);
              const pool = [
                ...speakers
                  .filter((sp) => sp.id !== speaker)
                  .map((sp) => ({ id: sp.id, name: sp.name, price: sp.price, image: sp.product, category: "lyd" })),
                ...rentalProducts
                  .filter((rp) => rp.id !== speaker && !rp.bundle)
                  .map((rp) => ({
                    id: rp.id,
                    name: locale === "en" ? rp.name_en : rp.name_da,
                    price: rp.price,
                    image: rp.image,
                    category: rp.category,
                  })),
              ].filter((prod) => !cartItems.some((c) => c.productId === prod.id));

              const matches = q
                ? pool.filter((p) => p.name.toLowerCase().includes(q))
                : // Uden søgning: samme kategori først — det er dér krydssalget ligger
                  [...pool].sort((a, b) => {
                    const rank = (x: typeof a) => (x.category === currentCategory ? 0 : 1);
                    return rank(a) - rank(b);
                  });
              const shown = matches.slice(0, q ? 6 : 6);
              if (!shown.length) return null;

              return (
                <div className="space-y-2">
                  <p className="pt-1 text-sm text-white/40">
                    {q
                      ? locale === "en" ? "Search results" : "Søgeresultater"
                      : locale === "en" ? "Add more to your order" : "Tilføj mere til din ordre"}
                  </p>
                  {shown.map((prod) => (
                    <button
                      key={prod.id}
                      onClick={() => {
                        setCartItems((prev) => [...prev, { productId: prod.id, name: prod.name, price: prod.price }]);
                        setAddonSearch("");
                      }}
                      className="flex w-full items-center gap-3 rounded-xl border border-dashed border-white/15 px-3 py-2.5 text-left transition hover:border-brand-500/40"
                    >
                      <img loading="lazy" decoding="async" src={prod.image} srcSet={thumbSrcSet(prod.image)} sizes={THUMB_IMAGE_SIZES} alt="" className="h-10 w-10 shrink-0 rounded-lg bg-[#0d0c12] object-contain p-0.5" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold">{prod.name}</p>
                        <p className="text-xs text-white/40">{s.addToCartHint}</p>
                      </div>
                      <p className="shrink-0 text-sm font-bold text-brand-400">+{prod.price},-</p>
                    </button>
                  ))}
                </div>
              );
            })()}

            {/* Cart: already added items */}
            {cartItems.length > 0 && (
              <div className="glass rounded-xl p-4">
                <p className="text-xs text-white/40 mb-2">{locale === "en" ? "Already in cart:" : "Allerede i kurven:"}</p>
                {cartItems.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-sm py-1">
                    <span className="text-white/70">{item.name}</span>
                    <span className="flex items-center gap-3">
                      <span className="text-brand-400">{item.price} kr</span>
                      <button type="button" onClick={() => removeCartItem(idx)} className="text-white/30 hover:text-red-400 text-xs">✕</button>
                    </span>
                  </div>
                ))}
              </div>
            )}

            <PriceSummary />

            {/* Add another product to cart */}
            {!!speaker && (
              <button
                type="button"
                onClick={addCurrentToCart}
                className="w-full rounded-xl border border-dashed border-white/20 py-3 text-sm text-white/50 transition hover:border-brand-500/40 hover:text-brand-400"
              >
                {locale === "en" ? "+ Add another product" : "+ Tilføj et produkt mere"}
              </button>
            )}

            <div className="flex gap-3 pt-2">
              <button onClick={prevStep} className="flex-1 rounded-xl border border-white/10 py-3 font-medium transition hover:bg-white/5">
                {s.back}
              </button>
              <button
                onClick={() => {
                  if (deliveryAddressMissing) { setShowDeliveryError(true); return; }
                  nextStep();
                }}
                className="flex-1 rounded-xl bg-brand-500 py-3 font-semibold text-black transition hover:bg-brand-400 active:scale-95"
              >
                {s.next}
              </button>
            </div>
            <button
              onClick={() => {
                if (deliveryAddressMissing) { setShowDeliveryError(true); return; }
                setSelectedAddons((prev) => prev.filter((id) => DELIVERY_IDS.includes(id)));
                setStep(4);
              }}
              className="w-full py-1 text-center text-sm text-white/40 underline underline-offset-4 transition hover:text-white/70"
            >
              {s.skipAddons}
            </button>
          </div>
        )}

        {/* Stripe Embedded Checkout */}
        {checkoutSecret && (
          <div className="space-y-4">
            <h2 className="text-center text-2xl font-bold">{locale === "en" ? "Payment" : "Betaling"}</h2>
            <p className="text-center text-sm text-white/50">
              {locale === "en" ? "Pay securely with card — powered by Stripe" : "Betal sikkert med kort — sikret af Stripe"}
            </p>
            <div id="stripe-checkout" className="overflow-hidden rounded-2xl bg-white" />
            <button
              onClick={() => { setCheckoutSecret(null); setSubmitting(false); }}
              className="w-full py-1 text-center text-sm text-white/40 underline underline-offset-4 transition hover:text-white/70"
            >
              {locale === "en" ? "Back (pay at pickup instead)" : "Tilbage (betal ved afhentning i stedet)"}
            </button>
          </div>
        )}

        {/* Step 4: Contact + Submit */}
        {!checkoutSecret && step === 4 && (
          <form id="booking-form" name="booking" onSubmit={handleSubmit} className="space-y-4">
            <h2 className="text-center text-2xl font-bold">{s.step4Title}</h2>
            <p className="text-center text-sm text-white/50">
              {s.step4Desc}
            </p>

            <div className="mt-6 space-y-3">
              <input
                required
                type="text"
                name="name"
                id="booking-name"
                autoComplete="name"
                placeholder={s.formName}
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3.5 text-white placeholder:text-white/30 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
              <input
                type="text"
                name="organization"
                id="booking-company"
                autoComplete="organization"
                placeholder={s.formCompany}
                value={form.company}
                onChange={(e) => setForm({ ...form, company: e.target.value })}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3.5 text-white placeholder:text-white/30 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
              <input
                required
                type="email"
                name="email"
                id="booking-email"
                autoComplete="email"
                inputMode="email"
                placeholder={s.formEmail}
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3.5 text-white placeholder:text-white/30 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
              <input
                required
                type="tel"
                name="tel"
                id="booking-phone"
                autoComplete="tel"
                inputMode="tel"
                placeholder={s.formPhone}
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3.5 text-white placeholder:text-white/30 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
              <textarea
                rows={3}
                name="comment"
                id="booking-comment"
                placeholder={s.formComment}
                value={form.comment}
                onChange={(e) => setForm({ ...form, comment: e.target.value })}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3.5 text-white placeholder:text-white/30 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 resize-none"
              />

              <label className="flex items-start gap-3 cursor-pointer rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3.5 transition hover:border-white/20">
                <input
                  type="checkbox"
                  checked={newsletter}
                  onChange={(e) => setNewsletter(e.target.checked)}
                  className="mt-0.5 h-5 w-5 shrink-0 rounded border-white/20 bg-white/5 text-brand-500 focus:ring-brand-500 accent-[#a3e635]"
                />
                <span className="text-sm text-white/60">
                  {locale === "en"
                    ? "Send me deals and news about new gear for rent (optional)"
                    : "Send mig tilbud og nyt om udstyr til leje (valgfrit)"}
                </span>
              </label>

              {/* GDPR art. 13: oplysningspligt ved indsamling af personoplysninger */}
              <p className="px-1 text-xs leading-relaxed text-white/35">
                {locale === "en" ? (
                  <>
                    We use your name, email and phone number to process your booking and send
                    you a confirmation. Read how we handle your data in our{" "}
                    <a href="/privatlivspolitik" target="_blank" rel="noopener noreferrer" className="text-brand-400 underline underline-offset-2 hover:text-brand-300">
                      privacy policy
                    </a>
                    . By booking you accept our{" "}
                    <a href="/lejevilkaar" target="_blank" rel="noopener noreferrer" className="text-brand-400 underline underline-offset-2 hover:text-brand-300">
                      rental terms
                    </a>
                    .
                  </>
                ) : (
                  <>
                    Vi bruger dit navn, din e-mail og dit telefonnummer til at behandle din
                    booking og sende dig en bekræftelse. Læs hvordan vi behandler dine
                    oplysninger i vores{" "}
                    <a href="/privatlivspolitik" target="_blank" rel="noopener noreferrer" className="text-brand-400 underline underline-offset-2 hover:text-brand-300">
                      privatlivspolitik
                    </a>
                    . Når du booker, accepterer du vores{" "}
                    <a href="/lejevilkaar" target="_blank" rel="noopener noreferrer" className="text-brand-400 underline underline-offset-2 hover:text-brand-300">
                      lejevilkår
                    </a>
                    .
                  </>
                )}
              </p>
            </div>

            {/* Order summary */}
            <div className="glass rounded-2xl p-5">
              {summer && (
                <div className="mb-3 flex items-center gap-2 rounded-lg bg-amber-500/10 border border-amber-500/20 px-3 py-2 text-xs font-semibold text-amber-400">
                  <span className="rounded-full bg-amber-500 px-1.5 py-0.5 text-[10px] font-bold text-black">{summerLabel.badge}</span>
                  {summerLabel.banner}
                </div>
              )}
              {cartItems.map((item, idx) => (
                <div key={idx} className="flex justify-between text-sm text-white/50">
                  <span>{item.name}</span>
                  <span>{item.price} kr</span>
                </div>
              ))}
              {selectedSpeaker && (
                <div className="flex justify-between text-sm text-white/50">
                  <span>{selectedSpeaker.name}{s.speakerSuffix}</span>
                  <span>
                    {summer && <span className="line-through text-white/30 mr-2">{speakerBasePrice} kr</span>}
                    {speakerPrice} kr
                  </span>
                </div>
              )}
              {isRentalOnly && rentalName && (
                <div className="flex justify-between text-sm text-white/50">
                  <span>{rentalName}</span>
                  <span>
                    {summer && <span className="line-through text-white/30 mr-2">{speakerBasePrice} kr</span>}
                    {speakerPrice} kr
                  </span>
                </div>
              )}
              <div className="text-sm text-white/30">
                <span>{periodLabel}</span>
              </div>
              {addons
                .filter((a) => selectedAddons.includes(a.id))
                .map((a) => (
                  <div key={a.id} className="flex justify-between text-sm text-white/50">
                    <span>{a.label}</span>
                    <span>
                      {summer && <span className="line-through text-white/30 mr-2">{a.price} kr</span>}
                      {summer ? applyDiscount(a.price) : a.price} kr
                    </span>
                  </div>
                ))}
              {hasDelivery && deliveryAddress && (
                <div className="text-sm text-white/30">
                  {s.successDelivery}: {deliveryAddress}
                </div>
              )}
              {/* Rabatkode */}
              <div className="mt-3 border-t border-white/10 pt-3">
                {coupon ? (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-emerald-400">
                      {coupon.code} · −{coupon.pct}% {s.discountApplied}
                    </span>
                    <button
                      type="button"
                      onClick={() => { setCoupon(null); setCouponInput(""); }}
                      className="text-white/40 hover:text-white/70"
                      aria-label="Fjern rabatkode"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponInput}
                      onChange={(e) => { setCouponInput(e.target.value); setCouponError(false); }}
                      onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); applyCoupon(); } }}
                      placeholder={s.discountPlaceholder}
                      autoComplete="off"
                      className="min-w-0 flex-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm placeholder-white/30 focus:border-brand-500 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={applyCoupon}
                      disabled={couponChecking || !couponInput.trim()}
                      className="rounded-xl border border-white/10 px-4 py-2 text-sm text-white/70 transition hover:bg-white/5 disabled:opacity-40"
                    >
                      {couponChecking ? "…" : s.discountApply}
                    </button>
                  </div>
                )}
                {couponError && <p className="mt-1 text-xs text-red-400">{s.discountInvalid}</p>}
              </div>
              <div className="mt-3 flex justify-between border-t border-white/10 pt-3 text-lg font-bold">
                <span>{s.total}</span>
                <span className={summer ? "text-amber-400" : "text-brand-400"}>
                  {(summer || coupon) && <span className="text-sm line-through text-white/30 mr-2 font-normal">{totalBeforeDiscount} kr</span>}
                  {total} kr
                </span>
              </div>
              <p className="mt-1 text-right text-xs text-white/30">
                {payMethod === "online" ? (locale === "en" ? "Paid securely online" : "Betales sikkert online") : s.paidAtPickup}
              </p>
            </div>

            {/* Betalingsvalg */}
            <div className="glass rounded-2xl p-4 space-y-2">
              <p className="text-sm font-semibold text-white/70">{locale === "en" ? "Payment" : "Betaling"}</p>
              {([
                { id: "online" as const, label: locale === "en" ? "Pay now with card" : "Betal nu med kort" },
                { id: "pickup" as const, label: locale === "en" ? "Pay at pickup" : "Betal ved afhentning" },
              ]).map((opt) => (
                <label key={opt.id} className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 transition ${payMethod === opt.id ? "border-brand-500 bg-brand-500/10" : "border-white/10 hover:border-white/25"}`}>
                  <input
                    type="radio"
                    name="paymethod"
                    checked={payMethod === opt.id}
                    onChange={() => setPayMethod(opt.id)}
                    className="h-4 w-4 accent-[#ffd600]"
                  />
                  <span className="text-sm text-white/80">{opt.label}</span>
                </label>
              ))}
            </div>

            {error && (
              <p className="rounded-xl bg-red-500/10 p-3 text-center text-sm text-red-400">
                {error}
              </p>
            )}

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={prevStep}
                className="flex-1 rounded-xl border border-white/10 py-3 font-medium transition hover:bg-white/5"
              >
                {s.back}
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 rounded-xl bg-brand-500 py-3.5 font-semibold text-black transition hover:bg-brand-400 active:scale-95 disabled:opacity-50"
              >
                {submitting ? s.sending : payMethod === "online" ? (locale === "en" ? "Continue to payment" : "Videre til betaling") : s.sendBooking}
              </button>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}
