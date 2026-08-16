"use client";

import { useState } from "react";
import { applyDiscount, isSummerSale } from "@/lib/products";
import { useProducts } from "@/lib/useProducts";
import { thumbSrcSet, THUMB_IMAGE_SIZES } from "@/lib/imageSrcSet";

interface EventType {
  id: string;
  label: string;
  emoji: string;
  recommended: string[];
  optional: string[];
}

const EVENT_TYPES: EventType[] = [
  { id: "firmapraesentation", label: "Firmapræsentation", emoji: "💼", recommended: ["projektor", "traadloes_mikrofon"], optional: ["skaerm_55", "headset", "festival"] },
  { id: "konference", label: "Konference / møde", emoji: "🎤", recommended: ["skaerm_55", "headset", "traadloes_mikrofon"], optional: ["projektor", "festival"] },
  { id: "bryllup", label: "Bryllup", emoji: "💍", recommended: ["traadloes_mikrofon", "festival", "lyskaeder"], optional: ["projektor", "discokugle"] },
  { id: "fest", label: "Fest / fødselsdag", emoji: "🎉", recommended: ["festival", "discokugle"], optional: ["lyskaeder", "traadloes_mikrofon"] },
  { id: "undervisning", label: "Undervisning / workshop", emoji: "📚", recommended: ["projektor", "headset"], optional: ["skaerm_55", "traadloes_mikrofon"] },
];

const PRODUCT_INFO: Record<string, { name: string; href: string }> = {
  discokugle: { name: "Discokugle", href: "/discokugle" },
  lyskaeder: { name: "Lyskæder", href: "/lyskaeder" },
  projektor: { name: "Projektor", href: "/projektor" },
  skaerm_55: { name: '55" Storskærm', href: "/skaerm" },
  traadloes_mikrofon: { name: "Trådløs mikrofon", href: "/traadloes-mikrofon" },
  headset: { name: "Trådløst headset", href: "/headset-mikrofon" },
  headset_pro: { name: "Trådløst headset PRO", href: "/?product=headset_pro#book" },
  haandholdt_mikrofon: { name: "Håndholdt mikrofon (kabel)", href: "/?product=haandholdt_mikrofon#book" },
  laerred_160: { name: "Lærred 160 cm", href: "/?product=laerred_160#book" },
  projektor_pro: { name: "Projektor Pro (5000 lumen)", href: "/?product=projektor_pro#book" },
  pakke_praesentation: { name: "Præsentationspakken", href: "/?product=pakke_praesentation#book" },
  pakke_konference: { name: "Konferencepakken", href: "/?product=pakke_konference#book" },
  pakke_tale_musik: { name: "Tale & musik-pakken", href: "/?product=pakke_tale_musik#book" },
};

const PACKAGES = [
  { id: "pakke_praesentation", badge: "Spar 90,-" },
  { id: "pakke_konference", badge: "Spar 140,-" },
  { id: "pakke_tale_musik", badge: "Spar 95,-" },
];

function ProductCard({ id, badge }: { id: string; badge?: string }) {
  const summer = isSummerSale();
  const { speakers, rentalProducts } = useProducts();
  const rental = rentalProducts.find((p) => p.id === id);
  const speaker = speakers.find((sp) => sp.id === id);

  const info = speaker
    ? { name: speaker.da.name, href: `/?product=${id}#book`, price: speaker.price, image: speaker.product, page: speaker.page }
    : rental && PRODUCT_INFO[id]
      ? { ...PRODUCT_INFO[id], name: rental.name_da, price: rental.price, image: rental.image, page: rental.page }
      : null;
  if (!info) return null;

  return (
    <article className="glass group relative flex flex-col overflow-hidden rounded-2xl p-4 text-center transition hover:border-white/20">
      {badge && (
        <span className="absolute top-3 left-3 z-10 rounded-full bg-brand-500 px-2.5 py-0.5 text-[11px] font-bold text-black">
          {badge}
        </span>
      )}
      <a href={info.page ?? info.href} className="block">
        <img loading="lazy" decoding="async" src={info.image} srcSet={thumbSrcSet(info.image)} sizes={THUMB_IMAGE_SIZES} alt="" className="mx-auto h-24 w-24 object-contain transition-transform duration-300 group-hover:scale-110" />
        <p className="mt-3 font-semibold text-white">{info.name}</p>
        <p className={`text-sm font-bold ${summer ? "text-amber-400" : "text-brand-400"}`}>
          {summer && <span className="mr-1 font-normal text-white/30 line-through">{info.price},-</span>}
          {summer ? applyDiscount(info.price) : info.price},-
        </p>
      </a>
      <div className="mt-3 flex justify-center gap-2">
        <a
          href={`/?product=${id}#book`}
          className="rounded-full bg-brand-500 px-4 py-1.5 text-xs font-semibold text-black transition hover:bg-brand-400 active:scale-95"
        >
          Book
        </a>
        {info.page && (
          <a
            href={info.page}
            className="rounded-full border border-white/15 px-4 py-1.5 text-xs font-semibold text-white/70 transition hover:border-brand-500/40 hover:text-brand-400"
          >
            Info
          </a>
        )}
      </div>
    </article>
  );
}

export default function AVBookingWizard() {
  const [eventType, setEventType] = useState<EventType | null>(null);
  const { rentalProducts, speakers } = useProducts();

  return (
    <section id="av-book" className="mx-auto max-w-4xl px-4 py-24">
      <h2 className="mb-4 text-center text-3xl font-bold sm:text-4xl">
        Hvilket event holder du?
      </h2>
      <p className="mx-auto mb-10 max-w-2xl text-center text-white/50">
        Vælg din event-type og se hvad vi anbefaler. Book direkte på produktsiderne — betal først ved afhentning.
      </p>

      {/* Event type selector */}
      <div className="mb-12 grid grid-cols-2 gap-3 sm:grid-cols-5">
        {EVENT_TYPES.map((et) => (
          <button
            key={et.id}
            onClick={() => setEventType(et)}
            className={`rounded-2xl p-4 text-center transition active:scale-[0.98] ${
              eventType?.id === et.id ? "glass-selected" : "glass hover:border-white/20"
            }`}
          >
            <span className="text-3xl">{et.emoji}</span>
            <p className="mt-2 text-sm font-medium text-white/80">{et.label}</p>
          </button>
        ))}
      </div>

      {eventType ? (
        <div className="space-y-8">
          <div>
            <h3 className="mb-4 text-xl font-bold text-white">
              Anbefalet til {eventType.label.toLowerCase()}
            </h3>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {eventType.recommended.map((id) => (
                <ProductCard key={id} id={id} badge="Anbefalet" />
              ))}
            </div>
          </div>
          {eventType.optional.length > 0 && (
            <div>
              <h3 className="mb-4 text-lg font-semibold text-white/70">Kan også være relevant</h3>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                {eventType.optional.map((id) => (
                  <ProductCard key={id} id={id} />
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-10">
          {/* Pakker der kombinerer produkterne */}
          <div>
            <h3 className="mb-4 text-xl font-bold text-white">Pakker — kombinér og spar</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {PACKAGES.map((pk) => (
                <ProductCard key={pk.id} id={pk.id} badge={pk.badge} />
              ))}
            </div>
          </div>

          {/* Enkeltprodukter */}
          <div>
            <h3 className="mb-4 text-lg font-semibold text-white/70">AV-udstyr enkeltvis</h3>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {Object.keys(PRODUCT_INFO)
                .filter((id) => !id.startsWith("pakke_"))
                .filter((id) => rentalProducts.find((r) => r.id === id)?.category === "av")
                .map((id) => (
                  <ProductCard key={id} id={id} />
                ))}
            </div>
          </div>

          {/* Højtalere til lyden */}
          <div>
            <h3 className="mb-4 text-lg font-semibold text-white/70">Højtalere til lyden</h3>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {speakers.map((sp) => (
                <ProductCard key={sp.id} id={sp.id} />
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
