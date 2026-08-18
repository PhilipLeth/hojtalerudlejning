"use client";

/**
 * Slutkunde-flowet: foto → produktvalg → generering → variant-galleri →
 * tilbudsforespørgsel. Kører som statisk skal; tenant findes runtime ud fra
 * URL'en (/t/<slug> eller ?t=). Alt UI-sprog er dansk.
 */

import { useEffect, useRef, useState } from "react";
import type { Product, TenantPublic, Variant } from "@shared/types";
import { generer, hentConfig, sendForespoergsel, uploadScene } from "@/lib/api";
import { nedskaler } from "@/lib/image";
import { resolveSlug } from "@/lib/tenant";

type Trin = "start" | "produkter" | "genererer" | "resultat" | "form" | "sendt";

const VENTEBESKEDER = [
  "Analyserer dit billede…",
  "Måler pladsen op…",
  "Stiller møblerne på plads…",
  "Justerer lys og skygger…",
  "Lægger sidste hånd på…",
];

export default function KundeApp() {
  const [slug, setSlug] = useState<string | null>(null);
  const [tenant, setTenant] = useState<TenantPublic | null>(null);
  const [produkter, setProdukter] = useState<Product[]>([]);
  const [trin, setTrin] = useState<Trin>("start");
  const [fejl, setFejl] = useState<string | null>(null);

  const [scenePreview, setScenePreview] = useState<string | null>(null);
  const [sceneId, setSceneId] = useState<string | null>(null);
  const [uploader, setUploader] = useState(false);

  const [valgte, setValgte] = useState<string[]>([]);
  const [varianter, setVarianter] = useState<Variant[]>([]);
  const [aktiv, setAktiv] = useState(0);
  const [ventetekst, setVentetekst] = useState(VENTEBESKEDER[0]);
  const [genererFlere, setGenererFlere] = useState(false);

  const [navn, setNavn] = useState("");
  const [email, setEmail] = useState("");
  const [telefon, setTelefon] = useState("");
  const [besked, setBesked] = useState("");
  const [sender, setSender] = useState(false);

  const filInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const s = resolveSlug();
    setSlug(s);
    hentConfig(s)
      .then(({ tenant, products }) => {
        setTenant(tenant);
        setProdukter(products);
      })
      .catch((e: Error) => setFejl(e.message));
  }, []);

  // Roterende ventebeskeder mens AI'en arbejder
  useEffect(() => {
    if (trin !== "genererer" && !genererFlere) return;
    let i = 0;
    const timer = setInterval(() => {
      i = (i + 1) % VENTEBESKEDER.length;
      setVentetekst(VENTEBESKEDER[i]);
    }, 4000);
    return () => clearInterval(timer);
  }, [trin, genererFlere]);

  async function vaelgFoto(fil: File) {
    if (!slug) return;
    setFejl(null);
    setUploader(true);
    try {
      const blob = await nedskaler(fil);
      setScenePreview(URL.createObjectURL(blob));
      const { sceneId } = await uploadScene(slug, blob);
      setSceneId(sceneId);
      setVarianter([]);
      setTrin("produkter");
    } catch (e) {
      setFejl(e instanceof Error ? e.message : "Kunne ikke uploade billedet");
    } finally {
      setUploader(false);
    }
  }

  function toggleProdukt(id: string) {
    if (!tenant) return;
    setValgte((nu) =>
      nu.includes(id) ? nu.filter((x) => x !== id) : nu.length < tenant.maxProductsPerScene ? [...nu, id] : nu,
    );
  }

  async function koerGenerering(hintIndex?: number) {
    if (!slug || !sceneId || valgte.length === 0) return;
    setFejl(null);
    const foersteGang = hintIndex === undefined;
    if (foersteGang) setTrin("genererer");
    else setGenererFlere(true);
    try {
      const { variants } = await generer(slug, sceneId, valgte, hintIndex);
      setVarianter((nu) => {
        const nye = foersteGang ? variants : [...nu, ...variants];
        setAktiv(nye.length - variants.length);
        return nye;
      });
      setTrin("resultat");
    } catch (e) {
      setFejl(e instanceof Error ? e.message : "Genereringen fejlede");
      setTrin(foersteGang ? "produkter" : "resultat");
    } finally {
      setGenererFlere(false);
    }
  }

  async function indsendForespoergsel(e: React.FormEvent) {
    e.preventDefault();
    if (!slug) return;
    setFejl(null);
    setSender(true);
    try {
      await sendForespoergsel(slug, {
        name: navn,
        email,
        phone: telefon,
        message: besked || undefined,
        productIds: valgte,
        imageId: varianter[aktiv]?.id,
        sceneId: sceneId ?? undefined,
      });
      setTrin("sendt");
    } catch (e) {
      setFejl(e instanceof Error ? e.message : "Kunne ikke sende forespørgslen");
    } finally {
      setSender(false);
    }
  }

  function forfra() {
    setScenePreview(null);
    setSceneId(null);
    setValgte([]);
    setVarianter([]);
    setAktiv(0);
    setTrin("start");
  }

  if (fejl && !tenant) {
    return (
      <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-6 text-center">
        <p className="text-lg font-semibold">Butikken kunne ikke indlæses</p>
        <p className="mt-2 text-sm text-blaek/60">{fejl}</p>
      </main>
    );
  }
  if (!tenant) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-skov border-t-transparent" />
      </main>
    );
  }

  const aktivVariant = varianter[aktiv];
  const erDemo = varianter.some((v) => v.demo);

  return (
    <main
      className="mx-auto flex min-h-screen max-w-md flex-col px-5 pb-10"
      style={{ ["--brand" as string]: tenant.brandColor } as React.CSSProperties}
    >
      <header className="flex items-center justify-between py-5">
        <div className="flex items-center gap-3">
          {tenant.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={tenant.logoUrl} alt="" className="h-9 w-9 rounded-full object-cover" />
          ) : (
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--brand)] font-bold text-white">
              {tenant.name.slice(0, 1)}
            </span>
          )}
          <span className="font-semibold">{tenant.name}</span>
        </div>
        {trin !== "start" && (
          <button onClick={forfra} className="text-sm text-blaek/50 underline">
            Nyt billede
          </button>
        )}
      </header>

      {fejl && tenant && (
        <div className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800">{fejl}</div>
      )}

      {/* ---------- TRIN: START ---------- */}
      {trin === "start" && (
        <section className="flex flex-1 flex-col justify-center text-center">
          <h1 className="text-3xl font-bold leading-snug">Se møblerne i dit eget billede</h1>
          <p className="mt-3 text-blaek/70">{tenant.welcomeText}</p>
          <input
            ref={filInput}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(e) => {
              const fil = e.target.files?.[0];
              if (fil) void vaelgFoto(fil);
              e.target.value = "";
            }}
          />
          <button
            disabled={uploader}
            onClick={() => filInput.current?.click()}
            className="mt-8 rounded-full bg-[var(--brand)] px-8 py-4 text-lg font-semibold text-white shadow-lg disabled:opacity-60"
          >
            {uploader ? "Behandler billedet…" : "📸 Tag et billede"}
          </button>
          <p className="mt-3 text-xs text-blaek/50">…eller vælg et fra din kamerarulle. Billedet bruges kun til din visualisering.</p>
        </section>
      )}

      {/* ---------- TRIN: PRODUKTER ---------- */}
      {trin === "produkter" && (
        <section>
          {scenePreview && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={scenePreview} alt="Dit billede" className="mb-4 max-h-48 w-full rounded-2xl object-cover" />
          )}
          <h2 className="text-xl font-bold">Hvilke møbler vil du se?</h2>
          <p className="mt-1 text-sm text-blaek/60">
            Vælg op til {tenant.maxProductsPerScene} — {valgte.length} valgt
          </p>
          <ul className="mt-4 grid grid-cols-2 gap-3">
            {produkter.map((p) => {
              const valgt = valgte.includes(p.id);
              return (
                <li key={p.id}>
                  <button
                    onClick={() => toggleProdukt(p.id)}
                    className={`w-full rounded-2xl border-2 bg-white p-3 text-left transition ${
                      valgt ? "border-[var(--brand)] shadow" : "border-transparent shadow-sm"
                    }`}
                  >
                    {p.images[0] && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.images[0]} alt={p.name} className="h-28 w-full rounded-xl bg-creme object-contain" />
                    )}
                    <p className="mt-2 text-sm font-semibold leading-tight">{p.name}</p>
                    {p.dimensions && <p className="text-xs text-blaek/50">{p.dimensions}</p>}
                    {p.priceText && <p className="mt-1 text-xs font-medium text-[var(--brand)]">{p.priceText}</p>}
                  </button>
                </li>
              );
            })}
          </ul>
          {produkter.length === 0 && (
            <p className="mt-6 text-sm text-blaek/60">Butikken har ikke lagt produkter op endnu.</p>
          )}
          <div className="sticky bottom-4 mt-6">
            <button
              disabled={valgte.length === 0}
              onClick={() => void koerGenerering()}
              className="w-full rounded-full bg-[var(--brand)] px-6 py-4 text-lg font-semibold text-white shadow-lg disabled:opacity-40"
            >
              Vis i mit billede{valgte.length > 0 ? ` (${valgte.length})` : ""}
            </button>
          </div>
        </section>
      )}

      {/* ---------- TRIN: GENERERER ---------- */}
      {trin === "genererer" && (
        <section className="flex flex-1 flex-col items-center justify-center text-center">
          {scenePreview && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={scenePreview} alt="" className="mb-6 max-h-56 w-full rounded-2xl object-cover opacity-60" />
          )}
          <div className="h-10 w-10 animate-spin rounded-full border-[3px] border-[var(--brand)] border-t-transparent" />
          <p className="mt-5 font-medium">{ventetekst}</p>
          <p className="mt-1 text-xs text-blaek/50">Tager typisk 15–40 sekunder</p>
        </section>
      )}

      {/* ---------- TRIN: RESULTAT ---------- */}
      {trin === "resultat" && aktivVariant && (
        <section>
          <div className={`relative ${aktivVariant.demo ? "demo-maerkat" : ""}`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={aktivVariant.url} alt="Dit billede med møblerne" className="w-full rounded-2xl shadow" />
          </div>

          {varianter.length > 1 && (
            <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
              {varianter.map((v, i) => (
                <button
                  key={v.id + i}
                  onClick={() => setAktiv(i)}
                  className={`shrink-0 overflow-hidden rounded-xl border-2 ${
                    i === aktiv ? "border-[var(--brand)]" : "border-transparent opacity-70"
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={v.url} alt={`Variant ${i + 1}`} className="h-16 w-24 object-cover" />
                </button>
              ))}
            </div>
          )}

          {erDemo && (
            <p className="mt-3 rounded-xl bg-amber-50 px-4 py-3 text-xs text-amber-900">
              Demo-visning: AI-nøglen er ikke sat op, så møblerne er ikke indsat endnu. Resten af flowet virker.
            </p>
          )}

          <div className="mt-5 grid gap-3">
            <button
              onClick={() => setTrin("form")}
              className="rounded-full bg-[var(--brand)] px-6 py-4 text-lg font-semibold text-white shadow-lg"
            >
              Få et tilbud på denne ✓
            </button>
            <div className="grid grid-cols-2 gap-3">
              <button
                disabled={genererFlere}
                onClick={() => void koerGenerering(((aktivVariant.hintIndex ?? 0) + 1) % 3)}
                className="rounded-full border border-[var(--brand)]/40 px-4 py-3 text-sm font-semibold text-[var(--brand)] disabled:opacity-50"
              >
                {genererFlere ? ventetekst : "↻ Ny variant"}
              </button>
              <button
                onClick={() => setTrin("produkter")}
                className="rounded-full border border-blaek/15 px-4 py-3 text-sm font-semibold text-blaek/70"
              >
                Andre møbler
              </button>
            </div>
          </div>
        </section>
      )}

      {/* ---------- TRIN: FORM ---------- */}
      {trin === "form" && (
        <section>
          <h2 className="text-xl font-bold">Få et tilbud</h2>
          <p className="mt-1 text-sm text-blaek/60">
            {tenant.name} vender tilbage med et tilbud på opstillingen i dit billede.
          </p>
          {aktivVariant && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={aktivVariant.url} alt="" className="mt-4 max-h-40 w-full rounded-2xl object-cover" />
          )}
          <form onSubmit={indsendForespoergsel} className="mt-4 grid gap-3">
            <input
              required
              value={navn}
              onChange={(e) => setNavn(e.target.value)}
              placeholder="Dit navn"
              className="rounded-xl border border-blaek/15 bg-white px-4 py-3"
            />
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Din e-mail"
              className="rounded-xl border border-blaek/15 bg-white px-4 py-3"
            />
            <input
              required
              type="tel"
              value={telefon}
              onChange={(e) => setTelefon(e.target.value)}
              placeholder="Dit telefonnummer"
              className="rounded-xl border border-blaek/15 bg-white px-4 py-3"
            />
            <textarea
              value={besked}
              onChange={(e) => setBesked(e.target.value)}
              placeholder="Evt. besked (mål, farver, ønsker…)"
              rows={3}
              className="rounded-xl border border-blaek/15 bg-white px-4 py-3"
            />
            <button
              disabled={sender}
              className="rounded-full bg-[var(--brand)] px-6 py-4 text-lg font-semibold text-white shadow-lg disabled:opacity-60"
            >
              {sender ? "Sender…" : "Send forespørgsel"}
            </button>
            <button type="button" onClick={() => setTrin("resultat")} className="text-sm text-blaek/50 underline">
              Tilbage til billedet
            </button>
          </form>
        </section>
      )}

      {/* ---------- TRIN: SENDT ---------- */}
      {trin === "sendt" && (
        <section className="flex flex-1 flex-col items-center justify-center text-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--brand)] text-3xl text-white">✓</span>
          <h2 className="mt-5 text-2xl font-bold">Tak for din forespørgsel!</h2>
          <p className="mt-2 text-blaek/70">
            {tenant.name} vender tilbage med et tilbud på møblerne i dit billede.
          </p>
          <button onClick={forfra} className="mt-8 rounded-full border border-[var(--brand)]/40 px-6 py-3 font-semibold text-[var(--brand)]">
            Prøv med et nyt billede
          </button>
        </section>
      )}

      <footer className="mt-auto pt-8 text-center text-[11px] text-blaek/40">
        Drevet af furniture-viz · Billedet bruges kun til din visualisering
      </footer>
    </main>
  );
}
