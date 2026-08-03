"use client";

import { useState, useMemo, useEffect, useCallback, useRef, FormEvent } from "react";
import { type Locale, t } from "@/lib/i18n";

import { dayMultiplier, isSummerSale, applyDiscount } from "@/lib/products";
import { useProducts } from "@/lib/useProducts";

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
}: {
  pickupDate: Date | null;
  returnDate: Date | null;
  onSelectDate: (d: Date) => void;
  locale?: Locale;
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
        <button type="button" onClick={() => setViewMonth((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1))} className="rounded-lg p-2 hover:bg-white/10 transition">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" /></svg>
        </button>
        <span className="font-semibold">
          {s.monthNames[viewMonth.getMonth()]} {viewMonth.getFullYear()}
        </span>
        <button type="button" onClick={() => setViewMonth((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1))} className="rounded-lg p-2 hover:bg-white/10 transition">
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
          const isPast = date < today;
          const isPickup = pickupDate && isSameDay(date, pickupDate);
          const isReturn = returnDate && isSameDay(date, returnDate);
          const isInRange = pickupDate && returnDate && date > pickupDate && date < returnDate;
          const isTooFar = pickupDate && !returnDate && diffDays(pickupDate, date) > 5;
          const isHotFriday = hotFridays.has(dateKey(date));

          return (
            <button
              type="button"
              key={dateKey(date)}
              disabled={isPast || !!isTooFar}
              onClick={() => onSelectDate(date)}
              className={`
                relative h-10 rounded-lg text-sm font-medium transition
                ${isPast || isTooFar ? "text-white/15 cursor-not-allowed" : "hover:bg-white/10 cursor-pointer"}
                ${isPickup ? "bg-brand-500 text-black font-bold" : ""}
                ${isReturn ? "bg-brand-600 text-black font-bold" : ""}
                ${isInRange ? "bg-brand-500/20 text-brand-300" : ""}
                ${isHotFriday && !isPast && !isPickup ? "ring-1 ring-orange-400/50" : ""}
              `}
            >
              {date.getDate()}
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

      {/* Nudge */}
      <div className="mt-3 flex items-center gap-2 rounded-lg bg-orange-400/10 px-3 py-2 text-xs text-orange-300">
        <span className="flex h-2 w-2 shrink-0 rounded-full bg-orange-400" />
        {s.calendarNudge}
      </div>
    </div>
  );
}

/* ───── Pickup Info ───── */

function PickupInfo({ locale = "da" }: { locale?: Locale }) {
  const s = t[locale].booking;
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
          <p className="font-medium text-white">{s.pickupAddress}</p>
          <p className="mt-1 text-white/40">
            {s.pickupDesc}
            <br />
            {s.pickupDesc2}
          </p>
        </div>
      </div>
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
  const [form, setForm] = useState({ name: "", email: "", phone: "", comment: "" });
  const [newsletter, setNewsletter] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
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

  // Preselect product from ?product=ID — re-runs on soft-nav (urlTick)
  useEffect(() => {
    if (preselected.current || typeof window === "undefined") return;
    const product = new URLSearchParams(window.location.search).get("product");
    if (!product) return;

    // Lys / røg as effects-only
    if (product === "lys" || product === "rog") {
      console.log("[booking] Preselect effects-only:", product);
      preselected.current = true;
      setSpeaker("effects-only");
      setSelectedAddons([product]);
      setStep(2);
      return;
    }

    // Speakers
    if (speakers.some((sp) => sp.id === product)) {
      console.log("[booking] Preselect speaker:", product);
      preselected.current = true;
      setSpeaker(product);
      setStep(2);
      return;
    }

    // Standalone rental products (lyskæder, discokugle, AV, festpakker, …)
    if (rentalProducts.some((p) => p.id === product)) {
      console.log("[booking] Preselect rental:", product);
      preselected.current = true;
      setSpeaker(product);
      setStep(2);
      return;
    }

    console.log("[booking] Product not found yet, waiting:", product);
  }, [speakers, rentalProducts, urlTick]);

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
        }
        // Also check lys if it's an addon
        if (selectedAddons.includes("lys")) {
          const lysRemaining = getRemaining(data, "lys");
          if (lysRemaining <= 0) {
            setSoldOutMsg(s.lightsSoldOutPeriod);
          }
        }
      }
    } catch {
      // Don't block booking on fetch failure
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
  const DELIVERY_IDS = ["levering", "levering_opsaetning"];
  const hasDelivery = selectedAddons.some((id) => DELIVERY_IDS.includes(id));

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
  const total = speakerPrice + addonsPrice + cartTotal;
  const totalBeforeDiscount = summer ? speakerBasePrice + addonsBasePrice + cartTotal : total;

  // Kurv-summary op til draweren (fane når draweren er pakket væk)
  const cartCount = cartItems.length + (speaker ? 1 : 0);
  useEffect(() => {
    onSummaryChange?.({ count: cartCount, total });
  }, [cartCount, total, onSummaryChange]);

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
    if (!speaker || speaker === "effects-only") return;
    const name = selectedSpeaker
      ? selectedSpeaker.name
      : selectedRental
        ? (locale === "en" ? selectedRental.name_en : selectedRental.name_da)
        : speaker;
    setCartItems((prev) => [...prev, { productId: speaker, name, price: speakerPrice }]);
    // Reset current selection, keep dates
    setSpeaker(null);
    setSelectedAddons([]);
    setDeliveryAddress("");
    setStep(1);
  }

  function removeCartItem(idx: number) {
    setCartItems((prev) => prev.filter((_, i) => i !== idx));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
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
          deliveryAddress: hasDelivery ? deliveryAddress : undefined,
          total,
          locale,
          newsletter,
          ...form,
        }),
      });

      if (!res.ok) throw new Error(s.bookingFailed);
      // Subscribe to newsletter if checked
      if (newsletter && form.email) {
        fetch("/api/newsletter", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: form.email }),
        }).catch(() => {});
      }
      // Push conversion event to GTM dataLayer
      if (typeof window !== "undefined" && (window as any).dataLayer) {
        (window as any).dataLayer.push({
          event: "booking_complete",
          booking_value: total,
          booking_currency: "DKK",
          booking_product: isEffectsOnly ? "effects-only" : speaker,
        });
      }
      setDone(true);
    } catch {
      setError(s.errorRetry);
    } finally {
      setSubmitting(false);
    }
  }

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
            <span>{selectedSpeaker.name}{s.speakerSuffix} ({rentalDays} {rentalDays === 1 ? s.day : s.days})</span>
            <span>
              {summer && <span className="line-through text-white/30 mr-2">{speakerBasePrice} kr</span>}
              {speakerPrice} kr
            </span>
          </div>
        )}
        {isRentalOnly && rentalName && (
          <div className="flex justify-between text-sm text-white/50">
            <span>{rentalName} ({rentalDays} {rentalDays === 1 ? s.day : s.days})</span>
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
        <div className="mt-3 flex justify-between border-t border-white/10 pt-3 text-lg font-bold">
          <span>{s.total}</span>
          <span className={summer ? "text-amber-400" : "text-brand-400"}>
            {summer && <span className="text-sm line-through text-white/30 mr-2 font-normal">{totalBeforeDiscount} kr</span>}
            {total} kr
          </span>
        </div>
        <p className="mt-1 text-right text-xs text-white/30">{s.paidAtPickup}</p>
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
              <img src={isEffectsOnly ? (hasLights ? "/images/product-lys.png" : "/images/product-rog.png") : selectedRental?.image ?? selectedSpeaker?.product} alt={isEffectsOnly ? (hasLights ? "Lys-pakke med LED-lamper og centereffekt" : "Røgmaskine til fest") : rentalName ?? `${selectedSpeaker?.name ?? "Højtalerpakke"}`} className="h-16 w-16 object-contain rounded-lg" />
              <div>
                <p className="font-semibold">{isEffectsOnly ? s.effectsOnlyLabel : isRentalOnly ? rentalName : `${selectedSpeaker?.name}${s.speakerSuffix}`}</p>
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
                    : s.successPickup}
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
            style={{ backgroundImage: "url(/images/hero.png)", opacity: speaker === null ? 0.5 : 0 }}
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
                      <img
                        src={sp.product}
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
                      <p className="mt-1 text-sm text-white/50">
                        {sp.size} &mdash; {sp.capacity}
                      </p>
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
                  <img src="/images/product-lys.png" alt="Lys-pakke med LED-lamper og centereffekt" className="mx-auto h-12 w-12 object-contain rounded-lg" />
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
                  <img src="/images/product-rog.png" alt="Røgmaskine til fest" className="mx-auto h-12 w-12 object-contain rounded-lg" />
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
                      <img src={rp.image} alt={locale === "en" ? rp.name_en : rp.name_da} className="mx-auto h-16 w-16 object-contain rounded-lg" />
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
                  {(selectedSpeaker?.product || selectedRental?.image) && (
                    <img src={selectedSpeaker?.product ?? selectedRental?.image} alt="" className="h-6 w-6 rounded object-contain" />
                  )}
                  {isEffectsOnly
                    ? s.effectsOnlyLabel
                    : (selectedSpeaker?.name ?? rentalName)}
                  <svg className="h-3.5 w-3.5 opacity-60" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                </button>
              </div>
            )}

            {/* Produktinfo: beskrivelse + indhold — især vigtigt for pakker */}
            {(selectedRental || selectedSpeaker) && (
              <div className="glass rounded-2xl p-4">
                <div className="flex items-start gap-4">
                  <img
                    src={selectedSpeaker?.product ?? selectedRental?.image}
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
                  <span className="text-white/50">{s.price} ({rentalDays} {rentalDays === 1 ? s.day : s.days})</span>
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

            {/* Kompakte tilvalgs-rækker — passer på én skærm */}
            <div className="space-y-2">
              {visibleAddons
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
                          <img src={a.image} alt="" className="h-10 w-10 shrink-0 rounded-lg bg-[#0d0c12] object-contain p-0.5" />
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold">{a.label}</p>
                          <p className="truncate text-xs text-white/40">{a.desc}</p>
                        </div>
                        <p className="shrink-0 text-sm font-bold text-brand-400">+{a.price},-</p>
                      </button>

                      {/* Delivery address field */}
                      {DELIVERY_IDS.includes(a.id) && selected && (
                        <div className="px-2 pt-2">
                          <input
                            type="text"
                            placeholder={s.deliveryPlaceholder}
                            value={deliveryAddress}
                            onChange={(e) => setDeliveryAddress(e.target.value)}
                            className="w-full rounded-xl border border-brand-500/30 bg-white/5 px-4 py-3 text-white placeholder:text-white/30 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>

            {/* Søgeresultater fra resten af sortimentet -> direkte i kurven */}
            {addonSearch.trim() && (
              <div className="space-y-2">
                {[
                  ...speakers
                    .filter((sp) => sp.id !== speaker)
                    .filter((sp) => sp.name.toLowerCase().includes(addonSearch.trim().toLowerCase()))
                    .map((sp) => ({ id: sp.id, name: sp.name, price: sp.price, image: sp.product })),
                  ...rentalProducts
                    .filter((rp) => rp.id !== speaker)
                    .filter((rp) => (locale === "en" ? rp.name_en : rp.name_da).toLowerCase().includes(addonSearch.trim().toLowerCase()))
                    .map((rp) => ({ id: rp.id, name: locale === "en" ? rp.name_en : rp.name_da, price: rp.price, image: rp.image })),
                ]
                  .filter((prod) => !cartItems.some((c) => c.productId === prod.id))
                  .slice(0, 4)
                  .map((prod) => (
                    <button
                      key={prod.id}
                      onClick={() => {
                        setCartItems((prev) => [...prev, { productId: prod.id, name: prod.name, price: prod.price }]);
                        setAddonSearch("");
                      }}
                      className="flex w-full items-center gap-3 rounded-xl border border-dashed border-white/15 px-3 py-2.5 text-left transition hover:border-brand-500/40"
                    >
                      <img src={prod.image} alt="" className="h-10 w-10 shrink-0 rounded-lg bg-[#0d0c12] object-contain p-0.5" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold">{prod.name}</p>
                        <p className="text-xs text-white/40">{s.addToCartHint}</p>
                      </div>
                      <p className="shrink-0 text-sm font-bold text-brand-400">+{prod.price},-</p>
                    </button>
                  ))}
              </div>
            )}

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
            {!isRentalOnly && !isEffectsOnly && (
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
              <button onClick={nextStep} className="flex-1 rounded-xl bg-brand-500 py-3 font-semibold text-black transition hover:bg-brand-400 active:scale-95">
                {s.next}
              </button>
            </div>
            <button
              onClick={() => {
                setSelectedAddons((prev) => prev.filter((id) => DELIVERY_IDS.includes(id)));
                setStep(4);
              }}
              className="w-full py-1 text-center text-sm text-white/40 underline underline-offset-4 transition hover:text-white/70"
            >
              {s.skipAddons}
            </button>
          </div>
        )}

        {/* Step 4: Contact + Submit */}
        {step === 4 && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <h2 className="text-center text-2xl font-bold">{s.step4Title}</h2>
            <p className="text-center text-sm text-white/50">
              {s.step4Desc}
            </p>

            <div className="mt-6 space-y-3">
              <input
                required
                type="text"
                placeholder={s.formName}
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3.5 text-white placeholder:text-white/30 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
              <input
                required
                type="email"
                placeholder={s.formEmail}
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3.5 text-white placeholder:text-white/30 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
              <input
                required
                type="tel"
                placeholder={s.formPhone}
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3.5 text-white placeholder:text-white/30 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
              <textarea
                rows={3}
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
                    ? "Send me deals and news about new gear for rent"
                    : "Send mig tilbud og nyt om udstyr til leje"}
                </span>
              </label>
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
                  <span>{selectedSpeaker.name}{s.speakerSuffix} ({rentalDays} {rentalDays === 1 ? s.day : s.days})</span>
                  <span>
                    {summer && <span className="line-through text-white/30 mr-2">{speakerBasePrice} kr</span>}
                    {speakerPrice} kr
                  </span>
                </div>
              )}
              {isRentalOnly && rentalName && (
                <div className="flex justify-between text-sm text-white/50">
                  <span>{rentalName} ({rentalDays} {rentalDays === 1 ? s.day : s.days})</span>
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
              <div className="mt-3 flex justify-between border-t border-white/10 pt-3 text-lg font-bold">
                <span>{s.total}</span>
                <span className={summer ? "text-amber-400" : "text-brand-400"}>
                  {summer && <span className="text-sm line-through text-white/30 mr-2 font-normal">{totalBeforeDiscount} kr</span>}
                  {total} kr
                </span>
              </div>
              <p className="mt-1 flex items-center justify-end gap-1.5 text-xs text-white/30">
                <span className="inline-flex items-center rounded-full bg-[#5A78FF]/15 px-1.5 py-0.5 text-[10px] font-semibold text-[#7B93FF]">MobilePay</span>
                {s.paidAtPickup}
              </p>
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
                {submitting ? s.sending : s.sendBooking}
              </button>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}
