"use client";

/**
 * Tenant-admin: login → faner for forespørgsler, produkter og indstillinger.
 * Token gemmes i localStorage pr. butik. PLATFORM_SECRET virker som master.
 */

import { useEffect, useState } from "react";
import type { Product, QuoteRequest, TenantSettings } from "@shared/types";
import {
  adminGemIndstillinger,
  adminGemProdukter,
  adminHentForespoergsler,
  adminHentIndstillinger,
  adminHentProdukter,
  adminLogin,
  adminSaetStatus,
  adminUploadProduktbillede,
} from "@/lib/api";
import { nedskaler } from "@/lib/image";

type Fane = "forespoergsler" | "produkter" | "indstillinger";

function tokenNoegle(slug: string): string {
  return `fv_admin_${slug}`;
}

/** Produkt-id ud fra navnet: "Bænk Marais" → "baenk-marais-x7k2" */
function lavId(navn: string): string {
  const base = navn
    .toLowerCase()
    .replace(/æ/g, "ae")
    .replace(/ø/g, "oe")
    .replace(/å/g, "aa")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 30);
  const suffix = Math.random().toString(36).slice(2, 6);
  return `${base || "produkt"}-${suffix}`;
}

export default function AdminSide() {
  const [slug, setSlug] = useState("");
  const [kode, setKode] = useState("");
  const [token, setToken] = useState<string | null>(null);
  const [butiksnavn, setButiksnavn] = useState("");
  const [fane, setFane] = useState<Fane>("forespoergsler");
  const [fejl, setFejl] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [travl, setTravl] = useState(false);

  const [forespoergsler, setForespoergsler] = useState<QuoteRequest[]>([]);
  const [produkter, setProdukter] = useState<Product[]>([]);
  const [indstillinger, setIndstillinger] = useState<TenantSettings | null>(null);
  const [forbrug, setForbrug] = useState(0);
  const [aiAktiv, setAiAktiv] = useState(false);
  const [nyKode, setNyKode] = useState("");

  // Genoptag session: ?t=<slug> + gemt token
  useEffect(() => {
    const fraQuery = new URLSearchParams(window.location.search).get("t") ?? "";
    if (!/^[a-z0-9][a-z0-9-]{1,30}$/.test(fraQuery)) return;
    setSlug(fraQuery);
    const gemt = window.localStorage.getItem(tokenNoegle(fraQuery));
    if (gemt) {
      setToken(gemt);
      void hentAlt(fraQuery, gemt);
    }
  }, []);

  async function hentAlt(s: string, t: string) {
    setFejl(null);
    try {
      const [f, p, i] = await Promise.all([
        adminHentForespoergsler(s, t),
        adminHentProdukter(s, t),
        adminHentIndstillinger(s, t),
      ]);
      setForespoergsler(f.requests);
      setProdukter(p.products);
      setIndstillinger(i.settings);
      setForbrug(i.usedThisMonth);
      setAiAktiv(i.aiActive);
      setButiksnavn(i.settings.name);
    } catch (e) {
      // Udløbet session → tilbage til login
      setToken(null);
      window.localStorage.removeItem(tokenNoegle(s));
      setFejl(e instanceof Error ? e.message : "Kunne ikke hente data");
    }
  }

  async function logInd(e: React.FormEvent) {
    e.preventDefault();
    setFejl(null);
    setTravl(true);
    try {
      const s = slug.trim().toLowerCase();
      const { token: t, tenantName } = await adminLogin(s, kode);
      window.localStorage.setItem(tokenNoegle(s), t);
      setSlug(s);
      setToken(t);
      setButiksnavn(tenantName);
      setKode("");
      await hentAlt(s, t);
    } catch (e) {
      setFejl(e instanceof Error ? e.message : "Login fejlede");
    } finally {
      setTravl(false);
    }
  }

  function logUd() {
    if (slug) window.localStorage.removeItem(tokenNoegle(slug));
    setToken(null);
    setForespoergsler([]);
    setProdukter([]);
    setIndstillinger(null);
  }

  function visOk(besked: string) {
    setOk(besked);
    setFejl(null);
    setTimeout(() => setOk(null), 2500);
  }

  async function gemProdukter() {
    if (!token) return;
    setTravl(true);
    setFejl(null);
    try {
      await adminGemProdukter(slug, token, produkter);
      visOk("Produkterne er gemt");
    } catch (e) {
      setFejl(e instanceof Error ? e.message : "Kunne ikke gemme");
    } finally {
      setTravl(false);
    }
  }

  function retProdukt(idx: number, felt: keyof Product, vaerdi: unknown) {
    setProdukter((nu) => nu.map((p, i) => (i === idx ? { ...p, [felt]: vaerdi } : p)));
  }

  async function uploadBillede(idx: number, fil: File) {
    if (!token) return;
    setTravl(true);
    setFejl(null);
    try {
      const blob = await nedskaler(fil);
      const { url } = await adminUploadProduktbillede(slug, token, blob);
      retProdukt(idx, "images", [url]);
      visOk("Billedet er uploadet — husk at gemme");
    } catch (e) {
      setFejl(e instanceof Error ? e.message : "Upload fejlede");
    } finally {
      setTravl(false);
    }
  }

  async function gemIndstillinger(e: React.FormEvent) {
    e.preventDefault();
    if (!token || !indstillinger) return;
    setTravl(true);
    setFejl(null);
    try {
      const data: Record<string, unknown> = {
        name: indstillinger.name,
        brandColor: indstillinger.brandColor,
        welcomeText: indstillinger.welcomeText,
        notifyEmail: indstillinger.notifyEmail,
        variantsPerGeneration: indstillinger.variantsPerGeneration,
        maxProductsPerScene: indstillinger.maxProductsPerScene,
        monthlyGenerationLimit: indstillinger.monthlyGenerationLimit,
      };
      if (nyKode) data.newSecret = nyKode;
      const svar = await adminGemIndstillinger(slug, token, data);
      setIndstillinger(svar.settings);
      setButiksnavn(svar.settings.name);
      setNyKode("");
      visOk("Indstillingerne er gemt");
    } catch (e) {
      setFejl(e instanceof Error ? e.message : "Kunne ikke gemme");
    } finally {
      setTravl(false);
    }
  }

  async function skiftStatus(req: QuoteRequest) {
    if (!token) return;
    const ny = req.status === "ny" ? "besvaret" : "ny";
    try {
      await adminSaetStatus(slug, token, req.id, ny);
      setForespoergsler((nu) => nu.map((r) => (r.id === req.id ? { ...r, status: ny } : r)));
    } catch (e) {
      setFejl(e instanceof Error ? e.message : "Kunne ikke opdatere status");
    }
  }

  /* ---------- LOGIN ---------- */
  if (!token) {
    return (
      <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-6">
        <h1 className="text-2xl font-bold">Butiks-login</h1>
        <p className="mt-1 text-sm text-blaek/60">Log ind for at styre katalog og forespørgsler.</p>
        {fejl && <div className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800">{fejl}</div>}
        <form onSubmit={logInd} className="mt-5 grid gap-3">
          <input
            required
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="Butiks-id (slug), fx demo"
            className="rounded-xl border border-blaek/15 bg-white px-4 py-3"
            autoCapitalize="none"
          />
          <input
            required
            type="password"
            value={kode}
            onChange={(e) => setKode(e.target.value)}
            placeholder="Adgangskode"
            className="rounded-xl border border-blaek/15 bg-white px-4 py-3"
          />
          <button disabled={travl} className="rounded-full bg-skov px-6 py-3 font-semibold text-white disabled:opacity-60">
            {travl ? "Logger ind…" : "Log ind"}
          </button>
        </form>
      </main>
    );
  }

  /* ---------- ADMIN ---------- */
  return (
    <main className="mx-auto max-w-3xl px-5 pb-16">
      <header className="flex items-center justify-between py-5">
        <div>
          <h1 className="text-xl font-bold">{butiksnavn}</h1>
          <p className="text-xs text-blaek/50">
            Kundelink: <a href={`/t/${slug}`} className="underline">/t/{slug}</a> · AI:{" "}
            {aiAktiv ? "aktiv" : "demo-mode (nøgle mangler)"} · Forbrug denne måned: {forbrug}
          </p>
        </div>
        <button onClick={logUd} className="text-sm text-blaek/50 underline">Log ud</button>
      </header>

      <nav className="flex gap-2">
        {(
          [
            ["forespoergsler", `Forespørgsler (${forespoergsler.filter((r) => r.status === "ny").length} nye)`],
            ["produkter", `Produkter (${produkter.length})`],
            ["indstillinger", "Indstillinger"],
          ] as Array<[Fane, string]>
        ).map(([id, titel]) => (
          <button
            key={id}
            onClick={() => setFane(id)}
            className={`rounded-full px-4 py-2 text-sm font-semibold ${
              fane === id ? "bg-skov text-white" : "bg-white text-blaek/70 shadow-sm"
            }`}
          >
            {titel}
          </button>
        ))}
      </nav>

      {fejl && <div className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800">{fejl}</div>}
      {ok && <div className="mt-4 rounded-xl bg-green-50 px-4 py-3 text-sm text-green-800">{ok}</div>}

      {/* ---------- FORESPØRGSLER ---------- */}
      {fane === "forespoergsler" && (
        <section className="mt-5 grid gap-4">
          {forespoergsler.length === 0 && <p className="text-sm text-blaek/60">Ingen forespørgsler endnu.</p>}
          {forespoergsler.map((r) => (
            <article key={r.id} className="flex gap-4 rounded-2xl bg-white p-4 shadow-sm">
              {r.imageUrl && (
                <a href={r.imageUrl} target="_blank" rel="noreferrer" className="shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={r.imageUrl} alt="Kundens opstilling" className="h-24 w-32 rounded-xl object-cover" />
                </a>
              )}
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-semibold">{r.name}</p>
                  <button
                    onClick={() => void skiftStatus(r)}
                    className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
                      r.status === "ny" ? "bg-amber-100 text-amber-900" : "bg-green-100 text-green-800"
                    }`}
                  >
                    {r.status === "ny" ? "Ny — markér besvaret" : "Besvaret"}
                  </button>
                </div>
                <p className="mt-1 text-sm">
                  <a href={`mailto:${r.email}`} className="underline">{r.email}</a> ·{" "}
                  <a href={`tel:${r.phone}`} className="underline">{r.phone}</a>
                </p>
                <p className="mt-1 truncate text-sm text-blaek/70">{r.productNames.join(", ")}</p>
                {r.message && <p className="mt-1 text-sm italic text-blaek/60">“{r.message}”</p>}
                <p className="mt-1 text-xs text-blaek/40">{new Date(r.createdAt).toLocaleString("da-DK")}</p>
              </div>
            </article>
          ))}
        </section>
      )}

      {/* ---------- PRODUKTER ---------- */}
      {fane === "produkter" && (
        <section className="mt-5">
          <div className="grid gap-4">
            {produkter.map((p, idx) => (
              <article key={p.id} className="rounded-2xl bg-white p-4 shadow-sm">
                <div className="flex flex-wrap gap-4">
                  <div className="w-32">
                    {p.images[0] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.images[0]} alt="" className="h-24 w-32 rounded-xl bg-creme object-contain" />
                    ) : (
                      <div className="flex h-24 w-32 items-center justify-center rounded-xl bg-creme text-xs text-blaek/40">
                        Intet billede
                      </div>
                    )}
                    <label className="mt-2 block cursor-pointer text-center text-xs font-semibold text-skov underline">
                      Upload foto
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const fil = e.target.files?.[0];
                          if (fil) void uploadBillede(idx, fil);
                          e.target.value = "";
                        }}
                      />
                    </label>
                  </div>
                  <div className="grid min-w-0 flex-1 gap-2">
                    <input
                      value={p.name}
                      onChange={(e) => retProdukt(idx, "name", e.target.value)}
                      placeholder="Navn"
                      className="rounded-lg border border-blaek/15 px-3 py-2 font-semibold"
                    />
                    <textarea
                      value={p.description}
                      onChange={(e) => retProdukt(idx, "description", e.target.value)}
                      placeholder="Beskrivelse (materiale, stil, farve — bruges også af AI'en)"
                      rows={2}
                      className="rounded-lg border border-blaek/15 px-3 py-2 text-sm"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        value={p.dimensions ?? ""}
                        onChange={(e) => retProdukt(idx, "dimensions", e.target.value)}
                        placeholder="Mål, fx 120×80×75 cm"
                        className="rounded-lg border border-blaek/15 px-3 py-2 text-sm"
                      />
                      <input
                        value={p.priceText ?? ""}
                        onChange={(e) => retProdukt(idx, "priceText", e.target.value)}
                        placeholder="Pris, fx fra 4.500 kr."
                        className="rounded-lg border border-blaek/15 px-3 py-2 text-sm"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={p.active}
                          onChange={(e) => retProdukt(idx, "active", e.target.checked)}
                        />
                        Vises for kunder
                      </label>
                      <button
                        onClick={() => setProdukter((nu) => nu.filter((_, i) => i !== idx))}
                        className="text-xs text-red-600 underline"
                      >
                        Fjern
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
          <div className="sticky bottom-4 mt-5 flex gap-3">
            <button
              onClick={() =>
                setProdukter((nu) => [
                  ...nu,
                  { id: lavId("nyt produkt"), name: "", description: "", images: [], active: false },
                ])
              }
              className="rounded-full border border-skov/40 bg-white px-5 py-3 text-sm font-semibold text-skov"
            >
              + Tilføj produkt
            </button>
            <button
              disabled={travl}
              onClick={() => void gemProdukter()}
              className="flex-1 rounded-full bg-skov px-5 py-3 font-semibold text-white shadow disabled:opacity-60"
            >
              {travl ? "Gemmer…" : "Gem alle produkter"}
            </button>
          </div>
        </section>
      )}

      {/* ---------- INDSTILLINGER ---------- */}
      {fane === "indstillinger" && indstillinger && (
        <form onSubmit={gemIndstillinger} className="mt-5 grid max-w-lg gap-4">
          <label className="grid gap-1 text-sm font-medium">
            Butiksnavn
            <input
              value={indstillinger.name}
              onChange={(e) => setIndstillinger({ ...indstillinger, name: e.target.value })}
              className="rounded-lg border border-blaek/15 px-3 py-2 font-normal"
            />
          </label>
          <label className="grid gap-1 text-sm font-medium">
            Velkomsttekst til kunderne
            <textarea
              value={indstillinger.welcomeText}
              onChange={(e) => setIndstillinger({ ...indstillinger, welcomeText: e.target.value })}
              rows={2}
              className="rounded-lg border border-blaek/15 px-3 py-2 font-normal"
            />
          </label>
          <label className="grid gap-1 text-sm font-medium">
            Brandfarve
            <span className="flex items-center gap-2">
              <input
                type="color"
                value={indstillinger.brandColor}
                onChange={(e) => setIndstillinger({ ...indstillinger, brandColor: e.target.value })}
                className="h-10 w-14 cursor-pointer rounded border border-blaek/15"
              />
              <code className="text-xs text-blaek/60">{indstillinger.brandColor}</code>
            </span>
          </label>
          <label className="grid gap-1 text-sm font-medium">
            Forespørgsler sendes til (e-mail)
            <input
              type="email"
              value={indstillinger.notifyEmail}
              onChange={(e) => setIndstillinger({ ...indstillinger, notifyEmail: e.target.value })}
              placeholder="dig@dinbutik.dk"
              className="rounded-lg border border-blaek/15 px-3 py-2 font-normal"
            />
          </label>
          <div className="grid grid-cols-3 gap-3">
            <label className="grid gap-1 text-sm font-medium">
              Varianter pr. tryk
              <input
                type="number"
                min={1}
                max={3}
                value={indstillinger.variantsPerGeneration}
                onChange={(e) => setIndstillinger({ ...indstillinger, variantsPerGeneration: Number(e.target.value) })}
                className="rounded-lg border border-blaek/15 px-3 py-2 font-normal"
              />
            </label>
            <label className="grid gap-1 text-sm font-medium">
              Maks produkter
              <input
                type="number"
                min={1}
                max={8}
                value={indstillinger.maxProductsPerScene}
                onChange={(e) => setIndstillinger({ ...indstillinger, maxProductsPerScene: Number(e.target.value) })}
                className="rounded-lg border border-blaek/15 px-3 py-2 font-normal"
              />
            </label>
            <label className="grid gap-1 text-sm font-medium">
              Månedsgrænse
              <input
                type="number"
                min={0}
                value={indstillinger.monthlyGenerationLimit}
                onChange={(e) => setIndstillinger({ ...indstillinger, monthlyGenerationLimit: Number(e.target.value) })}
                className="rounded-lg border border-blaek/15 px-3 py-2 font-normal"
              />
            </label>
          </div>
          <label className="grid gap-1 text-sm font-medium">
            Ny adgangskode (mindst 8 tegn — lad stå tom for at beholde den nuværende)
            <input
              type="password"
              value={nyKode}
              onChange={(e) => setNyKode(e.target.value)}
              className="rounded-lg border border-blaek/15 px-3 py-2 font-normal"
            />
          </label>
          <button disabled={travl} className="rounded-full bg-skov px-6 py-3 font-semibold text-white disabled:opacity-60">
            {travl ? "Gemmer…" : "Gem indstillinger"}
          </button>
        </form>
      )}
    </main>
  );
}
