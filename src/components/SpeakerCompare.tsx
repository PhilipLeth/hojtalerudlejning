"use client";

import { Fragment, useMemo } from "react";
import { type Locale, t } from "@/lib/i18n";
import { applyDiscount, isSummerSale, type Speaker, type PowerType } from "@/lib/products";
import { useProducts } from "@/lib/useProducts";

function PowerIcon({ power }: { power: PowerType }) {
  if (power === "batteri") {
    return (
      <svg className="h-4 w-4 shrink-0 text-green-400" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 10.5h.375c.621 0 1.125.504 1.125 1.125v.75c0 .621-.504 1.125-1.125 1.125H21M3.75 18h15A2.25 2.25 0 0021 15.75v-7.5A2.25 2.25 0 0018.75 6h-15A2.25 2.25 0 001.5 8.25v7.5A2.25 2.25 0 003.75 18z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 9.75v4.5m3-4.5v4.5m3-4.5v4.5" />
      </svg>
    );
  }
  return (
    <svg className="h-4 w-4 shrink-0 text-brand-400" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
    </svg>
  );
}

export default function SpeakerCompare({
  locale = "da",
  bookLinks = "hash",
}: {
  locale?: Locale;
  /** hash = #book (forside), booking = /?product=ID#book (undersider) */
  bookLinks?: "hash" | "booking";
}) {
  const c = t[locale].compare;
  const summer = isSummerSale();
  const { speakers } = useProducts();

  const groups = useMemo(() => {
    const bySize = (a: Speaker, b: Speaker) => (a.sizeClass === b.sizeClass ? a.price - b.price : a.sizeClass === "lille" ? -1 : 1);
    return [
      { key: "batteri" as const, title: c.groupBattery, items: speakers.filter((s) => s.power === "batteri").sort(bySize) },
      { key: "kabel" as const, title: c.groupCable, items: speakers.filter((s) => s.power === "kabel").sort(bySize) },
    ].filter((g) => g.items.length > 0);
  }, [speakers, c]);

  return (
    <section id="anlaeg" className="relative z-20 mx-auto max-w-4xl px-4 py-24">
      <h2 className="mb-4 text-center text-3xl font-bold sm:text-4xl">{c.title}</h2>
      <p className="mx-auto mb-12 max-w-2xl text-center text-white/50">{c.subtitle}</p>

      <div className="glass rounded-2xl overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-white/10 text-xs uppercase tracking-wider text-white/40">
              <th className="px-5 py-4 font-medium">{c.colSystem}</th>
              <th className="px-3 py-4 font-medium">{c.colSize}</th>
              <th className="px-3 py-4 font-medium">{c.colCapacity}</th>
              <th className="px-3 py-4 font-medium">{c.colWeight}</th>
              <th className="px-3 py-4 font-medium">{c.colPower}</th>
              <th className="px-3 py-4 font-medium">{c.colPrice}</th>
              <th className="px-3 py-4" />
            </tr>
          </thead>
          <tbody>
            {groups.map((group) => (
              <Fragment key={group.key}>
                <tr className="bg-white/[0.03]">
                  <td colSpan={7} className="px-5 py-2.5 text-xs font-bold uppercase tracking-widest">
                    <span className={`flex items-center gap-2 ${group.key === "batteri" ? "text-green-400" : "text-brand-400"}`}>
                      <PowerIcon power={group.key} />
                      {group.title}
                    </span>
                  </td>
                </tr>
                {group.items.map((sp) => {
                  const text = sp[locale];
                  return (
                    <tr key={sp.id} className="border-b border-white/5 last:border-0 transition hover:bg-white/[0.02]">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <img src={sp.product} alt={text.name} className="h-16 w-16 shrink-0 rounded-lg bg-[#0d0c12] object-contain p-1" />
                          <div>
                            <p className="font-semibold text-white">{text.name}</p>
                            <p className="text-xs text-white/40">{text.size}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-4 text-white/70">{sp.sizeClass === "lille" ? c.sizeSmall : c.sizeLarge}</td>
                      <td className="px-3 py-4 text-white/70">{text.capacity}</td>
                      <td className="px-3 py-4 text-white/70">{sp.weight}</td>
                      <td className="px-3 py-4 text-white/70">
                        <span className="flex items-center gap-1.5">
                          <PowerIcon power={sp.power} />
                          {sp.power === "batteri" ? c.noPower : c.needsPower}
                        </span>
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap">
                        {summer && <span className="mr-1.5 text-xs text-white/30 line-through">{sp.price},-</span>}
                        <span className={`font-bold ${summer ? "text-amber-400" : "text-brand-400"}`}>
                          {summer ? applyDiscount(sp.price) : sp.price},-
                        </span>
                        <span className="block text-[11px] text-white/30">{c.perWeekend}</span>
                      </td>
                      <td className="px-3 py-4 text-right">
                        <a
                          href={bookLinks === "booking" ? `/?product=${sp.id}#book` : "#book"}
                          className="inline-block rounded-full bg-brand-500 px-4 py-2 text-xs font-semibold text-black transition hover:bg-brand-400 active:scale-95"
                        >
                          {c.book}
                        </a>
                      </td>
                    </tr>
                  );
                })}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {/* Store produktkort under tabellen */}
      <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2">
        {groups.flatMap((g) => g.items).map((sp) => {
          const text = sp[locale];
          const href = bookLinks === "booking" ? `/?product=${sp.id}#book` : "#book";
          return (
            <article
              key={`card-${sp.id}`}
              className="group flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] transition hover:border-brand-500/40"
            >
              <a href={href} className="relative block bg-[#0d0c12] p-6">
                {sp.power === "batteri" && (
                  <span className="absolute left-4 top-4 rounded-full bg-green-500/15 px-2.5 py-0.5 text-[11px] font-bold text-green-400">
                    🔋 {c.noPower}
                  </span>
                )}
                <img
                  src={sp.product}
                  alt={text.name}
                  className="mx-auto h-44 w-full object-contain transition-transform duration-300 group-hover:scale-105"
                />
              </a>
              <div className="flex flex-1 flex-col p-5">
                <h3 className="text-xl font-semibold text-white">{text.name}</h3>
                <p className="mt-1 text-sm text-white/50">
                  {text.size} &mdash; {text.capacity}
                </p>
                <p className="mt-2 text-sm text-white/40">{text.desc}</p>
                <div className="mt-4 flex items-center justify-between">
                  <p className="text-2xl font-bold text-brand-400">
                    {sp.price},-<span className="ml-1 text-xs font-normal text-white/40">{c.perWeekend}</span>
                  </p>
                  <a
                    href={href}
                    className="rounded-full bg-brand-500 px-6 py-2.5 text-sm font-semibold text-black transition hover:bg-brand-400 active:scale-95"
                  >
                    {c.book}
                  </a>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
