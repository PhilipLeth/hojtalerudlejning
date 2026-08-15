"use client";

import { useState, useEffect, FormEvent } from "react";
import PhoneLink from "@/components/PhoneLink";

/** Kendte emner fra ?emne= — styrer overskrift på mailen og hjælpetekst i formularen */
const TOPICS: Record<string, { label: string; hint: string }> = {
  erhverv: {
    label: "Erhvervsforespørgsel",
    hint: "Fortæl om arrangementet — dato, antal gæster, lokation og hvad I skal bruge. Så vender vi tilbage med et samlet tilbud.",
  },
  event: {
    label: "Eventforespørgsel",
    hint: "Fortæl om eventet — dato, antal gæster, lokation og hvad I skal bruge.",
  },
};

export default function ContactForm() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "", website: "" });
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState("");
  const [topic, setTopic] = useState<{ key: string; label: string; hint: string } | null>(null);

  // Emne kommer fra URL'en (fx /kontakt?emne=erhverv) — så et pro-request
  // lander mærket i indbakken frem for som "endnu en kontaktformular"
  useEffect(() => {
    const key = new URLSearchParams(window.location.search).get("emne");
    if (key && TOPICS[key]) setTopic({ key, ...TOPICS[key] });
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setState("sending");
    setError("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, topic: topic?.label ?? "" }),
      });
      const json = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok) {
        setError(json.error || "Noget gik galt — prøv igen");
        setState("error");
        return;
      }
      setState("sent");
    } catch {
      setError("Netværksfejl — prøv igen eller ring til os");
      setState("error");
    }
  }

  if (state === "sent") {
    return (
      <div className="glass rounded-2xl p-8 text-center" data-testid="contact-success">
        <p className="text-2xl">✅</p>
        <h2 className="mt-2 text-xl font-bold">Tak for din besked!</h2>
        <p className="mt-2 text-white/60">
          Vi svarer hurtigst muligt — som regel samme dag. Haster det, så ring{" "}
          <PhoneLink className="text-brand-400 hover:underline" />.
        </p>
      </div>
    );
  }

  const inputCls =
    "w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3.5 text-white placeholder:text-white/30 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500";

  return (
    <form onSubmit={handleSubmit} className="space-y-3" aria-label="Kontaktformular">
      {topic && (
        <div className="rounded-xl border border-brand-500/30 bg-brand-500/[0.07] px-4 py-3">
          <p className="text-sm font-semibold text-brand-400">{topic.label}</p>
          <p className="mt-1 text-sm text-white/50">{topic.hint}</p>
        </div>
      )}
      <input
        required
        type="text"
        name="name"
        autoComplete="name"
        placeholder="Navn"
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
        className={inputCls}
      />
      <input
        required
        type="email"
        name="email"
        autoComplete="email"
        inputMode="email"
        placeholder="Email"
        value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
        className={inputCls}
      />
      <input
        type="tel"
        name="tel"
        autoComplete="tel"
        inputMode="tel"
        placeholder="Telefon (valgfrit)"
        value={form.phone}
        onChange={(e) => setForm({ ...form, phone: e.target.value })}
        className={inputCls}
      />
      {/* Honeypot — skjult for mennesker, bots udfylder den */}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        value={form.website}
        onChange={(e) => setForm({ ...form, website: e.target.value })}
        className="hidden"
      />
      <textarea
        required
        name="message"
        rows={5}
        placeholder="Din besked — fx hvad du skal bruge, hvornår og til hvor mange"
        value={form.message}
        onChange={(e) => setForm({ ...form, message: e.target.value })}
        className={inputCls}
      />
      {error && (
        <p className="rounded-xl bg-red-500/10 p-3 text-center text-sm text-red-400" role="alert">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={state === "sending"}
        className="w-full rounded-xl bg-brand-500 py-3.5 font-bold text-black transition hover:bg-brand-400 disabled:opacity-60"
      >
        {state === "sending" ? "Sender…" : "Send besked"}
      </button>
    </form>
  );
}
