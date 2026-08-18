import type { Metadata } from "next";
import Link from "next/link";
import { localeAlternates } from "@/lib/hreflang";
import SiteText from "@/components/SiteText";

export const metadata: Metadata = {
  title: "Rental Terms | Lejhøjtaler.dk",
  description:
    "Rental terms for speaker, lighting and PA system hire at Lejhøjtaler.dk. Read about prices, rental periods, pickup, return and liability.",
  alternates: {
    canonical: "https://lejhojtaler.dk/en/lejevilkaar",
    languages: localeAlternates("/lejevilkaar"),
  },
};

const sections = [
  {
    title: "1. Rental period and prices",
    content: `The standard rental period is one weekend (Friday to Monday, 3 days). The rental period can be extended up to 5 days with the following price multipliers:

- 1 day: 80% of weekend price
- 2 days: 90% of weekend price
- 3 days (weekend): 100% (standard price)
- 4 days: 120% of weekend price
- 5 days: 140% of weekend price

Current prices are shown in the booking form on the front page.`,
  },
  {
    title: "2. Deposit",
    content: `No deposit or security is charged. However, the renter is fully liable for all rented equipment from pickup to return, cf. section 3.`,
  },
  {
    title: "3. Damage and compensation",
    content: `The renter replaces damaged, lost or stolen equipment at replacement cost. Normal wear and tear (scratches, marks from normal use) is acceptable and covered by the rental company. In case of damage, contact us as soon as possible.`,
  },
  {
    title: "4. Late return",
    content: `For late returns, a fee of 200 DKK per commenced day beyond the agreed return date is charged. If the equipment cannot be returned at the agreed time, the renter must notify us as soon as possible.`,
  },
  {
    title: "5. Cancellation",
    content: `The booking can be cancelled free of charge up to 24 hours before the agreed pickup time. For cancellations later than 24 hours before pickup, 50% of the total rental price is charged.`,
  },
  {
    title: "6. Renter's responsibilities",
    content: `The renter agrees to:

- Handle the equipment responsibly and in accordance with its purpose
- Not sublease or lend the equipment to third parties
- Not expose the equipment to rain, water, sand or other harmful conditions
- Return the equipment in the same condition as at pickup (normal wear excepted)
- Ensure the equipment is stored safely during the rental period`,
  },
  {
    title: "7. Rental company's responsibilities",
    content: `The rental company guarantees that the equipment is functional and in good condition at pickup. If the equipment proves to be defective at pickup or during normal use, the rental company offers replacement equipment or a full refund of the rental amount.`,
  },
  {
    title: "8. Pickup and return",
    content: `Equipment is picked up and returned at:

{{afhentningsadresse}}

{{aabningstider}}
{{gebyr}}

Equipment is delivered with all necessary cables.`,
  },
  {
    title: "9. Payment",
    content: `Payment is made online by card at booking (via Stripe) or at pickup by arrangement. The price is the total price shown in the booking confirmation.`,
  },
  {
    title: "10. Privacy policy",
    content: `We store your name, email address and phone number solely for the purpose of handling your booking and communicating about pickup/return. Your information is not shared with third parties and is deleted after the rental period ends, unless there is an unresolved case (e.g. damage assessment).`,
  },
];

export default function RentalTermsEn() {
  return (
    <main className="min-h-screen bg-[#07060b]">
      {/* Header */}
      <div className="mx-auto max-w-3xl px-4 pt-16 pb-8">
        <Link
          href="/en#book"
          className="inline-flex items-center gap-2 text-sm text-brand-400 hover:text-brand-300 transition mb-8"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back to booking
        </Link>

        <h1 className="text-4xl font-bold sm:text-5xl">Rental Terms</h1>
        <p className="mt-4 text-lg text-white/50">
          Terms for renting speakers, lighting and accessories at
          Lejhøjtaler.dk
        </p>
      </div>

      {/* Sections */}
      <div className="mx-auto max-w-3xl px-4 pb-24 space-y-6">
        {sections.map((section, i) => (
          <div key={i} className="glass rounded-2xl p-6 sm:p-8">
            <h2 className="text-xl font-semibold mb-4">{section.title}</h2>
            <div className="text-sm leading-relaxed text-white/60 whitespace-pre-line">
              <SiteText locale="en">{section.content}</SiteText>
            </div>
          </div>
        ))}

        {/* Business info */}
        <div className="glass rounded-2xl p-6 sm:p-8">
          <h2 className="text-xl font-semibold mb-4">Rental company</h2>
          <div className="text-sm leading-relaxed text-white/60 space-y-1">
            <p className="font-medium text-white/80"><SiteText locale="en">{"{{firma}}"}</SiteText></p>
            <p>CVR: <SiteText locale="en">{"{{cvr}}"}</SiteText></p>
            <p><SiteText locale="en">{"{{vej}}"}</SiteText></p>
            <p><SiteText locale="en">{"{{postby}}"}</SiteText></p>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center pt-8">
          <Link
            href="/en#book"
            className="inline-flex rounded-xl bg-brand-500 px-8 py-3.5 font-semibold text-black transition hover:bg-brand-400 active:scale-95"
          >
            Book now
          </Link>
          <p className="mt-3 text-sm text-white/30">
            Booking takes less than 2 minutes
          </p>
        </div>
      </div>

      {/* JSON-LD Breadcrumb */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              {
                "@type": "ListItem",
                position: 1,
                name: "Home",
                item: "https://lejhojtaler.dk/en",
              },
              {
                "@type": "ListItem",
                position: 2,
                name: "Rental Terms",
                item: "https://lejhojtaler.dk/en/lejevilkaar",
              },
            ],
          }),
        }}
      />
    </main>
  );
}
