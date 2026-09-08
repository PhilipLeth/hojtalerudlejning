import { Metadata } from "next";
import ContactForm from "@/components/ContactForm";
import PhoneLink, { PhoneText } from "@/components/PhoneLink";
import PickupSummary from "@/components/PickupSummary";
import { CompanyEmail } from "@/components/CompanyInfo";
import LocalBusinessJsonLd from "@/components/LocalBusinessJsonLd";
import { localeAlternates } from "@/lib/hreflang";

export const metadata: Metadata = {
  title: "Contact us | Lejhøjtaler.dk",
  description:
    "Contact Lejhøjtaler.dk — write to info@lejhojtaler.dk, call, or use the form. We usually reply the same day, and we speak English.",
  alternates: {
    canonical: "https://lejhojtaler.dk/en/kontakt",
    languages: localeAlternates("/kontakt"),
  },
};

export default function Page() {
  return (
    <>
      <LocalBusinessJsonLd />
      <section className="mx-auto max-w-2xl px-4 py-16">
        <h1 className="text-4xl font-bold">Contact us</h1>
        <p className="mt-3 text-white/60">
          A question about equipment, dates or something else entirely? Write or call — we usually reply the same day,
          and everything can be handled in English.
        </p>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <a
            href="mailto:info@lejhojtaler.dk"
            className="glass flex items-center gap-3 rounded-2xl p-4 transition hover:bg-white/5"
          >
            <span className="text-2xl">✉️</span>
            <span>
              <span className="block text-sm text-white/50">Email</span>
              <span className="font-semibold text-brand-400"><CompanyEmail /></span>
            </span>
          </a>
          <PhoneLink hideNumber className="glass flex items-center gap-3 rounded-2xl p-4 transition hover:bg-white/5">
            <span className="text-2xl">📞</span>
            <span>
              <span className="block text-sm text-white/50">Phone</span>
              <span className="font-semibold text-brand-400">
                <PhoneText />
              </span>
            </span>
          </PhoneLink>
        </div>

        <div className="mt-8">
          <ContactForm locale="en" />
        </div>

        <PickupSummary locale="en" className="mt-8 text-sm text-white/40" withCvr />
      </section>
    </>
  );
}
