"use client";

import { useState, useMemo, FormEvent } from "react";

/* ───── Data ───── */

const speakers = [
  {
    id: "party",
    name: "Party",
    size: '10"',
    capacity: "Op til 40 pers.",
    price: 400,
    desc: "Perfekt til fødselsdage, havefester og mindre events.",
    product: "/images/product-party.png",
    mood: "/images/mood-party.png",
  },
  {
    id: "festival",
    name: "Festival",
    size: '12"',
    capacity: "40–100 pers.",
    price: 700,
    desc: "Kraftig lyd til store fester, events og udendørs arrangementer.",
    product: "/images/product-festival.png",
    mood: "/images/mood-festival.png",
  },
];

// Price multiplier by number of rental days (base = 3 days / weekend)
const dayMultiplier: Record<number, number> = {
  1: 0.8,
  2: 0.9,
  3: 1.0,
  4: 1.2,
  5: 1.4,
};

const addons = [
  {
    id: "lys",
    label: "Lys-pakke",
    desc: "Festbelysning der sætter stemningen",
    price: 500,
  },
  {
    id: "levering",
    label: "Levering + opsætning",
    desc: "Vi bringer, sætter op og henter i København",
    price: 500,
  },
];

/* ───── Helpers ───── */

const DAY_NAMES = ["Søn", "Man", "Tir", "Ons", "Tor", "Fre", "Lør"];
const MONTH_NAMES = [
  "Januar", "Februar", "Marts", "April", "Maj", "Juni",
  "Juli", "August", "September", "Oktober", "November", "December",
];

function dateKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function addDays(d: Date, n: number) {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

function diffDays(a: Date, b: Date) {
  return Math.round((b.getTime() - a.getTime()) / 86400000);
}

function formatDate(d: Date) {
  return `${DAY_NAMES[d.getDay()]} ${d.getDate()}. ${MONTH_NAMES[d.getMonth()].toLowerCase().slice(0, 3)}`;
}

function isSameDay(a: Date, b: Date) {
  return dateKey(a) === dateKey(b);
}

/* ───── Mini Calendar ───── */

function MiniCalendar({
  pickupDate,
  returnDate,
  onSelectDate,
}: {
  pickupDate: Date | null;
  returnDate: Date | null;
  onSelectDate: (d: Date) => void;
}) {
  const [viewMonth, setViewMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  const today = useMemo(() => {
    const t = new Date();
    t.setHours(0, 0, 0, 0);
    return t;
  }, []);

  const daysInMonth = new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 0).getDate();
  const firstDayOfWeek = (new Date(viewMonth.getFullYear(), viewMonth.getMonth(), 1).getDay() + 6) % 7; // Monday = 0

  const cells: (Date | null)[] = [];
  for (let i = 0; i < firstDayOfWeek; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push(new Date(viewMonth.getFullYear(), viewMonth.getMonth(), d));
  }

  function prevMonth() {
    setViewMonth((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1));
  }
  function nextMonth() {
    setViewMonth((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1));
  }

  return (
    <div className="glass rounded-2xl p-4">
      {/* Month nav */}
      <div className="flex items-center justify-between mb-3">
        <button type="button" onClick={prevMonth} className="rounded-lg p-2 hover:bg-white/10 transition">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" /></svg>
        </button>
        <span className="font-semibold">
          {MONTH_NAMES[viewMonth.getMonth()]} {viewMonth.getFullYear()}
        </span>
        <button type="button" onClick={nextMonth} className="rounded-lg p-2 hover:bg-white/10 transition">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" /></svg>
        </button>
      </div>

      {/* Day headers (Mon-Sun) */}
      <div className="grid grid-cols-7 text-center text-xs text-white/30 mb-1">
        {["Man", "Tir", "Ons", "Tor", "Fre", "Lør", "Søn"].map((d) => (
          <div key={d} className="py-1">{d}</div>
        ))}
      </div>

      {/* Days */}
      <div className="grid grid-cols-7 gap-0.5">
        {cells.map((date, i) => {
          if (!date) return <div key={`e${i}`} />;

          const isPast = date < today;
          const isPickup = pickupDate && isSameDay(date, pickupDate);
          const isReturn = returnDate && isSameDay(date, returnDate);
          const isInRange =
            pickupDate &&
            returnDate &&
            date > pickupDate &&
            date < returnDate;
          const isTooFar =
            pickupDate && !returnDate && diffDays(pickupDate, date) > 5;

          return (
            <button
              type="button"
              key={dateKey(date)}
              disabled={isPast || !!isTooFar}
              onClick={() => onSelectDate(date)}
              className={`
                h-10 rounded-lg text-sm font-medium transition
                ${isPast || isTooFar ? "text-white/15 cursor-not-allowed" : "hover:bg-white/10 cursor-pointer"}
                ${isPickup ? "bg-brand-500 text-black font-bold" : ""}
                ${isReturn ? "bg-brand-600 text-black font-bold" : ""}
                ${isInRange ? "bg-brand-500/20 text-brand-300" : ""}
              `}
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ───── Light Bar (simple, low-perf) ───── */

function LightBar() {
  return (
    <div className="pointer-events-none fixed top-0 left-0 right-0 z-10 h-1.5 overflow-hidden">
      <div className="h-full w-full animate-light-bar bg-gradient-to-r from-transparent via-brand-400/80 to-transparent" />
    </div>
  );
}

/* ───── Component ───── */

export default function BookingFlow() {
  const [step, setStep] = useState(1);
  const [speaker, setSpeaker] = useState<string | null>(null);
  const [pickupDate, setPickupDate] = useState<Date | null>(null);
  const [returnDate, setReturnDate] = useState<Date | null>(null);
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
  const [form, setForm] = useState({ name: "", email: "", phone: "", comment: "" });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const selectedSpeaker = speakers.find((s) => s.id === speaker);
  const hasLights = selectedAddons.includes("lys");

  const rentalDays = pickupDate && returnDate ? diffDays(pickupDate, returnDate) : 3;
  const multiplier = dayMultiplier[rentalDays] ?? 1;
  const speakerPrice = selectedSpeaker ? Math.round(selectedSpeaker.price * multiplier) : 0;
  const addonsPrice = addons
    .filter((a) => selectedAddons.includes(a.id))
    .reduce((sum, a) => sum + a.price, 0);
  const total = speakerPrice + addonsPrice;

  const periodLabel = pickupDate && returnDate
    ? `${formatDate(pickupDate)} → ${formatDate(returnDate)} (${rentalDays} ${rentalDays === 1 ? "dag" : "dage"})`
    : "Ikke valgt";

  function handleDateSelect(d: Date) {
    if (!pickupDate || (pickupDate && returnDate)) {
      setPickupDate(d);
      setReturnDate(null);
    } else {
      if (d <= pickupDate) {
        setPickupDate(d);
        setReturnDate(null);
      } else {
        const days = diffDays(pickupDate, d);
        if (days >= 1 && days <= 5) {
          setReturnDate(d);
        }
      }
    }
  }

  function toggleAddon(id: string) {
    setSelectedAddons((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );
  }

  function nextStep() {
    setStep((s) => Math.min(s + 1, 4));
  }

  function prevStep() {
    setStep((s) => Math.max(s - 1, 1));
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
          speaker: selectedSpeaker?.name,
          speakerSize: selectedSpeaker?.size,
          period: periodLabel,
          pickup: pickupDate?.toISOString(),
          returnDate: returnDate?.toISOString(),
          days: rentalDays,
          addons: addons
            .filter((a) => selectedAddons.includes(a.id))
            .map((a) => a.label),
          total,
          ...form,
        }),
      });

      if (!res.ok) throw new Error("Booking fejlede");
      setDone(true);
    } catch {
      setError("Noget gik galt. Prøv igen eller ring til os.");
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <section id="book" className="relative overflow-hidden">
        {/* Fixed mood bg */}
        {speakers.map((s) => (
          <div
            key={s.id}
            className="fixed inset-0 bg-cover bg-center transition-opacity duration-700"
            style={{
              backgroundImage: `url(${s.mood})`,
              opacity: speaker === s.id ? 0.5 : 0,
            }}
          />
        ))}
        <div className="fixed inset-0 bg-gradient-to-b from-[#07060b]/50 via-[#07060b]/60 to-[#07060b]/90" />
        <div className="relative z-20 mx-auto max-w-lg px-4 py-24 text-center">
          <div className="glass rounded-3xl p-10">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-500/20">
              <svg className="h-10 w-10 text-green-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold">Booking modtaget!</h2>
            <p className="mt-4 text-white/60">
              Vi har sendt en bekræftelse til <strong className="text-white">{form.email}</strong>.
              <br />
              Du hører fra os inden for kort tid med afhentningsadresse og detaljer.
            </p>
            <p className="mt-6 text-3xl font-bold text-brand-400">{total} kr</p>
            <p className="text-sm text-white/40">Betales ved afhentning</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="book" className="relative">
      {/* ── Fixed mood background ── */}
      {/* Default: hero image before any speaker is selected */}
      <div
        className="fixed inset-0 bg-cover bg-center transition-opacity duration-700"
        style={{
          backgroundImage: "url(/images/hero.png)",
          opacity: speaker === null ? 0.5 : 0,
        }}
      />
      {speakers.map((s) => (
        <div
          key={s.id}
          className="fixed inset-0 bg-cover bg-center transition-opacity duration-700 ease-in-out"
          style={{
            backgroundImage: `url(${s.mood})`,
            opacity: speaker === s.id ? 0.5 : 0,
          }}
        />
      ))}
      <div className="fixed inset-0 bg-gradient-to-b from-[#07060b]/50 via-[#07060b]/60 to-[#07060b]/90" />

      {/* ── Animated light effects ── */}
      {hasLights && <LightBar />}

      {/* ── Content ── */}
      <div className="relative z-20 mx-auto max-w-lg px-4 py-24">
        {/* Progress */}
        <div className="mb-8 flex items-center justify-center gap-2">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className={`h-2 rounded-full transition-all duration-300 ${
                s === step
                  ? "w-8 bg-brand-500"
                  : s < step
                    ? "w-8 bg-brand-700"
                    : "w-8 bg-white/10"
              }`}
            />
          ))}
        </div>

        {/* Step 1: Speaker */}
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-center text-2xl font-bold">Vælg højtaler</h2>
            <p className="text-center text-sm text-white/50">
              Inkl. alle kabler (iPhone, USB-C, AUX). Leveres i padded sportstaske.
            </p>
            <div className="mt-6 space-y-4">
              {speakers.map((s) => (
                <button
                  key={s.id}
                  onClick={() => {
                    setSpeaker(s.id);
                    nextStep();
                  }}
                  className={`group w-full overflow-hidden rounded-2xl text-left transition active:scale-[0.98] ${
                    speaker === s.id ? "glass-selected" : "glass hover:border-white/20"
                  }`}
                >
                  <div className="relative h-48 overflow-hidden bg-[#0d0c12]">
                    <img
                      src={s.product}
                      alt={s.name}
                      className="h-full w-full object-contain p-4 transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute bottom-4 right-4 text-right">
                      <p className="text-3xl font-bold text-brand-400">{s.price},-</p>
                      <p className="text-xs text-white/60">fra pr. weekend</p>
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="text-xl font-semibold">{s.name}</h3>
                    <p className="mt-1 text-sm text-white/50">
                      {s.size} &mdash; {s.capacity}
                    </p>
                    <p className="mt-2 text-sm text-white/40">{s.desc}</p>
                    <p className="mt-2 text-xs text-brand-400/70">
                      Inkl. iPhone-kabel med USB-C adapter, AUX og strømkabel
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Date picker */}
        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-center text-2xl font-bold">Vælg datoer</h2>
            <p className="text-center text-sm text-white/50">
              Vælg afhentning og returnering (maks 5 dage)
            </p>

            <MiniCalendar
              pickupDate={pickupDate}
              returnDate={returnDate}
              onSelectDate={handleDateSelect}
            />

            {/* Selection summary */}
            <div className="glass rounded-xl p-4 text-sm">
              <div className="flex justify-between">
                <span className="text-white/50">Afhentning</span>
                <span className={pickupDate ? "text-white font-medium" : "text-white/30"}>
                  {pickupDate ? formatDate(pickupDate) : "Vælg dato"}
                </span>
              </div>
              <div className="flex justify-between mt-2">
                <span className="text-white/50">Returnering</span>
                <span className={returnDate ? "text-white font-medium" : "text-white/30"}>
                  {returnDate ? formatDate(returnDate) : "Vælg dato"}
                </span>
              </div>
              {pickupDate && returnDate && (
                <div className="flex justify-between mt-3 pt-3 border-t border-white/10">
                  <span className="text-white/50">Pris ({rentalDays} {rentalDays === 1 ? "dag" : "dage"})</span>
                  <span className="text-brand-400 font-bold">{speakerPrice} kr</span>
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-2">
              <button onClick={prevStep} className="flex-1 rounded-xl border border-white/10 py-3 font-medium transition hover:bg-white/5">
                Tilbage
              </button>
              <button
                onClick={nextStep}
                disabled={!pickupDate || !returnDate}
                className="flex-1 rounded-xl bg-brand-500 py-3 font-semibold text-black transition hover:bg-brand-400 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Videre
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Addons */}
        {step === 3 && (
          <div className="space-y-4">
            <h2 className="text-center text-2xl font-bold">Tilvalg</h2>
            <p className="text-center text-sm text-white/50">Valgfrit — spring over hvis du vil</p>
            <div className="mt-6 space-y-3">
              {addons.map((a) => {
                const selected = selectedAddons.includes(a.id);
                return (
                  <button
                    key={a.id}
                    onClick={() => toggleAddon(a.id)}
                    className={`w-full rounded-2xl p-5 text-left transition active:scale-[0.98] ${
                      selected ? "glass-selected" : "glass hover:border-white/20"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div
                          className={`flex h-6 w-6 items-center justify-center rounded-md border transition ${
                            selected
                              ? "border-brand-500 bg-brand-500"
                              : "border-white/20 bg-white/5"
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
                      <p className="text-lg font-bold">+{a.price},-</p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Price summary */}
            <div className="glass rounded-2xl p-5">
              <div className="flex justify-between text-sm text-white/50">
                <span>{selectedSpeaker?.name}-højtaler ({rentalDays} {rentalDays === 1 ? "dag" : "dage"})</span>
                <span>{speakerPrice} kr</span>
              </div>
              {addons
                .filter((a) => selectedAddons.includes(a.id))
                .map((a) => (
                  <div key={a.id} className="flex justify-between text-sm text-white/50">
                    <span>{a.label}</span>
                    <span>{a.price} kr</span>
                  </div>
                ))}
              <div className="mt-3 flex justify-between border-t border-white/10 pt-3 text-lg font-bold">
                <span>Total</span>
                <span className="text-brand-400">{total} kr</span>
              </div>
              <p className="mt-1 text-right text-xs text-white/30">Betales ved afhentning</p>
            </div>

            <div className="flex gap-3 pt-2">
              <button onClick={prevStep} className="flex-1 rounded-xl border border-white/10 py-3 font-medium transition hover:bg-white/5">
                Tilbage
              </button>
              <button onClick={nextStep} className="flex-1 rounded-xl bg-brand-500 py-3 font-semibold text-black transition hover:bg-brand-400 active:scale-95">
                Videre
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Contact + Submit */}
        {step === 4 && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <h2 className="text-center text-2xl font-bold">Dine oplysninger</h2>
            <p className="text-center text-sm text-white/50">
              Vi sender en bekræftelse på e-mail
            </p>

            <div className="mt-6 space-y-3">
              <input
                required
                type="text"
                placeholder="Navn"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3.5 text-white placeholder:text-white/30 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
              <input
                required
                type="email"
                placeholder="Email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3.5 text-white placeholder:text-white/30 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
              <input
                required
                type="tel"
                placeholder="Telefon"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3.5 text-white placeholder:text-white/30 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
              <textarea
                rows={3}
                placeholder="Kommentar (valgfrit — f.eks. ønsket tidspunkt, leveringsadresse)"
                value={form.comment}
                onChange={(e) => setForm({ ...form, comment: e.target.value })}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3.5 text-white placeholder:text-white/30 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 resize-none"
              />
            </div>

            {/* Price summary */}
            <div className="glass rounded-2xl p-5">
              <div className="flex justify-between text-sm text-white/50">
                <span>{selectedSpeaker?.name}-højtaler ({rentalDays} {rentalDays === 1 ? "dag" : "dage"})</span>
                <span>{speakerPrice} kr</span>
              </div>
              <div className="flex justify-between text-sm text-white/50">
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
              <div className="mt-3 flex justify-between border-t border-white/10 pt-3 text-lg font-bold">
                <span>Total</span>
                <span className="text-brand-400">{total} kr</span>
              </div>
              <p className="mt-1 text-right text-xs text-white/30">Betales ved afhentning</p>
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
                Tilbage
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 rounded-xl bg-brand-500 py-3.5 font-semibold text-black transition hover:bg-brand-400 active:scale-95 disabled:opacity-50"
              >
                {submitting ? "Sender..." : "Send booking"}
              </button>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}
