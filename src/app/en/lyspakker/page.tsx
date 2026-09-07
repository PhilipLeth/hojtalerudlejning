import { Metadata } from "next";
import Link from "next/link";
import Footer from "@/components/Footer";
import { KATEGORI_PAKKER, bundleListPrice, rentalProducts, type RentalProduct } from "@/lib/products";
import { bookHref } from "@/lib/bookUrl";
import { localeAlternates } from "@/lib/hreflang";

export const metadata: Metadata = {
  title: "Party Light Rental Copenhagen — packages from 695 DKK | Lejhøjtaler.dk",
  description:
    "Light rental in Copenhagen: ready-made light packages for teen parties, party tents, weddings and dancefloors from 695 DKK. Everything is plug and play — pick up for free or have it delivered.",
  keywords: [
    "party light rental copenhagen",
    "disco light rental",
    "wedding lights rental copenhagen",
    "party tent lighting rental",
  ],
  alternates: {
    canonical: "https://lejhojtaler.dk/en/lyspakker",
    languages: localeAlternates("/lyspakker"),
  },
  openGraph: {
    title: "Party Light Rental Copenhagen — packages from 695 DKK",
    description:
      "Six ready-made light packages by occasion: teen party, party tent, wedding, dancefloor — or the whole venue. Plug and play, no technician.",
    url: "https://lejhojtaler.dk/en/lyspakker",
    siteName: "Lejhøjtaler.dk",
    locale: "en_GB",
    type: "website",
  },
};

function kr(n: number) {
  return n.toLocaleString("da-DK");
}

const KICKER: Record<string, string> = {
  "pakke_festtelt": "Party tent & garden",
  "pakke_diskolys": "The dancefloor",
  "pakke_teenagefest": "Teen party",
  "pakke_stemningslys": "The whole venue",
  "pakke_bryllupslys": "Wedding",
  "pakke_diskotek": "Venue with smoke alarm",
};

function Card({ p, featured }: { p: RentalProduct; featured: boolean }) {
  const save = bundleListPrice(p) - p.price;
  return (
    <article
      className={`relative flex flex-col rounded-2xl border p-6 transition ${
        featured
          ? "border-brand-500/60 bg-brand-500/[0.07]"
          : "border-white/10 bg-white/[0.03] hover:border-white/25"
      }`}
    >
      {featured && (
        <span className="absolute -top-3 left-6 rounded-full bg-brand-500 px-3 py-0.5 text-xs font-bold text-black">
          Most booked
        </span>
      )}
      <p className="text-xs font-semibold uppercase tracking-widest text-brand-400">{KICKER[p.id]}</p>
      <h3 className="mt-1 text-2xl font-bold">{p.name_en}</h3>
      <p className="mt-2 flex-1 text-sm text-white/60">{p.bundle?.usecase_en ?? p.desc_en}</p>

      <p className="mt-4 text-3xl font-bold">
        {kr(p.price)} DKK
        <span className="ml-1 text-sm font-normal text-white/40">/ weekend</span>
      </p>
      {save > 0 && <p className="mt-1 text-xs font-semibold text-brand-400">Save {kr(save)} DKK vs the parts separately</p>}

      <div className="mt-5 flex gap-2">
        <Link
          href={bookHref(p.id, "en")}
          className={`flex-1 rounded-full px-4 py-2.5 text-center text-sm font-semibold transition ${
            featured ? "bg-brand-500 text-black hover:bg-brand-400" : "border border-white/20 hover:border-white/40"
          }`}
        >
          Book now
        </Link>
      </div>
    </article>
  );
}

export default function LightPackagesPage() {
  const pakker = KATEGORI_PAKKER["/lyspakker"]
    .map((id) => rentalProducts.find((p) => p.id === id)!)
    .filter((p) => p && !p.hidden)
    .sort((a, b) => a.price - b.price);

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://lejhojtaler.dk/en" },
      { "@type": "ListItem", position: 2, name: "Light packages", item: "https://lejhojtaler.dk/en/lyspakker" },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />

      <section className="relative px-4 pb-10 pt-24 text-center">
        <p className="mb-3 text-sm font-medium uppercase tracking-widest text-brand-400">
          Copenhagen · Light rental
        </p>
        <h1 className="mx-auto max-w-3xl text-4xl font-bold sm:text-5xl">
          Party lights — packaged by occasion
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-white/60">
          You don&apos;t need to know what an uplight is. Tell us what you&apos;re hosting — a teen party, a tent in the
          garden, a wedding or just a dancefloor — and the light is already put together. Everything is plug and play on
          normal power.
        </p>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-16">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {pakker.map((p) => (
            <Card key={p.id} p={p} featured={p.id === "pakke_stemningslys"} />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-2xl px-4 pb-24 text-center">
        <h2 className="text-3xl font-bold sm:text-4xl">Ready to light up the party?</h2>
        <p className="mx-auto mt-4 max-w-md text-white/50">
          Book online in 2 minutes. Free pickup in Copenhagen S, or have it delivered and set up.
        </p>
        <a
          href="/en?product=lys#book"
          className="mt-8 inline-block rounded-full bg-brand-500 px-8 py-4 text-lg font-semibold text-black transition hover:bg-brand-400 active:scale-95"
        >
          Book lights now
        </a>
      </section>

      <Footer locale="en" />
    </>
  );
}
