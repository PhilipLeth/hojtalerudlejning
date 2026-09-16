"use client";

import Link from "next/link";
import { mixerModels, MIXER_INPUTS } from "@/lib/mixerModels";
import { useProducts } from "@/lib/useProducts";
import { bookHref } from "@/lib/bookUrl";
import { localizedHref } from "@/lib/enPages";
import type { Locale } from "@/lib/i18n";

/** De ubekræftede modeller kan forespørges, men har ingen bookingknap. */
export default function MixerRange({ locale }: { locale: Locale }) {
  const { addons } = useProducts();
  const en = locale === "en";
  return <section id="mixere" className="mx-auto max-w-6xl px-4 py-16">
    <h2 className="mb-3 text-center text-3xl font-bold">{en ? "4, 6 or 8 microphone inputs?" : "4, 6 eller 8 mikrofonindgange?"}</h2>
    <p className="mx-auto mb-10 max-w-2xl text-center text-white/60">{en
      ? "Choose by the number of microphones you need at the same time. Stereo inputs are separate. All three mixers need mains power. Prices cover 1–5 days."
      : "Vælg efter antallet af mikrofoner, der skal bruges samtidig. Stereoindgange kommer ved siden af. Alle tre mixere kræver strøm. Priserne gælder 1–5 dage."}</p>
    <div className="grid gap-6 md:grid-cols-3">
      {mixerModels.map((model) => {
        const bookable = addons.find((a) => a.id === model.id);
        const p = bookable ?? model;
        return <article key={p.id} className="flex flex-col overflow-hidden rounded-2xl border border-white/15 bg-white/[0.03]">
          <img src={p.image ?? model.image!} alt={p[locale].label} loading="lazy" decoding="async" className="h-56 w-full bg-white object-contain p-5" />
          <div className="flex flex-1 flex-col gap-4 p-6">
            <p className="text-sm font-semibold text-brand-400">{MIXER_INPUTS[p.id]} {en ? "microphone inputs" : "mikrofonindgange"}</p>
            <h3 className="text-xl font-bold">{p[locale].label}</h3>
            <p className="text-sm text-white/65">{p[locale].desc}</p>
            <p className="mt-auto text-2xl font-bold">{p.price} {en ? "DKK" : "kr."}</p>
            <Link href={bookable ? bookHref(p.id, locale) : localizedHref("/kontakt", locale)} className="rounded-full bg-brand-500 px-5 py-3 text-center font-semibold text-black">
              {bookable ? (en ? "Book mixer" : "Book mixer") : (en ? "Ask about this mixer" : "Forespørg på mixer")}
            </Link>
            {!bookable && <p className="text-xs text-white/55">{en ? "Indicative price. Availability confirmed before booking." : "Vejledende pris. Tilgængelighed aftales før booking."}</p>}
          </div>
        </article>;
      })}
    </div>
  </section>;
}
