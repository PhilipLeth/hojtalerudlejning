"use client";

import { useState, FormEvent } from "react";
import PhoneLink from "@/components/PhoneLink";

/**
 * Forespørgsel på et helt arrangement — modstykket til bookingflowet.
 *
 * "Jeg skal bruge en Soundboks på fredag" hører hjemme i /book: kunden ved
 * hvad han vil have, og prisen står fast. "Vi er 80 til reception på torsdag,
 * kan I sørge for lyd, mikrofoner og lys?" gør ikke — der er et arrangement
 * der skal forstås først, og svaret er et tilbud.
 *
 * Felterne er de fem ting vi ALTID skal spørge om, hvis svaret skal kunne
 * gives uden en mailkorrespondance frem og tilbage: hvornår, hvor mange, hvor,
 * hvad skal der ske, og hvad skal vi sørge for. Fritekst alene giver en mail
 * hvor tre af dem mangler.
 *
 * Sendes gennem /api/contact (samme vej som kontaktformularen) og lander
 * derfor i firmaets indbakke med kundens adresse som reply-to.
 */

export const ARRANGEMENTSTYPER = [
  "Reception",
  "Firmafest / julefrokost",
  "Konference / møde",
  "Bryllup",
  "Koncert / DJ",
  "Andet",
] as const;

export const BEHOV = [
  "Lyd og højtalere",
  "Mikrofoner til taler",
  "Lys",
  // Skærm og projektor stod her, indtil de blev sat på pause — se
  // PAUSEDE_PRODUKTER. Et afkrydsningsfelt er et løfte om at kunne levere.
  "Røg / low fog",
  "Levering + opsætning",
  "Tekniker på stedet",
] as const;

export interface Forespoergsel {
  dato: string;
  gaester: string;
  sted: string;
  type: string;
  behov: string[];
  firma: string;
  besked: string;
}

/** Emnelinjen i indbakken. Serveren skærer ved 40 tegn, så gæstetallet først. */
export function emnelinje(f: Pick<Forespoergsel, "gaester" | "type">): string {
  const dele = ["Forespørgsel"];
  if (f.gaester) dele.push(`${f.gaester} gæster`);
  if (f.type) dele.push(f.type);
  return dele.join(" · ").slice(0, 40);
}

/**
 * Bygger beskeden. Serveren viser den med white-space: pre-wrap, så en ren
 * tekstblok med én oplysning pr. linje er læsbar direkte i mailen.
 */
export function sammensaetBesked(f: Forespoergsel): string {
  const linjer = [
    `Dato: ${f.dato || "ikke oplyst"}`,
    `Antal gæster: ${f.gaester || "ikke oplyst"}`,
    `Sted: ${f.sted || "ikke oplyst"}`,
    `Type: ${f.type || "ikke oplyst"}`,
    `Skal vi sørge for: ${f.behov.length ? f.behov.join(", ") : "ikke valgt"}`,
  ];
  if (f.firma.trim()) linjer.push(`Firma / EAN: ${f.firma.trim()}`);
  if (f.besked.trim()) linjer.push("", f.besked.trim());
  return linjer.join("\n");
}

const inputCls =
  "w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/30 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500";
const labelCls = "mb-1 block text-xs font-medium text-white/50";

export default function EventInquiryForm() {
  const [f, setF] = useState<Forespoergsel>({
    dato: "",
    gaester: "",
    sted: "",
    type: "",
    behov: [],
    firma: "",
    besked: "",
  });
  const [kontakt, setKontakt] = useState({ navn: "", email: "", telefon: "", website: "" });
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState("");

  function toggleBehov(b: string) {
    setF((prev) => ({
      ...prev,
      behov: prev.behov.includes(b) ? prev.behov.filter((x) => x !== b) : [...prev.behov, b],
    }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setState("sending");
    setError("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: kontakt.navn,
          email: kontakt.email,
          phone: kontakt.telefon,
          website: kontakt.website,
          topic: emnelinje(f),
          message: sammensaetBesked(f),
        }),
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
      <div className="glass rounded-2xl p-8 text-center" data-testid="forespoergsel-sendt">
        <p className="text-2xl">✅</p>
        <h2 className="mt-2 text-xl font-bold">Tak — vi er i gang</h2>
        <p className="mt-2 text-white/60">
          Du får et tilbud med udstyr, levering og opsætning, som regel samme dag. Haster det, så ring{" "}
          <PhoneLink className="text-brand-400 hover:underline" />.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" aria-label="Forespørgsel på arrangement">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelCls} htmlFor="fq-dato">
            Hvornår? *
          </label>
          <input
            id="fq-dato"
            required
            type="date"
            value={f.dato}
            onChange={(e) => setF({ ...f, dato: e.target.value })}
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls} htmlFor="fq-gaester">
            Hvor mange gæster? *
          </label>
          <input
            id="fq-gaester"
            required
            type="number"
            min="1"
            inputMode="numeric"
            placeholder="80"
            value={f.gaester}
            onChange={(e) => setF({ ...f, gaester: e.target.value })}
            className={inputCls}
          />
        </div>
      </div>

      <div>
        <label className={labelCls} htmlFor="fq-sted">
          Hvor foregår det? *
        </label>
        <input
          id="fq-sted"
          required
          type="text"
          placeholder="Adresse eller stedets navn — og om det er inde eller ude"
          value={f.sted}
          onChange={(e) => setF({ ...f, sted: e.target.value })}
          className={inputCls}
        />
      </div>

      <div>
        <label className={labelCls} htmlFor="fq-type">
          Hvad er det for et arrangement? *
        </label>
        <select
          id="fq-type"
          required
          value={f.type}
          onChange={(e) => setF({ ...f, type: e.target.value })}
          className={inputCls}
        >
          <option value="">Vælg …</option>
          {ARRANGEMENTSTYPER.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>

      <fieldset>
        <legend className={labelCls}>Hvad skal vi sørge for?</legend>
        <div className="flex flex-wrap gap-2">
          {BEHOV.map((b) => {
            const valgt = f.behov.includes(b);
            return (
              <button
                key={b}
                type="button"
                aria-pressed={valgt}
                onClick={() => toggleBehov(b)}
                className={`rounded-full border px-4 py-2 text-sm transition ${
                  valgt
                    ? "border-brand-500 bg-brand-500/15 text-brand-400"
                    : "border-white/15 text-white/60 hover:border-white/35"
                }`}
              >
                {b}
              </button>
            );
          })}
        </div>
      </fieldset>

      <div>
        <label className={labelCls} htmlFor="fq-besked">
          Noget vi skal vide?
        </label>
        <textarea
          id="fq-besked"
          rows={3}
          placeholder="Fx: der skal holdes tre taler, og musikken skal kunne køre videre bagefter"
          value={f.besked}
          onChange={(e) => setF({ ...f, besked: e.target.value })}
          className={inputCls}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className={labelCls} htmlFor="fq-navn">
            Navn *
          </label>
          <input
            id="fq-navn"
            required
            type="text"
            value={kontakt.navn}
            onChange={(e) => setKontakt({ ...kontakt, navn: e.target.value })}
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls} htmlFor="fq-email">
            Email *
          </label>
          <input
            id="fq-email"
            required
            type="email"
            value={kontakt.email}
            onChange={(e) => setKontakt({ ...kontakt, email: e.target.value })}
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls} htmlFor="fq-telefon">
            Telefon
          </label>
          <input
            id="fq-telefon"
            type="tel"
            value={kontakt.telefon}
            onChange={(e) => setKontakt({ ...kontakt, telefon: e.target.value })}
            className={inputCls}
          />
        </div>
      </div>

      <div>
        <label className={labelCls} htmlFor="fq-firma">
          Firma og EAN-nummer (hvis I skal have faktura)
        </label>
        <input
          id="fq-firma"
          type="text"
          value={f.firma}
          onChange={(e) => setF({ ...f, firma: e.target.value })}
          className={inputCls}
        />
      </div>

      {/* Honeypot — skjult for mennesker, udfyldes af bots */}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        value={kontakt.website}
        onChange={(e) => setKontakt({ ...kontakt, website: e.target.value })}
        className="absolute left-[-9999px] h-0 w-0 opacity-0"
      />

      {error && <p className="text-sm text-red-400">{error}</p>}

      <button
        type="submit"
        disabled={state === "sending"}
        className="w-full rounded-full bg-brand-500 px-8 py-4 text-lg font-semibold text-black transition hover:bg-brand-400 active:scale-95 disabled:opacity-50"
      >
        {state === "sending" ? "Sender …" : "Send forespørgsel"}
      </button>
      <p className="text-center text-xs text-white/40">
        Du får et tilbud med udstyr, levering og opsætning — som regel samme dag.
      </p>
    </form>
  );
}
