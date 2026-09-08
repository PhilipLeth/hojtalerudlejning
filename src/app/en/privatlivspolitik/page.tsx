import { Metadata } from "next";
import Link from "next/link";
import Footer from "@/components/Footer";
import PhoneLink from "@/components/PhoneLink";
import SiteText from "@/components/SiteText";
import { CompanyEmailLink } from "@/components/CompanyInfo";
import { localeAlternates } from "@/lib/hreflang";

/**
 * /en/privatlivspolitik — privatlivspolitikken på engelsk.
 *
 * Juridisk tekst oversættes ikke løst: paragrafhenvisningerne peger stadig på
 * databeskyttelsesforordningen (GDPR) med samme artikler, og Datatilsynet står
 * med sit danske navn, fordi det er den myndighed, man rent faktisk klager til.
 * Den danske udgave er den bindende — det står nederst på siden.
 */
export const metadata: Metadata = {
  title: "Privacy Policy | Lejhøjtaler.dk",
  description:
    "How Lejhøjtaler.dk handles your personal data: what we collect, why, how long we keep it, and what rights you have under the GDPR.",
  alternates: {
    canonical: "https://lejhojtaler.dk/en/privatlivspolitik",
    languages: localeAlternates("/privatlivspolitik"),
  },
  robots: { index: true, follow: true },
};

const UPDATED = "5 August 2026";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="mb-3 text-xl font-bold text-white sm:text-2xl">{title}</h2>
      <div className="space-y-3 text-white/60">{children}</div>
    </section>
  );
}

export default function Page() {
  return (
    <>
      <main className="relative z-20 min-h-screen bg-[#07060b]">
        <div className="mx-auto max-w-3xl px-4 py-20">
          <p className="mb-3 text-sm font-medium uppercase tracking-widest text-brand-400">
            Lejhøjtaler.dk
          </p>
          <h1 className="text-4xl font-bold sm:text-5xl">Privacy Policy</h1>
          <p className="mt-4 text-white/40">Last updated {UPDATED}</p>

          <div className="mt-12">
            <Section title="Who is the data controller?">
              <p>
                <SiteText>{"{{firma}} (CVR {{cvr}}), {{firmaadresse}}, is the data controller for the personal data you give us on lejhojtaler.dk."}</SiteText>
              </p>
              <p>
                If you have questions about how we handle your data, write to{" "}
                <CompanyEmailLink className="text-brand-400 hover:underline" />{" "}
                or call{" "}
                <PhoneLink className="text-brand-400 hover:underline" />
                .
              </p>
            </Section>

            <Section title="What data do we collect?">
              <p>When you book equipment, we ask for:</p>
              <ul className="ml-5 list-disc space-y-1">
                <li>Name, email address and phone number</li>
                <li>Delivery address, if you choose delivery</li>
                <li>Your order: equipment, dates and any comment</li>
              </ul>
              <p>
                If you pay online, your card details are handled by Stripe. We never see or
                store your card number.
              </p>
              <p>
                We also use Google Analytics and Google Tag Manager for statistics about how
                the site is used. That data is not linked to your name.
              </p>
            </Section>

            <Section title="Why, and on what legal basis?">
              <ul className="ml-5 list-disc space-y-2">
                <li>
                  <strong className="text-white/80">To carry out your booking</strong> — name,
                  contact details and order. Basis: performance of the contract with you
                  (GDPR art. 6(1)(b)).
                </li>
                <li>
                  <strong className="text-white/80">To send you confirmation and practical
                  information</strong> about collection and return. Basis: the contract with you.
                </li>
                <li>
                  <strong className="text-white/80">To keep accounts for the rental
                  agreement</strong>. Basis: legal obligation under the Danish Bookkeeping Act
                  (art. 6(1)(c)).
                </li>
                <li>
                  <strong className="text-white/80">To send newsletters and offers</strong> — only
                  if you actively ticked the box. Basis: your consent (art. 6(1)(a)). You can
                  withdraw your consent at any time.
                </li>
                <li>
                  <strong className="text-white/80">To ask you for a review</strong> after the
                  rental has ended. Basis: our legitimate interest in getting feedback
                  (art. 6(1)(f)).
                </li>
              </ul>
            </Section>

            <Section title="How long do we keep your data?">
              <ul className="ml-5 list-disc space-y-1">
                <li>Bookings and rental agreements: 5 years after the end of the financial year (Bookkeeping Act)</li>
                <li>Enquiries by email and phone: up to 2 years</li>
                <li>Newsletter: until you unsubscribe</li>
              </ul>
            </Section>

            <Section title="Who do we share data with?">
              <p>
                We never sell your data. We use the following processors, who may only handle
                data on our instructions:
              </p>
              <ul className="ml-5 list-disc space-y-1">
                <li>Cloudflare — hosting and operation of the site</li>
                <li>Resend — sending confirmation and service emails</li>
                <li>Stripe — payment processing, if you pay online</li>
                <li>Google — statistics about how the site is used</li>
              </ul>
            </Section>

            <Section title="Your rights">
              <p>Under the GDPR you have the right to:</p>
              <ul className="ml-5 list-disc space-y-1">
                <li>Access the data we hold about you</li>
                <li>Have incorrect data corrected</li>
                <li>Have your data erased once we are no longer required to keep it</li>
                <li>Object to the processing</li>
                <li>Receive your data in a common format (data portability)</li>
                <li>Withdraw a consent — which does not affect processing up to that point</li>
              </ul>
              <p>
                Write to{" "}
                <CompanyEmailLink className="text-brand-400 hover:underline" />
                {" "}and we will reply within a month.
              </p>
            </Section>

            <Section title="Complaints">
              <p>
                If you are unhappy with how we handle your data, you can complain to the Danish
                Data Protection Agency (Datatilsynet), Carl Jacobsens Vej 35, 2500 Valby —{" "}
                <a
                  href="https://www.datatilsynet.dk"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand-400 hover:underline"
                >
                  datatilsynet.dk
                </a>
                .
              </p>
            </Section>

            <p className="mt-12 text-sm text-white/40">
              See also our{" "}
              <Link href="/en/lejevilkaar" className="text-brand-400 hover:underline">
                rental terms
              </Link>
              . This is a translation for convenience; the Danish version is the binding one.
            </p>
          </div>
        </div>

        <Footer locale="en" />
      </main>
    </>
  );
}
