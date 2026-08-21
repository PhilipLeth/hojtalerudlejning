import { LiveCopy } from "@/components/PhoneLink";

export interface FaqItem {
  q: string;
  a: string;
}

/**
 * Spørgsmål og svar — synligt på siden OG som FAQPage-markup.
 *
 * Skrevet fordi de fandtes hver for sig: forsiden har sin egen FAQ i en
 * klientkomponent (FAQ.tsx), lejlighedssiderne havde en kopi inde i
 * OccasionLanding, og de 30 produktsider havde ingen. Svarmaskiner (AI
 * Overviews, ChatGPT-søgning, Perplexity) citerer netop spørgsmål-svar-
 * formatet, så en produktside uden ét eneste spørgsmål har intet at blive
 * citeret for.
 *
 * Filen hedder FaqSection og ikke Faq, fordi macOS' filsystem ikke skelner
 * mellem store og små bogstaver: src/components/Faq.tsx ville være den samme
 * fil som FAQ.tsx og overskrive forsidens FAQ.
 *
 * Bevidst <details> og ikke en useState-accordion: teksten står i den statiske
 * HTML og er læsbar uden JavaScript. Crawlere fra svarmaskinerne kører ikke
 * JavaScript — et svar der først findes efter hydrering, findes ikke.
 *
 * Én FAQPage pr. side. Har siden allerede en, skal den ikke også have denne —
 * se faq-markup.test.ts, der fejler ved dubletter.
 */
export default function FaqSection({
  items,
  title = "Ofte stillede spørgsmål",
  className = "mx-auto max-w-3xl px-4 pb-20",
}: {
  items: FaqItem[];
  title?: string;
  className?: string;
}) {
  if (items.length === 0) return null;

  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />

      <section className={className}>
        <h2 className="mb-8 text-center text-2xl font-bold sm:text-3xl">{title}</h2>
        <div className="space-y-3">
          {items.map((f) => (
            <details key={f.q} className="group rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <summary className="cursor-pointer list-none font-semibold text-white marker:hidden">
                <span className="flex items-start justify-between gap-4">
                  {f.q}
                  <span className="mt-1 shrink-0 text-brand-400 transition group-open:rotate-45">+</span>
                </span>
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-white/50">
                <LiveCopy text={f.a} />
              </p>
            </details>
          ))}
        </div>
      </section>
    </>
  );
}
