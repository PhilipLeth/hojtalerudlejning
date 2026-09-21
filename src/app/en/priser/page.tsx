import type { Metadata } from "next";
import Link from "next/link";
import { localeAlternates } from "@/lib/hreflang";
import Footer from "@/components/Footer";
import PriceTable from "@/components/PriceTable";
import PickupSummary from "@/components/PickupSummary";
import { MAX_RENTAL_DAYS } from "@/lib/productFaq";

export const metadata: Metadata = {
  title: "Rental prices | Speakers, lights and AV in Copenhagen | Lejhøjtaler.dk",
  description:
    "The full price list in one place: speakers, party packages, lighting, smoke, microphones, screens, sound engineer and DJ. Same price for 1 or 5 days, no deposit.",
  keywords: ["speaker rental prices copenhagen", "how much does it cost to rent a speaker", "sound system rental price", "av rental price list"],
  alternates: { canonical: "https://lejhojtaler.dk/en/priser", languages: localeAlternates("/priser") },
};

const terms = [
  {
    title: `Same price for 1 to ${MAX_RENTAL_DAYS} days`,
    body: "The price covers the whole rental period, not each day. Most people collect on Friday and return on Monday.",
  },
  {
    title: "Cables and stands are included",
    body: "You do not need to buy or bring anything yourself. Each product page lists what comes with it.",
  },
  {
    title: "No deposit",
    body: "You pay the rental, not a security on top. In return you are liable for the gear while you have it.",
  },
  {
    title: "Pay by card or on collection",
    body: "Pay online when you book, or when you pick the equipment up.",
  },
];

export default function PricesPage() {
  return (
    <main className="bg-white text-slate-900">
      <section className="mx-auto max-w-4xl px-5 pt-16">
        <p className="text-sm font-semibold uppercase tracking-widest text-brand-600">Price list · Copenhagen</p>
        <h1 className="mt-4 text-4xl font-bold sm:text-5xl">What does it cost to rent?</h1>
        <p className="mt-6 max-w-2xl text-lg text-slate-600">
          Every item we rent out, with the price you pay in the booking — speakers, ready-made party packages, lighting,
          smoke, microphones, screens and staff. Prices include VAT and cover the whole rental period.
        </p>
        <PickupSummary locale="en" className="mt-4 text-sm text-slate-500" />
        <div className="mt-8 flex flex-wrap gap-4">
          <Link href="/en#book" className="rounded-lg bg-brand-600 px-6 py-3 font-semibold text-white">
            Check available dates
          </Link>
          <Link href="/en/levering" className="self-center font-semibold text-brand-600">
            Delivery and collection →
          </Link>
        </div>
      </section>

      <section className="mx-auto mt-12 max-w-4xl px-5">
        <div className="grid gap-4 sm:grid-cols-2">
          {terms.map((v) => (
            <div key={v.title} className="rounded-xl border border-slate-200 p-5">
              <h2 className="font-semibold">{v.title}</h2>
              <p className="mt-2 text-sm text-slate-600">{v.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto mt-16 max-w-4xl px-5 pb-16">
        <PriceTable locale="en" />
        <p className="mt-10 text-sm text-slate-500">
          Bigger party than our packages cover, or a venue we do not know?{" "}
          <Link href="/en/kontakt" className="font-semibold text-brand-600">
            Write to us
          </Link>{" "}
          with the date, the place and the number of guests, and you will get one quote for the lot. The rental terms are
          in our{" "}
          <Link href="/en/lejevilkaar" className="font-semibold text-brand-600">
            rental terms
          </Link>
          .
        </p>
      </section>

      <Footer locale="en" />
    </main>
  );
}
