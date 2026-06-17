"use client";

import { useState } from "react";

const faqs = [
  {
    question: "Hvad koster det at leje en højtaler?",
    answer:
      "Vores lille højtalerpakke koster fra 400 kr/weekend og den store fra 700 kr/weekend. Prisen inkluderer alle kabler. Ved kortere leje (1-2 dage) får du rabat.",
  },
  {
    question: "Hvordan fungerer afhentning?",
    answer:
      "Du henter udstyret på vores adresse i København K (Halvtolv 9, 1. th). Alt er pakket i en sportstaske klar til cyklen. Afhentning fredag kl. 14-18, aflevering mandag kl. 15-17.",
  },
  {
    question: "Hvad er inkluderet i prisen?",
    answer:
      "Alle kabler er inkluderet: iPhone med USB-C adapter, AUX-kabel og strømkabel. Den lille pakke inkluderer bæretaske. Den store pakke inkluderer stativer.",
  },
  {
    question: "Kan I levere udstyret?",
    answer:
      "Ja, vi leverer og sætter op i hele Storkøbenhavn for 500 kr. Skriv din adresse i bookingflowet.",
  },
  {
    question: "Skal jeg betale depositum?",
    answer:
      "Nej, der er intet depositum. Du betaler ved afhentning med MobilePay eller kontant.",
  },
  {
    question: "Hvad hvis noget går i stykker?",
    answer:
      "Normal slitage er inkluderet. Ved skader ud over normal brug aftales erstatning efter dialog. Se vores lejevilkår for detaljer.",
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (i: number) => {
    setOpenIndex(openIndex === i ? null : i);
  };

  return (
    <>
      <section id="faq" className="relative z-20 mx-auto max-w-4xl px-4 py-24">
        <h2 className="mb-4 text-center text-3xl font-bold sm:text-4xl">
          Ofte stillede spørgsmål
        </h2>
        <p className="mx-auto mb-16 max-w-2xl text-center text-white/50">
          Alt hvad du skal vide om højtalerudlejning i København
        </p>

        <div className="flex flex-col gap-4">
          {faqs.map((faq, i) => (
            <div key={i} className="glass rounded-2xl">
              <button
                onClick={() => toggle(i)}
                className="flex w-full items-center justify-between p-6 text-left"
              >
                <span className="pr-4 text-lg font-semibold">{faq.question}</span>
                <svg
                  className={`h-5 w-5 shrink-0 text-brand-400 transition-transform duration-300 ${
                    openIndex === i ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              <div
                className={`overflow-hidden transition-all duration-300 ${
                  openIndex === i ? "max-h-96 pb-6" : "max-h-0"
                }`}
              >
                <p className="px-6 text-sm leading-relaxed text-white/70">
                  {faq.answer}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ JSON-LD schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: faqs.map((faq) => ({
              "@type": "Question",
              name: faq.question,
              acceptedAnswer: {
                "@type": "Answer",
                text: faq.answer,
              },
            })),
          }),
        }}
      />
    </>
  );
}
