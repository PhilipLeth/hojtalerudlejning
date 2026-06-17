"use client";

import { useState, useMemo, useEffect, useCallback, FormEvent } from "react";
import { type Locale, t } from "@/lib/i18n";

import { speakers as speakersData, addons as addonsData, dayMultiplier } from "@/lib/products";

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

export default function BookingFlow({ locale = "da" }: { locale?: Locale }) {
  const s = t[locale].booking;

  // Build localized speaker/addon arrays with prices from data
  const speakers = useMemo(() => speakersData.map((sd, i) => ({
    ...sd,
    name: s.speakers[i].name,
    size: s.speakers[i].size,
    capacity: s.speakers[i].capacity,
    desc: s.speakers[i].desc,
    extra: s.speakers[i].extra,
  })), [s]);

  const addons = useMemo(() => addonsData.map((ad, i) => ({
    ...ad,
    label: s.addons[i].label,
    desc: s.addons[i].desc,
  })), [s]);

  const [step, setStep] = useState(1);
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

  // Availability state
  const [availOverview, setAvailOverview] = useState<AvailabilityData | null>(null);
  const [availSelected, setAvailSelected] = useState<AvailabilityData | null>(null);
  const [soldOutMsg, setSoldOutMsg] = useState("");

  // Fetch availability for the next 8 weekends on mount (overview for step 1)
  useEffect(() => {
    const today = new Date();
    const from = dateKey(today);
    const future = new Date(today);
    future.setDate(future.getDate() + 60);
    const to = dateKey(future);
    fetch(`/api/availability?from=${from}&to=${to}`)
      .then((r) => r.json())
      .then((data: AvailabilityData) => setAvailOverview(data))
      .catch(() => {});
  }, []);

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
        if (remaining <= 0 || blocked) {
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
  const hasLights = selectedAddons.includes("lys");
  const hasDelivery = selectedAddons.includes("levering");

  const rentalDays = pickupDate && returnDate ? diffDays(pickupDate, returnDate) : 3;
  const multiplier = dayMultiplier[rentalDays] ?? 1;
  const speakerPrice = selectedSpeaker ? Math.round(selectedSpeaker.price * multiplier) : 0;
  const addonsPrice = addons
    .filter((a) => selectedAddons.includes(a.id))
    .reduce((sum, a) => sum + a.price, 0);
  const total = speakerPrice + addonsPrice;

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
    setSelectedAddons((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );
    if (id === "levering" && selectedAddons.includes("levering")) {
      setDeliveryAddress("");
    }
  }

  function nextStep() {
    setStep((st) => Math.min(st + 1, 4));
  }

  function prevStep() {
    setStep((st) => Math.max(st - 1, 1));
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
          speaker: isEffectsOnly ? (locale === "en" ? "Effects only" : "Kun effekter") : selectedSpeaker?.name,
          speakerSize: isEffectsOnly ? "—" : selectedSpeaker?.size,
          period: periodLabel,
          pickup: pickupDate?.toISOString(),
          returnDate: returnDate?.toISOString(),
          days: rentalDays,
          addons: addons
            .filter((a) => selectedAddons.includes(a.id))
            .map((a) => a.label),
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
        {selectedSpeaker && (
          <div className="flex justify-between text-sm text-white/50">
            <span>{selectedSpeaker.name}{s.speakerSuffix} ({rentalDays} {rentalDays === 1 ? s.day : s.days})</span>
            <span>{speakerPrice} kr</span>
          </div>
        )}
        {addons
          .filter((a) => selectedAddons.includes(a.id))
          .map((a) => (
            <div key={a.id} className="flex justify-between text-sm text-white/50">
              <span>{a.label}</span>
              <span>{a.price} kr</span>
            </div>
          ))}
        <div className="mt-3 flex justify-between border-t border-white/10 pt-3 text-lg font-bold">
          <span>{s.total}</span>
          <span className="text-brand-400">{total} kr</span>
        </div>
        <p className="mt-1 text-right text-xs text-white/30">{s.paidAtPickup}</p>
      </div>
    );
  }

  if (done) {
    const orderItems = [
      ...(selectedSpeaker ? [{ label: `${selectedSpeaker.name}${s.speakerSuffix} (${selectedSpeaker.size})`, value: `${speakerPrice} kr` }] : []),
      ...addons.filter((a) => selectedAddons.includes(a.id)).map((a) => ({ label: a.label, value: `${a.price} kr` })),
    ];

    return (
      <section id="book" className="relative overflow-hidden">
        {speakersData.map((sd) => (
          <div
            key={sd.id}
            className="fixed inset-0 bg-cover bg-center transition-opacity duration-700"
            style={{ backgroundImage: `url(${sd.mood})`, opacity: speaker === sd.id ? 0.5 : 0 }}
          />
        ))}
        <div className="fixed inset-0 bg-gradient-to-b from-[#07060b]/50 via-[#07060b]/60 to-[#07060b]/90" />


        <div className="relative z-20 mx-auto max-w-lg px-4 py-16">
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
              <img src={isEffectsOnly ? (hasLights ? "/images/product-lys.png" : "/images/product-rog.png") : selectedSpeaker?.product} alt={isEffectsOnly ? (hasLights ? "Lys-pakke med LED-lamper og centereffekt" : "Røgmaskine til fest") : `${selectedSpeaker?.name ?? "Højtalerpakke"}`} className="h-16 w-16 object-contain rounded-lg" />
              <div>
                <p className="font-semibold">{isEffectsOnly ? s.effectsOnlyLabel : `${selectedSpeaker?.name}${s.speakerSuffix}`}</p>
                <p className="text-sm text-white/40">{isEffectsOnly ? addons.filter((a) => selectedAddons.includes(a.id) && a.id !== "levering").map((a) => a.label).join(" + ") : `${selectedSpeaker?.size} — ${selectedSpeaker?.capacity}`}</p>
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
              <li>{s.successBag}</li>
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
    <section id="book" className="relative">
      {/* ── Fixed mood background ── */}
      <div
        className="fixed inset-0 bg-cover bg-center transition-opacity duration-700"
        style={{ backgroundImage: "url(/images/hero.png)", opacity: speaker === null ? 0.5 : 0 }}
      />
      {speakersData.map((sd) => (
        <div
          key={sd.id}
          className="fixed inset-0 bg-cover bg-center transition-opacity duration-700 ease-in-out"
          style={{ backgroundImage: `url(${sd.mood})`, opacity: speaker === sd.id ? 0.5 : 0 }}
        />
      ))}
      <div className="fixed inset-0 bg-gradient-to-b from-[#07060b]/50 via-[#07060b]/60 to-[#07060b]/90" />

      {hasLights && <LightBar />}


      {/* ── Content ── */}
      <div className="relative z-20 mx-auto max-w-lg px-4 py-24">
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
                const remaining = getRemaining(availOverview, sp.id);
                const totalUnits = availOverview?.inventory[sp.id] ?? 1;
                const isSoldOut = availOverview !== null && remaining <= 0;
                const isLow = availOverview !== null && remaining > 0 && remaining < totalUnits;

                return (
                  <button
                    key={sp.id}
                    disabled={isSoldOut}
                    onClick={() => {
                      setSpeaker(sp.id);
                      nextStep();
                    }}
                    className={`group w-full overflow-hidden rounded-2xl text-left transition active:scale-[0.98] ${
                      isSoldOut
                        ? "glass opacity-50 cursor-not-allowed"
                        : speaker === sp.id
                          ? "glass-selected"
                          : "glass hover:border-white/20"
                    }`}
                  >
                    <div className="relative h-48 overflow-hidden bg-[#0d0c12]">
                      <img
                        src={sp.product}
                        alt={sp.name}
                        className={`h-full w-full object-contain p-4 transition-transform duration-500 ${isSoldOut ? "" : "group-hover:scale-110"}`}
                      />
                      {isSoldOut && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                          <span className="rounded-full bg-red-500/90 px-4 py-1.5 text-sm font-bold text-white">{s.soldOut}</span>
                        </div>
                      )}
                      {isLow && (
                        <div className="absolute top-3 left-3">
                          <span className="rounded-full bg-orange-500/90 px-3 py-1 text-xs font-bold text-white">{s.fewLeft}</span>
                        </div>
                      )}
                      <div className="absolute bottom-4 right-4 text-right">
                        <p className="text-3xl font-bold text-brand-400">{sp.price},-</p>
                        <p className="text-xs text-white/60">{s.fromPerWeekend}</p>
                      </div>
                    </div>
                    <div className="p-5">
                      <h3 className="text-xl font-semibold">{sp.name}</h3>
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
                {(() => {
                  const lysRemaining = getRemaining(availOverview, "lys");
                  const lysTotal = availOverview?.inventory.lys ?? 2;
                  const lysSoldOut = availOverview !== null && lysRemaining <= 0;
                  const lysLow = availOverview !== null && lysRemaining > 0 && lysRemaining < lysTotal;
                  return (
                    <button
                      disabled={lysSoldOut}
                      onClick={() => {
                        setSpeaker("effects-only");
                        setSelectedAddons(["lys"]);
                        nextStep();
                      }}
                      className={`rounded-xl border border-dashed p-3 text-center transition active:scale-[0.98] ${
                        lysSoldOut
                          ? "border-white/10 opacity-50 cursor-not-allowed"
                          : "border-white/15 hover:border-brand-500/40 hover:bg-white/[0.02]"
                      }`}
                    >
                      <img src="/images/product-lys.png" alt="Lys-pakke med LED-lamper og centereffekt" className="mx-auto h-12 w-12 object-contain rounded-lg" />
                      <p className="mt-2 text-sm font-medium text-white/70">
                        {s.addons[0].label}
                      </p>
                      <p className="text-brand-400 text-sm">{s.lightsOnlyFrom}</p>
                      {lysSoldOut && <span className="mt-1 inline-block rounded-full bg-red-500/90 px-2 py-0.5 text-xs font-bold text-white">{s.soldOut}</span>}
                      {lysLow && <span className="mt-1 inline-block rounded-full bg-orange-500/90 px-2 py-0.5 text-xs font-bold text-white">{s.fewLeft}</span>}
                    </button>
                  );
                })()}

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
                    {s.addons[1].label}
                  </p>
                  <p className="text-brand-400 text-sm">{s.fogOnlyFrom}</p>
                </button>
              </div>
              <p className="text-center text-xs text-white/30">{s.effectsOnlyDesc}</p>
            </div>
          </div>
        )}

        {/* Step 2: Date picker */}
        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-center text-2xl font-bold">{s.step2Title}</h2>
            <p className="text-center text-sm text-white/50">
              {s.step2Desc}
            </p>

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

            <div className="mt-6 space-y-3">
              {addons.map((a) => {
                const selected = selectedAddons.includes(a.id);
                const locked = false;
                return (
                  <div key={a.id} className="space-y-0">
                    <button
                      onClick={() => !locked && toggleAddon(a.id)}
                      className={`w-full overflow-hidden rounded-2xl text-left transition active:scale-[0.98] ${
                        selected ? "glass-selected" : "glass hover:border-white/20"
                      }`}
                    >
                      {/* Show product image for lys when selected */}
                      {a.image && selected && (
                        <div className="relative h-40 overflow-hidden bg-[#0d0c12]">
                          <img
                            src={a.image}
                            alt={a.label}
                            className="h-full w-full object-contain p-3"
                          />
                        </div>
                      )}
                      <div className="flex items-center justify-between p-5">
                        <div className="flex items-center gap-4">
                          <div
                            className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md border transition ${
                              selected ? "border-brand-500 bg-brand-500" : "border-white/20 bg-white/5"
                            }`}
                          >
                            {selected && (
                              <svg className="h-4 w-4 text-black" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </div>
                          <div>
                            <h3 className="font-semibold">{a.label}</h3>
                            <p className="text-sm text-white/40">{a.desc}</p>
                          </div>
                        </div>
                        <p className="text-lg font-bold shrink-0">+{a.price},-</p>
                      </div>
                    </button>

                    {/* Delivery address field */}
                    {a.id === "levering" && selected && (
                      <div className="px-2 pt-3">
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

            <PriceSummary />

            <div className="flex gap-3 pt-2">
              <button onClick={prevStep} className="flex-1 rounded-xl border border-white/10 py-3 font-medium transition hover:bg-white/5">
                {s.back}
              </button>
              <button onClick={nextStep} className="flex-1 rounded-xl bg-brand-500 py-3 font-semibold text-black transition hover:bg-brand-400 active:scale-95">
                {s.next}
              </button>
            </div>
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
                    ? "Send me tips, offers and news about upcoming features"
                    : "Send mig tips, tilbud og nyheder om kommende features"}
                </span>
              </label>
            </div>

            {/* Order summary */}
            <div className="glass rounded-2xl p-5">
              {selectedSpeaker && (
                <div className="flex justify-between text-sm text-white/50">
                  <span>{selectedSpeaker.name}{s.speakerSuffix} ({rentalDays} {rentalDays === 1 ? s.day : s.days})</span>
                  <span>{speakerPrice} kr</span>
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
                    <span>{a.price} kr</span>
                  </div>
                ))}
              {hasDelivery && deliveryAddress && (
                <div className="text-sm text-white/30">
                  {s.successDelivery}: {deliveryAddress}
                </div>
              )}
              <div className="mt-3 flex justify-between border-t border-white/10 pt-3 text-lg font-bold">
                <span>{s.total}</span>
                <span className="text-brand-400">{total} kr</span>
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
