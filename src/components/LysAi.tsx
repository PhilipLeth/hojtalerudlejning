"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { bookHref, bookSetupHref } from "@/lib/bookUrl";
import { LYS_AI_IDS, LYS_AI_ANBEFALING, type LysAiId } from "@/lib/lysAi";
import { nedskaler } from "@/lib/nedskaler";
import { useProducts } from "@/lib/useProducts";
import { localizedHref } from "@/lib/enPages";
import type { Locale } from "@/lib/i18n";
import Footer from "./Footer";
import styles from "./EventHome.module.css";

type Resultat = {
  demo?: boolean;
  productIds: LysAiId[];
  products: Array<{ id: string; name: string; desc: string; image: string | null; page?: string }>;
  image: string;
};

export default function LysAi({ locale = "da" }: { locale?: Locale }) {
  const en = locale === "en";
  const { rentalProducts, addons } = useProducts();
  const [valgte, setValgte] = useState<LysAiId[]>([...LYS_AI_ANBEFALING]);
  const [auto, setAuto] = useState(true);
  const [preview, setPreview] = useState<string | null>(null);
  const [fil, setFil] = useState<Blob | null>(null);
  const [resultat, setResultat] = useState<Resultat | null>(null);
  const [fejl, setFejl] = useState<string | null>(null);
  const [korer, setKorer] = useState(false);
  const input = useRef<HTMLInputElement>(null);

  function navn(id: string) {
    const r = rentalProducts.find((p) => p.id === id);
    if (r) return en ? r.name_en : r.name_da;
    const a = addons.find((p) => p.id === id);
    return a ? (en ? a.en.label : a.da.label) : id;
  }

  async function vaelg(f: File) {
    setFejl(null);
    setResultat(null);
    try {
      const blob = await nedskaler(f);
      setFil(blob);
      setPreview(URL.createObjectURL(blob));
    } catch (e) {
      setFejl(e instanceof Error ? e.message : en ? "Could not read the photo." : "Kunne ikke læse billedet.");
    }
  }

  async function koer() {
    if (!fil) return;
    setKorer(true);
    setFejl(null);
    try {
      const body = new FormData();
      body.set("scene", new File([fil], "scene.jpg", { type: "image/jpeg" }));
      body.set("auto", auto ? "1" : "0");
      if (!auto) body.set("productIds", JSON.stringify(valgte));
      const res = await fetch("/api/lys-visualiser", { method: "POST", body });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "AI-fejl");
      setResultat(data);
      console.log("[lys-ai] resultat", { demo: data.demo, ids: data.productIds });
    } catch (e) {
      setFejl(e instanceof Error ? e.message : "Noget gik galt");
    } finally {
      setKorer(false);
    }
  }

  function toggle(id: LysAiId) {
    setAuto(false);
    setValgte((nu) => (nu.includes(id) ? nu.filter((x) => x !== id) : [...nu, id].slice(0, 5)));
  }

  return (
    <>
      <main className={styles.page}>
        <section className={styles.soloHero}>
          <p className={styles.location}>{en ? "Lighting for your room" : "Lys til jeres lokale"}</p>
          <h1>{en ? "See the lights in your venue." : "Se lyset i jeres lokale."}</h1>
          <p className={styles.lead}>
            {en
              ? "Upload a photo. We place fairy lights, uplights and effects, and you add the setup to the basket."
              : "Upload et foto. Vi sætter lyskæder, uplights og effekter op, og I lægger setuppet i kurven."}
          </p>

          <input
            ref={input}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            onChange={(e) => e.target.files?.[0] && vaelg(e.target.files[0])}
          />
          <button type="button" className={styles.primary} onClick={() => input.current?.click()}>
            {en ? "Upload a photo of the room" : "Upload et foto af lokalet"}
          </button>
          {preview && <img src={preview} alt="" className="mt-6 max-h-80 rounded-lg object-contain" />}

          <fieldset className="mt-8 max-w-xl">
            <legend className="mb-3 font-semibold">{en ? "What should we place?" : "Hvad skal vi sætte op?"}</legend>
            <label className="mb-3 flex cursor-pointer items-center gap-2">
              <input type="checkbox" checked={auto} onChange={(e) => setAuto(e.target.checked)} />
              {en ? "Let AI choose a light setup" : "Lad AI vælge et lys-setup"}
            </label>
            {!auto && (
              <div className="grid gap-2">
                {LYS_AI_IDS.map((id) => (
                  <label key={id} className="flex cursor-pointer items-center gap-2 rounded-md border border-slate-200 p-2">
                    <input type="checkbox" checked={valgte.includes(id)} onChange={() => toggle(id)} />
                    {navn(id)}
                  </label>
                ))}
              </div>
            )}
          </fieldset>

          <button
            type="button"
            className={`${styles.primary} mt-6`}
            disabled={!fil || korer || (!auto && valgte.length === 0)}
            onClick={koer}
          >
            {korer ? (en ? "Placing the lights..." : "Sætter lyset op...") : en ? "Generate setup" : "Vis opsætning"}
          </button>
          {fejl && <p className="mt-4 text-red-700">{fejl}</p>}

          {resultat && (
            <div className="mt-10">
              {resultat.demo && (
                <p className="mb-3 text-sm text-slate-500">
                  {en
                    ? "Demo: the photo is unchanged until the AI key is connected. The recommended products are ready to book."
                    : "Demo: billedet er uændret indtil AI-nøglen er sat. De anbefalede produkter kan bookes."}
                </p>
              )}
              <img src={resultat.image} alt="" className="max-w-full rounded-lg" />
              <h2 className="mt-8">{en ? "Add to basket" : "Læg i kurven"}</h2>
              <p className="mt-4">
                <Link className={styles.primary} href={bookSetupHref(resultat.productIds, locale)}>
                  {en ? "Add the whole setup" : "Læg hele setuppet i kurven"}
                </Link>
              </p>
              <ul className="mt-4 grid gap-3">
                {resultat.products.map((p) => (
                  <li key={p.id} className="flex items-center justify-between gap-3 border-b border-slate-200 py-3">
                    <span>{p.name}</span>
                    <Link className={styles.textLink} href={bookHref(p.id, locale)}>
                      {en ? "Add" : "Tilføj"}
                    </Link>
                  </li>
                ))}
              </ul>
              <p className="mt-6">
                <Link href={localizedHref("/lyspakker", locale)}>{en ? "See ready-made light packages" : "Se færdige lyspakker"}</Link>
              </p>
            </div>
          )}
        </section>
      </main>
      <Footer locale={locale} />
    </>
  );
}
