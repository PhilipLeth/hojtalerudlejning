import type { Metadata } from "next";
import Link from "next/link";
import { localeAlternates } from "@/lib/hreflang";
import Footer from "@/components/Footer";
import LivePrice from "@/components/LivePrice";
import PickupSummary from "@/components/PickupSummary";
import PhoneLink from "@/components/PhoneLink";

export const metadata: Metadata = {
  title: "Delivery and collection | Sound and lighting in Copenhagen | Lejhøjtaler.dk",
  description:
    "Collect it yourself in Amager, or have the gear delivered and set up anywhere in Copenhagen. See what delivery costs, what setup covers and how to choose it when you book.",
  keywords: ["speaker rental delivery copenhagen", "sound system delivered and set up", "av delivery copenhagen", "party equipment delivery"],
  alternates: { canonical: "https://lejhojtaler.dk/en/levering", languages: localeAlternates("/levering") },
};

export default function DeliveryPage() {
  return (
    <main className="bg-white text-slate-900">
      <section className="mx-auto max-w-4xl px-5 pt-16">
        <p className="text-sm font-semibold uppercase tracking-widest text-brand-600">Delivery · Copenhagen</p>
        <h1 className="mt-4 text-4xl font-bold sm:text-5xl">Collect it yourself, or let us drive</h1>
        <p className="mt-6 max-w-2xl text-lg text-slate-600">
          You can pick the equipment up from us and return it after the party — that costs nothing. If you have no car,
          or you would rather not spend the afternoon setting up, we drive anywhere in Copenhagen and set it up ready to
          use.
        </p>
        <PickupSummary locale="en" className="mt-4 text-sm text-slate-500" />
      </section>

      <section className="mx-auto mt-12 max-w-4xl px-5">
        <h2 className="text-2xl font-bold">Three ways to get the gear</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-200 p-5">
            <h3 className="font-semibold">You collect it</h3>
            <p className="mt-2 text-sm text-slate-600">
              Pick it up from us and bring it back after the party. Most of it fits in an ordinary car, and the smaller
              items travel fine by bike.
            </p>
            <p className="mt-3 font-semibold">Free</p>
          </div>
          <div className="rounded-xl border border-slate-200 p-5">
            <h3 className="font-semibold">We deliver and set up</h3>
            <p className="mt-2 text-sm text-slate-600">
              We drive out, set everything up and plug it in, so all you do is switch it on. You return it yourself.
            </p>
            <p className="mt-3 font-semibold">
              <LivePrice productId="levering_ud" prefix="" suffix=" DKK" />
            </p>
          </div>
          <div className="rounded-xl border-2 border-brand-600 p-5">
            <h3 className="font-semibold">Both ways</h3>
            <p className="mt-2 text-sm text-slate-600">
              We deliver, set up and collect everything again after the party. You never have to drive.
            </p>
            <p className="mt-3 font-semibold">
              <LivePrice productId="levering_begge" prefix="" suffix=" DKK" />
            </p>
          </div>
        </div>
        <p className="mt-4 text-sm text-slate-500">
          If you can collect it but not return it, we can do just the trip back for{" "}
          <LivePrice productId="afhentning_retur" prefix="" suffix=" DKK" />. All three options are in the booking under
          &quot;Delivery and collection&quot;, where you also give us the address.
        </p>
      </section>

      <section className="mx-auto mt-16 max-w-4xl px-5">
        <h2 className="text-2xl font-bold">What setup covers</h2>
        <ul className="mt-5 space-y-3 text-slate-600">
          <li className="border-b border-slate-200 pb-3">
            We place the speakers, stands and lights where you want them and run the cables.
          </li>
          <li className="border-b border-slate-200 pb-3">
            We connect everything and test the sound, so you can play music from a phone or laptop straight away.
          </li>
          <li className="border-b border-slate-200 pb-3">
            We show you how to work the microphone and the lights before we leave.
          </li>
          <li>
            If you want someone to stay and run the sound during the event, that is a sound engineer — see{" "}
            <Link href="/en/lydmand" className="font-semibold text-brand-600">
              sound engineer
            </Link>
            .
          </li>
        </ul>
      </section>

      <section className="mx-auto mt-16 max-w-4xl px-5">
        <h2 className="text-2xl font-bold">Area and timing</h2>
        <p className="mt-4 text-slate-600">
          We drive anywhere in Copenhagen. If your party is further out, call us on{" "}
          <PhoneLink className="font-semibold text-brand-600" /> before you book, and we will tell you whether we can
          make it and what the trip costs. We agree the time once the booking is in — tell us in the booking when you
          need it and when the party ends.
        </p>
        <div className="mt-8 flex flex-wrap gap-4">
          <Link href="/en#book" className="rounded-lg bg-brand-600 px-6 py-3 font-semibold text-white">
            Book with delivery
          </Link>
          <Link href="/en/priser" className="self-center font-semibold text-brand-600">
            See all prices →
          </Link>
        </div>
        <p className="mt-10 pb-16 text-sm text-slate-500">
          The rules on rental period, cancellation and liability are in our{" "}
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
