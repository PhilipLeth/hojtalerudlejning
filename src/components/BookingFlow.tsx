"use client";

import { useState, FormEvent } from "react";

/* ───── Data ───── */

const speakers = [
  {
    id: "party",
    name: "Party",
    size: '10"',
    capacity: "Op til 40 pers.",
    price: 400,
    desc: "Perfekt til fødselsdage, havefester og mindre events.",
    image: "/images/speaker-party.png",
  },
  {
    id: "festival",
    name: "Festival",
    size: '12"',
    capacity: "40–100 pers.",
    price: 700,
    desc: "Kraftig lyd til store fester, events og udendørs arrangementer.",
    image: "/images/speaker-festival.png",
  },
];

const periods = [
  { id: "weekend", label: "Weekend", sub: "Fre → Man", multiplier: 1 },
  { id: "day", label: "1 døgn", sub: "24 timer", multiplier: 0.8 },
  { id: "week", label: "1 uge", sub: "7 dage", multiplier: 1.5 },
];

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

/* ───── Light Overlay ───── */

function LightOverlay() {
  return (
    <div className="pointer-events-none absolute inset-0 z-10 overflow-hidden">
      {/* Sweeping light beams */}
      <div className="absolute top-0 left-1/4 h-full w-32 bg-gradient-to-b from-purple-500/30 via-transparent to-transparent blur-3xl animate-beam-1" />
      <div className="absolute top-0 right-1/4 h-full w-24 bg-gradient-to-b from-pink-500/25 via-transparent to-transparent blur-3xl animate-beam-2" />
      <div className="absolute top-0 left-1/2 h-full w-20 bg-gradient-to-b from-blue-500/20 via-transparent to-transparent blur-3xl animate-beam-3" />
      {/* Pulsing glow at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-purple-600/20 to-transparent animate-pulse-slow" />
      {/* Color-shifting ambient */}
      <div className="absolute inset-0 animate-color-shift opacity-15 bg-gradient-to-br from-purple-600 via-pink-500 to-blue-600" />
    </div>
  );
}

/* ───── Component ───── */

export default function BookingFlow() {
  const [step, setStep] = useState(1);
  const [speaker, setSpeaker] = useState<string | null>(null);
  const [period, setPeriod] = useState("weekend");
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
  const [form, setForm] = useState({ name: "", email: "", phone: "", date: "", comment: "" });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const selectedSpeaker = speakers.find((s) => s.id === speaker);
  const selectedPeriod = periods.find((p) => p.id === period)!;
  const hasLights = selectedAddons.includes("lys");

  const speakerPrice = selectedSpeaker
    ? Math.round(selectedSpeaker.price * selectedPeriod.multiplier)
    : 0;
  const addonsPrice = addons
    .filter((a) => selectedAddons.includes(a.id))
    .reduce((sum, a) => sum + a.price, 0);
  const total = speakerPrice + addonsPrice;

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
          period: selectedPeriod.label,
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
      <section id="book" className="mx-auto max-w-lg px-4 py-24 text-center">
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
      </section>
    );
  }

  return (
    <section id="book" className="relative overflow-hidden">
      {/* ── Dynamic background images ── */}
      {speakers.map((s) => (
        <div
          key={s.id}
          className="absolute inset-0 bg-cover bg-center transition-opacity duration-700 ease-in-out"
          style={{
            backgroundImage: `url(${s.image})`,
            opacity: speaker === s.id ? 0.3 : 0,
          }}
        />
      ))}
      {/* Gradient overlay for readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#07060b] via-[#07060b]/80 to-[#07060b]" />

      {/* ── Animated light effects (when lys-pakke selected) ── */}
      {hasLights && <LightOverlay />}

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
              Begge leveres i en padded sportstaske
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
                  {/* Product image */}
                  <div className="relative h-44 overflow-hidden">
                    <img
                      src={s.image}
                      alt={s.name}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    <div className="absolute bottom-4 right-4 text-right">
                      <p className="text-3xl font-bold text-brand-400">{s.price},-</p>
                      <p className="text-xs text-white/60">pr. weekend</p>
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="text-xl font-semibold">{s.name}</h3>
                    <p className="mt-1 text-sm text-white/50">
                      {s.size} — {s.capacity}
                    </p>
                    <p className="mt-2 text-sm text-white/40">{s.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Period */}
        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-center text-2xl font-bold">Vælg periode</h2>
            <p className="text-center text-sm text-white/50">
              Standard er fredag &rarr; mandag
            </p>
            <div className="mt-6 space-y-3">
              {periods.map((p) => {
                const price = selectedSpeaker
                  ? Math.round(selectedSpeaker.price * p.multiplier)
                  : 0;
                const saving =
                  p.multiplier < 1
                    ? `-${Math.round((1 - p.multiplier) * 100)}%`
                    : p.multiplier > 1
                      ? `+${Math.round((p.multiplier - 1) * 100)}%`
                      : null;
                return (
                  <button
                    key={p.id}
                    onClick={() => setPeriod(p.id)}
                    className={`w-full rounded-2xl p-5 text-left transition active:scale-[0.98] ${
                      period === p.id ? "glass-selected" : "glass hover:border-white/20"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">{p.label}</h3>
                        <p className="text-sm text-white/40">{p.sub}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold">{price} kr</p>
                        {saving && (
                          <p
                            className={`text-xs font-medium ${
                              p.multiplier < 1 ? "text-green-400" : "text-orange-400"
                            }`}
                          >
                            {saving}
                          </p>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
            <div className="flex gap-3 pt-4">
              <button onClick={prevStep} className="flex-1 rounded-xl border border-white/10 py-3 font-medium transition hover:bg-white/5">
                Tilbage
              </button>
              <button onClick={nextStep} className="flex-1 rounded-xl bg-brand-600 py-3 font-semibold transition hover:bg-brand-500 active:scale-95">
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
                              ? "border-brand-500 bg-brand-600"
                              : "border-white/20 bg-white/5"
                          }`}
                        >
                          {selected && (
                            <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
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
                <span>{selectedSpeaker?.name}-højtaler ({selectedPeriod.label})</span>
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
              <button onClick={nextStep} className="flex-1 rounded-xl bg-brand-600 py-3 font-semibold transition hover:bg-brand-500 active:scale-95">
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
              <input
                required
                type="text"
                placeholder="Ønsket dato (f.eks. fredag 23. maj)"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
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
                <span>{selectedSpeaker?.name}-højtaler ({selectedPeriod.label})</span>
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
                className="flex-1 rounded-xl bg-brand-600 py-3.5 font-semibold transition hover:bg-brand-500 active:scale-95 disabled:opacity-50"
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
