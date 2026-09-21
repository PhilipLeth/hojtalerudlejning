"use client";

import Link from "next/link";
import { useProducts } from "@/lib/useProducts";
import { localizedHref } from "@/lib/enPages";
import { DELIVERY_ADDON_IDS, type ProductCategory } from "@/lib/products";
import { DJ_DAY_RATE, DJ_NIGHT_RATE } from "@/lib/dj";
import type { Locale } from "@/lib/i18n";

/**
 * Hele prislisten på én side, bygget af kataloget.
 *
 * "Hvad koster det at leje en soundboks" er en af kontoens søgninger, og
 * svaret stod kun på den enkelte produktside — en kunde, der ville se det
 * hele, skulle klikke sig gennem 38 sider. Tallene her kommer fra
 * useProducts, så de følger det admin har rettet i KV; ingen pris skrives
 * i hånden, og siden kan derfor ikke drive fra bookingen.
 */

interface Row {
  id: string;
  name: string;
  desc?: string;
  price: number;
  unit?: string;
  href?: string;
}

interface Group {
  title: string;
  note?: string;
  rows: Row[];
}

const CATEGORY_TITLES: Record<ProductCategory, { da: string; en: string }> = {
  lyd: { da: "Lydpakker og lydudstyr", en: "Sound packages and audio gear" },
  lys: { da: "Lys og effekter", en: "Lighting and effects" },
  roeg: { da: "Røg", en: "Smoke" },
  av: { da: "Billede, skærm og AV", en: "Screens, projectors and AV" },
};

const CATEGORY_ORDER: ProductCategory[] = ["lyd", "lys", "roeg", "av"];

export default function PriceTable({ locale = "da" }: { locale?: Locale }) {
  const { speakers, addons, rentalProducts } = useProducts();
  const da = locale === "da";
  const kr = da ? "kr." : "DKK";

  const groups: Group[] = [];

  const højtalere = speakers
    .filter((s) => s.page)
    .map<Row>((s) => ({
      id: s.id,
      name: s[locale].name,
      desc: s[locale].capacity,
      price: s.price,
      href: s.page ? localizedHref(s.page, locale) : undefined,
    }));
  if (højtalere.length) {
    groups.push({
      title: da ? "Højtalere" : "Speakers",
      note: da
        ? "Gæstetallet gælder indendørs. Udendørs bærer lyden kortere."
        : "Guest numbers are for indoor use. Sound carries less far outdoors.",
      rows: højtalere,
    });
  }

  for (const category of CATEGORY_ORDER) {
    const rows = rentalProducts
      .filter((r) => r.category === category && r.page)
      .map<Row>((r) => ({
        id: r.id,
        name: locale === "en" ? r.name_en : r.name_da,
        desc: locale === "en" ? r.desc_en : r.desc_da,
        price: r.price,
        href: r.page ? localizedHref(r.page, locale) : undefined,
      }));
    if (rows.length) groups.push({ title: CATEGORY_TITLES[category][locale], rows });
  }

  const delivery = new Set<string>(DELIVERY_ADDON_IDS);
  const tilbehør = addons
    .filter((a) => !a.intern && !a.ydelse && !delivery.has(a.id) && a.page)
    .map<Row>((a) => ({
      id: a.id,
      name: a[locale].label,
      desc: a[locale].desc,
      price: a.price,
      unit: a.priceUnit?.[locale],
      href: a.page ? localizedHref(a.page, locale) : undefined,
    }));
  if (tilbehør.length) {
    groups.push({ title: da ? "Mikrofoner og tilbehør" : "Microphones and accessories", rows: tilbehør });
  }

  const ydelser = addons
    .filter((a) => a.ydelse && !a.intern)
    .map<Row>((a) => ({
      id: a.id,
      name: a[locale].label,
      desc: a[locale].desc,
      price: a.price,
      unit: a.priceUnit?.[locale],
      href: a.page ? localizedHref(a.page, locale) : undefined,
    }));
  ydelser.push(
    {
      id: "dj_dag",
      name: da ? "DJ / musikafvikler, før kl. 23" : "DJ / music host, before 23:00",
      desc: da ? "Mindst 3 timer. DJ-pult eller udstyrspakke lejes ved siden af." : "Minimum 3 hours. DJ gear is rented separately.",
      price: DJ_DAY_RATE,
      unit: da ? "kr/time" : "DKK/hour",
      href: localizedHref("/dj", locale),
    },
    {
      id: "dj_nat",
      name: da ? "DJ / musikafvikler, efter kl. 23" : "DJ / music host, after 23:00",
      price: DJ_NIGHT_RATE,
      unit: da ? "kr/time" : "DKK/hour",
      href: localizedHref("/dj", locale),
    },
  );
  groups.push({
    title: da ? "Bemanding" : "Staff",
    note: da ? "Timepriser, ikke weekendpriser." : "Hourly rates, not weekend prices.",
    rows: efterPris(ydelser),
  });

  const kørsel = addons
    .filter((a) => delivery.has(a.id))
    .map<Row>((a) => ({ id: a.id, name: a[locale].label, desc: a[locale].desc, price: a.price }));
  if (kørsel.length) {
    groups.push({
      title: da ? "Levering og afhentning" : "Delivery and collection",
      note: da ? "Vælges i bookingen. Du kan også hente selv, det er gratis." : "Chosen during booking. Collecting it yourself is free.",
      rows: kørsel,
    });
  }

  return (
    <div className="space-y-12">
      {groups.map((g) => (
        <section key={g.title}>
          <h2 className="text-2xl font-bold">{g.title}</h2>
          {g.note && <p className="mt-1 text-sm text-slate-500">{g.note}</p>}
          <table className="mt-5 w-full border-collapse text-left">
            <tbody>
              {efterPris(g.rows).map((row) => (
                <tr key={row.id} className="border-b border-slate-200 align-top">
                  <th scope="row" className="py-3 pr-4 font-semibold">
                    {row.href ? (
                      <Link href={row.href} className="text-brand-600 hover:underline">
                        {row.name}
                      </Link>
                    ) : (
                      row.name
                    )}
                    {row.desc && <span className="block text-sm font-normal text-slate-500">{row.desc}</span>}
                  </th>
                  <td className="whitespace-nowrap py-3 text-right font-semibold tabular-nums">
                    {row.price.toLocaleString(da ? "da-DK" : "en-US")} {row.unit ?? kr}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      ))}
    </div>
  );
}

/** Billigst først — kunden leder efter bunden af prislisten, ikke toppen. */
function efterPris(rows: Row[]): Row[] {
  return [...rows].sort((a, b) => a.price - b.price);
}
