"use client";

import { useState } from "react";
import { useSiteSettings } from "@/lib/useSiteSettings";
import { formatSentence } from "@/lib/openingHours";

const faqs = [
  {
    question: "Hvad koster det at leje en højtaler?",
    answer:
      "Vores batteridrevne Mackie Thump GO koster 345 kr/weekend, den lille højtalerpakke 395 kr, den store højtalerpakke 495 kr og Soundboks 4 595 kr. Prisen er den samme uanset antal dage (1-5), og alle kabler er inkluderet.",
  },
  {
    question: "Hvordan fungerer afhentning?",
    answer:
      "Du henter udstyret hos os på ADRESSE. Alle kabler følger med, og en bæretaske kan tilkøbes. AABNINGSTIDER",
  },
  {
    question: "Hvad er inkluderet i prisen?",
    answer:
      "Alle kabler er inkluderet: iPhone med USB-C adapter, AUX-kabel og strømkabel. Bæretaske (95 kr) og højtalerstativer (100 kr) er tilkøb, du vælger i bookingen.",
  },
  {
    question: "Kan I levere udstyret?",
    answer:
      "Ja — vi kører ud i hele København. Levering + opsætning koster 495 kr, hvor vi sætter op klar til brug og du selv afleverer bagefter. Skal vi også hente igen efter festen, koster begge veje 795 kr. Skriv din adresse i bookingflowet, så klarer vi resten.",
  },
  {
    question: "Kan jeg leje en højtaler uden strøm?",
    answer:
      "Ja! Vores Mackie Thump GO og Soundboks er batteridrevne med op til 12 timers spilletid — perfekte til parken, stranden eller baggården, hvor der ikke er en stikkontakt.",
  },
  {
    question: "Kan jeg ringe og høre mere?",
    answer:
      "Selvfølgelig! Ring til os på PHONE — vi svarer gerne på spørgsmål om udstyr, levering eller din booking. Du kan betale sikkert online med kort, eller vælge at betale ved afhentning.",
  },
  {
    question: "Hvad hvis noget går i stykker?",
    answer:
      "Normal slitage er inkluderet. Ved skader ud over normal brug aftales erstatning efter dialog. Se vores lejevilkår for detaljer.",
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const { display, hours, pickupAddress } = useSiteSettings();
  // Tiderne må ikke stå som tekst her — så ville de modsige footeren dagen efter
  // Frederik retter dem i /admin/indstillinger
  const fill = (answer: string) =>
    answer
      .replaceAll("PHONE", display)
      .replaceAll("ADRESSE", pickupAddress)
      .replaceAll("AABNINGSTIDER", formatSentence(hours))
      .replace(/\s+/g, " ")
      .trim();

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
                  {fill(faq.answer)}
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
                text: fill(faq.answer),
              },
            })),
          }),
        }}
      />
    </>
  );
}
